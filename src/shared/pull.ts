import { spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export type SelectedMetadata = {
  sourceDirs: string[];
  metadataNames: string[];
};

type SfdxProject = {
  packageDirectories?: Array<{
    path?: string;
  }>;
};

type ChildProcessResult = {
  stdout: string;
  exitCode: number;
};

type MetadataListResult = {
  result?: MetadataListComponent[] | MetadataListComponent;
};

type MetadataListComponent = {
  fullName?: string;
};

type SupportedMetadataType = {
  metadataType: string;
  localFullName: (path: string) => string | undefined;
};

const ignoredDirectoryNames = new Set(['.git', 'node_modules', '.sfdx', '.sf']);

const supportedMetadataTypes: SupportedMetadataType[] = [
  { metadataType: 'ApexClass', localFullName: (path) => getFileNameForPath(path, '/classes/', '.cls') },
  { metadataType: 'ApexTrigger', localFullName: (path) => getFileNameForPath(path, '/triggers/', '.trigger') },
  { metadataType: 'AuraDefinitionBundle', localFullName: (path) => getFolderNameForPath(path, '/aura/') },
  { metadataType: 'LightningComponentBundle', localFullName: (path) => getFolderNameForPath(path, '/lwc/') },
  { metadataType: 'Flow', localFullName: (path) => getFileNameForPath(path, '/flows/', '.flow-meta.xml') },
  { metadataType: 'CustomObject', localFullName: (path) => getCustomObjectNameForPath(path) },
  { metadataType: 'CustomField', localFullName: (path) => getObjectChildNameForPath(path, '/fields/', '.field-meta.xml') },
  { metadataType: 'RecordType', localFullName: (path) => getObjectChildNameForPath(path, '/recordTypes/', '.recordType-meta.xml') },
  {
    metadataType: 'ValidationRule',
    localFullName: (path) => getObjectChildNameForPath(path, '/validationRules/', '.validationRule-meta.xml'),
  },
  { metadataType: 'Layout', localFullName: (path) => getFileNameForPath(path, '/layouts/', '.layout-meta.xml') },
  { metadataType: 'PermissionSet', localFullName: (path) => getFileNameForPath(path, '/permissionsets/', '.permissionset-meta.xml') },
  { metadataType: 'Profile', localFullName: (path) => getFileNameForPath(path, '/profiles/', '.profile-meta.xml') },
  { metadataType: 'CustomApplication', localFullName: (path) => getFileNameForPath(path, '/applications/', '.app-meta.xml') },
  { metadataType: 'CustomTab', localFullName: (path) => getFileNameForPath(path, '/tabs/', '.tab-meta.xml') },
  { metadataType: 'StaticResource', localFullName: (path) => getFileNameForPath(path, '/staticresources/', '.resource-meta.xml') },
  { metadataType: 'CustomMetadata', localFullName: (path) => getFileNameForPath(path, '/customMetadata/', '.md-meta.xml') },
  { metadataType: 'DuplicateRule', localFullName: (path) => getFileNameForPath(path, '/duplicateRules/', '.duplicateRule-meta.xml') },
  { metadataType: 'FlexiPage', localFullName: (path) => getFileNameForPath(path, '/flexipages/', '.flexipage-meta.xml') },
  { metadataType: 'GlobalValueSet', localFullName: (path) => getFileNameForPath(path, '/globalValueSets/', '.globalValueSet-meta.xml') },
  { metadataType: 'Group', localFullName: (path) => getFileNameForPath(path, '/groups/', '.group-meta.xml') },
  { metadataType: 'HomePageLayout', localFullName: (path) => getFileNameForPath(path, '/homePageLayouts/', '.homePageLayout-meta.xml') },
  {
    metadataType: 'PermissionSetGroup',
    localFullName: (path) => getFileNameForPath(path, '/permissionSetGroups/', '.permissionsetgroup-meta.xml'),
  },
  { metadataType: 'Queue', localFullName: (path) => getFileNameForPath(path, '/queues/', '.queue-meta.xml') },
  { metadataType: 'QuickAction', localFullName: (path) => getQuickActionNameForPath(path) },
  { metadataType: 'Role', localFullName: (path) => getFileNameForPath(path, '/roles/', '.role-meta.xml') },
  { metadataType: 'SharingRules', localFullName: (path) => getFileNameForPath(path, '/sharingRules/', '.sharingRules-meta.xml') },
  { metadataType: 'StandardValueSet', localFullName: (path) => getFileNameForPath(path, '/standardValueSets/', '.standardValueSet-meta.xml') },
];

export const getExistingPackageDirectoryPaths = (projectRoot: string): string[] =>
  getPackageDirectoryPaths(projectRoot).filter((packageDirectoryPath) => existsSync(join(projectRoot, packageDirectoryPath)));

export const getMetadataPaths = (projectRoot: string): string[] => {
  const packageDirectoryPaths = getExistingPackageDirectoryPaths(projectRoot);
  const metadataPaths = new Set<string>();

  for (const packageDirectoryPath of packageDirectoryPaths) {
    metadataPaths.add(packageDirectoryPath);
    collectPaths(projectRoot, packageDirectoryPath, metadataPaths);
  }

  return Array.from(metadataPaths).sort((left, right) => left.localeCompare(right));
};

export const selectItems = async (items: string[]): Promise<string[]> => {
  const result = await runChildProcess('fzf', ['--multi'], {
    input: items.join('\n'),
    stderr: 'inherit',
  });

  const selectedItems = result.stdout
    .split('\n')
    .map((selectedItem) => selectedItem.trim())
    .filter((selectedItem) => selectedItem.length > 0);

  if (result.exitCode !== 0) {
    return [];
  }

  return selectedItems;
};

export const getOrgOnlyMetadataNames = async (projectRoot: string, targetOrg?: string): Promise<string[]> => {
  const localMetadataNames = getLocalMetadataNames(getMetadataPaths(projectRoot));
  const orgMetadataNames = new Set<string>();
  const metadataByType = await Promise.all(
    supportedMetadataTypes.map(async (supportedMetadataType) => ({
      metadataType: supportedMetadataType.metadataType,
      components: await listOrgMetadata(supportedMetadataType.metadataType, targetOrg),
    }))
  );

  for (const metadataTypeResult of metadataByType) {
    for (const component of metadataTypeResult.components) {
      if (component.fullName == null || component.fullName.length === 0) {
        continue;
      }

      const metadataName = formatMetadataName(metadataTypeResult.metadataType, component.fullName);

      if (!localMetadataNames.has(metadataName)) {
        orgMetadataNames.add(metadataName);
      }
    }
  }

  return Array.from(orgMetadataNames).sort((left, right) => left.localeCompare(right));
};

export const retrieveSourceDirs = async (sourceDirs: string[], targetOrg?: string): Promise<number> => {
  const args = ['project', 'retrieve', 'start'];

  if (targetOrg != null && targetOrg.length > 0) {
    args.push('--target-org', targetOrg);
  }

  for (const sourceDir of sourceDirs) {
    args.push('--source-dir', sourceDir);
  }

  return runRetrieveCommand(args);
};

export const retrieveMetadataNames = async (metadataNames: string[], targetOrg?: string): Promise<number> => {
  const args = ['project', 'retrieve', 'start'];

  if (targetOrg != null && targetOrg.length > 0) {
    args.push('--target-org', targetOrg);
  }

  for (const metadataName of metadataNames) {
    args.push('--metadata', metadataName);
  }

  return runRetrieveCommand(args);
};

const listOrgMetadata = async (metadataType: string, targetOrg?: string): Promise<MetadataListComponent[]> => {
  const args = ['org', 'list', 'metadata', '--metadata-type', metadataType, '--json'];

  if (targetOrg != null && targetOrg.length > 0) {
    args.push('--target-org', targetOrg);
  }

  const result = await runSfCommand(args, {
    stderr: 'pipe',
  });

  if (result.exitCode !== 0) {
    return [];
  }

  const parsedResult = JSON.parse(result.stdout) as MetadataListResult;
  const components = parsedResult.result;

  if (components == null) {
    return [];
  }

  return Array.isArray(components) ? components : [components];
};

const runRetrieveCommand = async (args: string[]): Promise<number> => {
  const result = await runSfCommand(args, {
    stdout: 'inherit',
    stderr: 'inherit',
  });

  return result.exitCode;
};

const runSfCommand = async (
  args: string[],
  options: {
    stdout?: 'inherit';
    stderr?: 'inherit' | 'pipe';
  } = {}
): Promise<ChildProcessResult> => runChildProcess(process.env.SF_BINPATH ?? 'sf', args, options);

const runChildProcess = async (
  command: string,
  args: string[],
  options: {
    input?: string;
    stdout?: 'inherit';
    stderr?: 'inherit' | 'pipe';
  } = {}
): Promise<ChildProcessResult> =>
  new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, {
      stdio: ['pipe', options.stdout === 'inherit' ? 'inherit' : 'pipe', options.stderr === 'inherit' ? 'inherit' : 'pipe'],
      env: process.env,
    });

    let stdout = '';

    childProcess.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    childProcess.on('error', (error) => {
      reject(error);
    });

    childProcess.on('close', (code) => {
      resolve({
        stdout,
        exitCode: code ?? 0,
      });
    });

    if (options.input != null) {
      childProcess.stdin?.write(options.input);
    }

    childProcess.stdin?.end();
  });

const getLocalMetadataNames = (metadataPaths: string[]): Set<string> => {
  const localMetadataNames = new Set<string>();

  for (const metadataPath of metadataPaths) {
    const normalizedPath = normalizePath(metadataPath);

    for (const supportedMetadataType of supportedMetadataTypes) {
      const fullName = supportedMetadataType.localFullName(normalizedPath);

      if (fullName != null) {
        localMetadataNames.add(formatMetadataName(supportedMetadataType.metadataType, fullName));
      }
    }
  }

  return localMetadataNames;
};

const formatMetadataName = (metadataType: string, fullName: string): string => `${metadataType}:${fullName}`;

const normalizePath = (path: string): string => path.replace(/\\/g, '/');

const getFileNameForPath = (path: string, directory: string, suffix: string): string | undefined => {
  if (!path.includes(directory) || !path.endsWith(suffix)) {
    return undefined;
  }

  return path.slice(path.lastIndexOf('/') + 1, -suffix.length);
};

const getFolderNameForPath = (path: string, directory: string): string | undefined => {
  const directoryIndex = path.indexOf(directory);

  if (directoryIndex === -1) {
    return undefined;
  }

  const pathAfterDirectory = path.slice(directoryIndex + directory.length);
  const folderName = pathAfterDirectory.split('/')[0];

  return folderName.length > 0 ? folderName : undefined;
};

const getCustomObjectNameForPath = (path: string): string | undefined => {
  const objectName = getFolderNameForPath(path, '/objects/');

  if (objectName == null || !path.endsWith(`${objectName}.object-meta.xml`)) {
    return undefined;
  }

  return objectName;
};

const getObjectChildNameForPath = (path: string, childDirectory: string, suffix: string): string | undefined => {
  const objectName = getFolderNameForPath(path, '/objects/');
  const childName = getFileNameForPath(path, childDirectory, suffix);

  if (objectName == null || childName == null) {
    return undefined;
  }

  return `${objectName}.${childName}`;
};

const getQuickActionNameForPath = (path: string): string | undefined =>
  getObjectChildNameForPath(path, '/quickActions/', '.quickAction-meta.xml') ??
  getFileNameForPath(path, '/quickActions/', '.quickAction-meta.xml');

const getPackageDirectoryPaths = (projectRoot: string): string[] => {
  const sfdxProjectPath = join(projectRoot, 'sfdx-project.json');

  if (!existsSync(sfdxProjectPath)) {
    return existsSync(join(projectRoot, 'force-app')) ? ['force-app'] : ['.'];
  }

  const sfdxProject = JSON.parse(readFileSync(sfdxProjectPath, 'utf8')) as SfdxProject;
  const packageDirectoryPaths = sfdxProject.packageDirectories
    ?.map((packageDirectory) => packageDirectory.path)
    .filter((packageDirectoryPath): packageDirectoryPath is string => packageDirectoryPath != null);

  return packageDirectoryPaths != null && packageDirectoryPaths.length > 0 ? packageDirectoryPaths : ['force-app'];
};

const collectPaths = (projectRoot: string, currentPath: string, metadataPaths: Set<string>): void => {
  const absolutePath = join(projectRoot, currentPath);

  for (const entry of readdirSync(absolutePath, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectoryNames.has(entry.name)) {
      continue;
    }

    const relativePath = relative(projectRoot, join(absolutePath, entry.name));

    if (entry.isDirectory()) {
      metadataPaths.add(relativePath);
      collectPaths(projectRoot, relativePath, metadataPaths);
    } else if (entry.isFile() && statSync(join(projectRoot, relativePath)).size > 0) {
      metadataPaths.add(relativePath);
    }
  }
};

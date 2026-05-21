import { spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { SfCommand, Flags, Ux } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sf-raven', 'raven.pull');

export type RavenPullResult = {
  sourceDirs: string[];
  targetOrg?: string;
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

const ignoredDirectoryNames = new Set(['.git', 'node_modules', '.sfdx', '.sf']);

export default class RavenPull extends SfCommand<RavenPullResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    'target-org': Flags.string({
      summary: messages.getMessage('flags.target-org.summary'),
      char: 'o',
      required: false,
    }),
    all: Flags.boolean({
      summary: messages.getMessage('flags.all.summary'),
      char: 'a',
      required: false,
      default: false,
    }),
  };

  public async run(): Promise<RavenPullResult> {
    const { flags } = await this.parse(RavenPull);
    const ux = new Ux({ jsonEnabled: this.jsonEnabled() });
    const sourceDirs = flags.all ? getExistingPackageDirectoryPaths(process.cwd()) : await selectSourcePaths(process.cwd());

    if (sourceDirs.length === 0) {
      throw messages.createError('error.noMetadataPaths');
    }

    ux.log(messages.getMessage('info.retrieveStarting', [sourceDirs.join(', ')]));

    await retrieveSource(sourceDirs, flags['target-org']);

    return {
      sourceDirs,
      targetOrg: flags['target-org'],
    };
  }
}

const selectSourcePaths = async (projectRoot: string): Promise<string[]> => {
  const metadataPaths = getMetadataPaths(projectRoot);

  if (metadataPaths.length === 0) {
    throw messages.createError('error.noMetadataPaths');
  }

  const result = await runChildProcess('fzf', ['--multi'], {
    input: metadataPaths.join('\n'),
    stderr: 'inherit',
  });

  const selectedPaths = result.stdout
    .split('\n')
    .map((selectedPath) => selectedPath.trim())
    .filter((selectedPath) => selectedPath.length > 0);

  if (result.exitCode !== 0 || selectedPaths.length === 0) {
    throw messages.createError('error.noSelection');
  }

  return selectedPaths;
};

const retrieveSource = async (sourceDirs: string[], targetOrg?: string): Promise<void> => {
  const args = ['project', 'retrieve', 'start'];

  if (targetOrg != null && targetOrg.length > 0) {
    args.push('--target-org', targetOrg);
  }

  for (const sourceDir of sourceDirs) {
    args.push('--source-dir', sourceDir);
  }

  const sfExecutable = process.env.SF_BINPATH ?? 'sf';
  const result = await runChildProcess(sfExecutable, args, {
    stdout: 'inherit',
    stderr: 'inherit',
  });

  if (result.exitCode !== 0) {
    throw messages.createError('error.retrieveFailed', [result.exitCode.toString()]);
  }
};

const getMetadataPaths = (projectRoot: string): string[] => {
  const packageDirectoryPaths = getExistingPackageDirectoryPaths(projectRoot);
  const metadataPaths = new Set<string>();

  for (const packageDirectoryPath of packageDirectoryPaths) {
    metadataPaths.add(packageDirectoryPath);
    collectPaths(projectRoot, packageDirectoryPath, metadataPaths);
  }

  return Array.from(metadataPaths).sort((left, right) => left.localeCompare(right));
};

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

const getExistingPackageDirectoryPaths = (projectRoot: string): string[] =>
  getPackageDirectoryPaths(projectRoot).filter((packageDirectoryPath) => existsSync(join(projectRoot, packageDirectoryPath)));

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

const runChildProcess = async (
  command: string,
  args: string[],
  options: {
    input?: string;
    stdout?: 'inherit';
    stderr?: 'inherit';
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
      if (error.message.includes('ENOENT')) {
        reject(messages.createError('error.commandNotFound', [command]));
      } else {
        reject(error);
      }
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

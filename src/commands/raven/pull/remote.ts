import { SfCommand, Flags, Ux } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { getOrgOnlyMetadataNames, retrieveMetadataNames, selectItems } from '../../../shared/pull.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sf-raven', 'raven.pull.remote');

const orgOnlyPrefix = '☁  ';

export type RavenPullRemoteResult = {
  metadataNames: string[];
  targetOrg?: string;
};

export default class RavenPullRemote extends SfCommand<RavenPullRemoteResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    'target-org': Flags.string({
      summary: messages.getMessage('flags.target-org.summary'),
      char: 'o',
      required: false,
    }),
  };

  public async run(): Promise<RavenPullRemoteResult> {
    const { flags } = await this.parse(RavenPullRemote);
    const ux = new Ux({ jsonEnabled: this.jsonEnabled() });

    ux.spinner.start(messages.getMessage('info.loadingRemoteMetadata'));

    let orgOnlyMetadata: string[];

    try {
      orgOnlyMetadata = await getOrgOnlyMetadataNames(process.cwd(), flags['target-org']);
    } finally {
      ux.spinner.stop();
    }

    if (orgOnlyMetadata.length === 0) {
      throw messages.createError('error.noRemoteMetadata');
    }

    const selectedDisplays = await selectItems(orgOnlyMetadata.map((metadataName) => `${orgOnlyPrefix}${metadataName}`));
    const metadataNames = selectedDisplays.map((selectedDisplay) => selectedDisplay.replace(orgOnlyPrefix, ''));

    if (metadataNames.length === 0) {
      ux.log(messages.getMessage('info.noSelection'));
      return {
        metadataNames,
        targetOrg: flags['target-org'],
      };
    }

    ux.log(messages.getMessage('info.retrieveStarting', [metadataNames.join(', ')]));

    const exitCode = await retrieveMetadataNames(metadataNames, flags['target-org']);

    if (exitCode !== 0) {
      throw messages.createError('error.retrieveFailed', [exitCode.toString()]);
    }

    return {
      metadataNames,
      targetOrg: flags['target-org'],
    };
  }
}

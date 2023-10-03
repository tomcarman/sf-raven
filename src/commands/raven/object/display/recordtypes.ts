import { SfCommand, Flags, Ux } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('sf-raven', 'raven.object.display.recordtypes');

export type ObjectDisplayRecordtypesResult = {
  result: object;
};

export default class ObjectDisplayRecordtypes extends SfCommand<ObjectDisplayRecordtypesResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    'target-org': Flags.requiredOrg({
      summary: messages.getMessage('flags.target-org.summary'),
      char: 'o',
      required: true,
    }),
    sobject: Flags.string({
      summary: messages.getMessage('flags.sobject.summary'),
      char: 's',
      required: true,
    }),
  };

  public async run(): Promise<ObjectDisplayRecordtypesResult> {
    this.spinner.start('Loading...');

    type QueryResult = {
      totalSize: number;
      done: boolean;
      records: Record[];
    };

    type Record = {
      [key: string]: string | object;
      attributes: object;
      Id: string;
      Name: string;
      DeveloperName: string;
    };

    const { flags } = await this.parse(ObjectDisplayRecordtypes);
    const ux = new Ux({ jsonEnabled: this.jsonEnabled() });

    const org = flags['target-org'];
    const conn = org.getConnection();
    const query = `SELECT Name, DeveloperName, Id FROM RecordType WHERE SObjectType = '${flags.sobject}'`;

    const result = (await conn.query(query)) as QueryResult;

    this.spinner.stop();

    // Return table of fields
    ux.table(result.records, {
      label: {
        header: 'Name',
        get: (row: Record) => row.Name,
      },
      qualifiedApiName: {
        header: 'Developer Name',
        get: (row: Record) => row.DeveloperName,
      },
      dataType: {
        header: 'Id',
        get: (row: Record) => row.Id,
      },
    });

    // Return url
    ux.log(`\n${conn.instanceUrl}/lightning/setup/ObjectManager/${flags.sobject}/RecordTypes/view`);

    // Return an object to be displayed with --json
    return result as unknown as ObjectDisplayRecordtypesResult;
  }
}

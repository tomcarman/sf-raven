import { Ux, SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('sf-raven', 'object.display.fields');

export type ObjectDisplayFieldsResult = {
  result: object;
};

export default class ObjectDisplayFields extends SfCommand<ObjectDisplayFieldsResult> {
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

  public async run(): Promise<ObjectDisplayFieldsResult> {
    this.spinner.start('Loading...');

    interface QueryResult {
      totalSize: number;
      done: boolean;
      records: Record[];
    }

    interface Record {
      [key: string]: string | object;
      attributes: object;
      Label: string;
      QualifiedApiName: string;
      DataType: string;
    }

    const { flags } = await this.parse(ObjectDisplayFields);
    const ux = new Ux({ jsonEnabled: this.jsonEnabled() });

    const org = flags['target-org'];
    const conn = org.getConnection();
    const query = `SELECT Label, QualifiedApiName, DataType FROM FieldDefinition WHERE EntityDefinition.QualifiedApiName = '${flags.sobject}' ORDER BY QualifiedApiName`;
    const result = (await conn.query(query)) as QueryResult;

    this.spinner.stop();

    // Return table of fields
    ux.table(result.records, {
      label: {
        header: 'Name',
        get: (row: Record) => row.Label,
      },
      qualifiedApiName: {
        header: 'Developer Name',
        get: (row: Record) => row.QualifiedApiName,
      },
      dataType: {
        header: 'Type',
        get: (row: Record) => row.DataType,
      },
    });

    // Return url
    ux.log(`\n${conn.instanceUrl}/lightning/setup/ObjectManager/${flags.sobject}/FieldsAndRelationships/view`);

    // Return an object to be displayed with --json
    return result as unknown as ObjectDisplayFieldsResult;
  }
}

import { writeFileSync } from 'node:fs';
import { SfCommand, Flags, Ux } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sf-raven', 'raven.object.display.fields');

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
    csv: Flags.file({
      summary: messages.getMessage('flags.csv.summary'),
      char: 'c',
    }),
  };

  public async run(): Promise<ObjectDisplayFieldsResult> {
    type QueryResult = {
      totalSize: number;
      done: boolean;
      records: Record[];
    };

    type Record = {
      [key: string]: string | object;
      attributes: object;
      EntityDefinition: {
        QualifiedApiName: string;
      };
      Label: string;
      QualifiedApiName: string;
      DataType: string;
    };

    const { flags } = await this.parse(ObjectDisplayFields);
    const ux = new Ux({ jsonEnabled: this.jsonEnabled() });

    const org = flags['target-org'];
    const conn = org.getConnection();
    const sobjects = parseSobjects(flags.sobject);
    const records: Record[] = [];

    this.spinner.start('Loading...');

    try {
      await sobjects.reduce(async (previousQuery, sobject) => {
        await previousQuery;

        const query = `SELECT EntityDefinition.QualifiedApiName, Label, QualifiedApiName, DataType FROM FieldDefinition WHERE EntityDefinition.QualifiedApiName = '${sobject}' ORDER BY QualifiedApiName`;
        const queryResult = (await conn.query(query)) as QueryResult;
        records.push(...queryResult.records);
      }, Promise.resolve());
    } finally {
      this.spinner.stop();
    }

    const result: QueryResult = {
      totalSize: records.length,
      done: true,
      records,
    };
    const includeObjectColumn = sobjects.length > 1;

    if (flags.csv) {
      writeCsv(flags.csv, result.records, includeObjectColumn);
      ux.log(messages.getMessage('info.csvWritten', [result.records.length.toString(), flags.csv]));
    } else {
      // Return table of fields
      ux.table(result.records, getTableColumns(includeObjectColumn));
    }

    // Return url
    if (sobjects.length === 1) {
      ux.log(`\n${conn.instanceUrl}/lightning/setup/ObjectManager/${sobjects[0]}/FieldsAndRelationships/view`);
    }

    // Return an object to be displayed with --json
    return result as unknown as ObjectDisplayFieldsResult;
  }
}

const parseSobjects = (sobjectFlag: string): string[] => {
  const sobjects = sobjectFlag
    .split(',')
    .map((sobject) => sobject.trim())
    .filter((sobject) => sobject.length > 0);

  return Array.from(new Set(sobjects));
};

const getTableColumns = (
  includeObjectColumn: boolean
): {
  [key: string]: {
    header: string;
    get: (row: {
      EntityDefinition: { QualifiedApiName: string };
      Label: string;
      QualifiedApiName: string;
      DataType: string;
    }) => string;
  };
} => ({
  ...(includeObjectColumn
    ? {
        object: {
          header: 'Object',
          get: (row) => row.EntityDefinition.QualifiedApiName,
        },
      }
    : {}),
  label: {
    header: 'Name',
    get: (row) => row.Label,
  },
  qualifiedApiName: {
    header: 'Developer Name',
    get: (row) => row.QualifiedApiName,
  },
  dataType: {
    header: 'Type',
    get: (row) => row.DataType,
  },
});

const writeCsv = (
  filePath: string,
  records: Array<{
    EntityDefinition: {
      QualifiedApiName: string;
    };
    Label: string;
    QualifiedApiName: string;
    DataType: string;
  }>,
  includeObjectColumn: boolean
): void => {
  const columns = includeObjectColumn ? ['Object', 'Name', 'Developer Name', 'Type'] : ['Name', 'Developer Name', 'Type'];
  const rows = [
    columns.map(escapeCsvValue).join(','),
    ...records.map((record) =>
      (includeObjectColumn
        ? [record.EntityDefinition.QualifiedApiName, record.Label, record.QualifiedApiName, record.DataType]
        : [record.Label, record.QualifiedApiName, record.DataType]
      )
        .map(escapeCsvValue)
        .join(',')
    ),
  ];

  writeFileSync(filePath, `${rows.join('\n')}\n`, 'utf8');
};

const escapeCsvValue = (value: unknown): string => {
  if (value == null) {
    return '';
  }

  const stringValue = String(value);

  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

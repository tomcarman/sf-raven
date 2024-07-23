/* eslint-disable no-console */
import * as fs from 'fs';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('sf-raven', 'raven.query');

export type RavenQueryResult = {
  path: string;
};

export default class RavenQuery extends SfCommand<RavenQueryResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    fields: Flags.string({
      summary: messages.getMessage('flags.fields.summary'),
      char: 'f',
      required: false,
      default: 'Id, CreatedDate',
    }),
    ids: Flags.file({
      summary: messages.getMessage('flags.ids.summary'),
      char: 'i',
      exists: true,
    }),
    where: Flags.string({
      summary: messages.getMessage('flags.where.summary'),
      char: 'w',
    }),
    sobject: Flags.string({
      summary: messages.getMessage('flags.sobject.summary'),
      char: 's',
      required: true,
    }),
    count: Flags.boolean({
      summary: messages.getMessage('flags.count.summary'),
      char: 'c',
    }),
    recent: Flags.boolean({
      summary: messages.getMessage('flags.recent.summary'),
      char: 'r',
    }),
    limit: Flags.integer({
      summary: messages.getMessage('flags.limit.summary'),
      char: 'l',
      min: 1,
      max: 50000,
      default: 20,
    }),
    'target-org': Flags.requiredOrg(),
    'api-version': Flags.orgApiVersion(),
    sort: Flags.option({
      summary: messages.getMessage('flags.sort.summary'),
      options: ['asc', 'desc'] as const,
    })(),
  };

  public async run(): Promise<RavenQueryResult> {
    const { flags } = await this.parse(RavenQuery);

    // Id files
    if (flags.ids) {
      const data = fs.readFileSync(flags.ids, 'utf8');
      const ids: string[] = data.split('\n').filter((id) => id.length > 0);

      if (ids.length === 0) {
        throw new Error('No IDs found in file');
      }

      const limit = flags.limit || 800;

      const chunks: string[][] = [];
      if (ids.length > limit) {
        for (let i = 0; i < ids.length; i += limit) {
          const chunk = ids.slice(i, i + limit);
          chunks.push(chunk);
        }
      } else {
        chunks.push(ids);
      }
    }

    const org = flags['target-org'];
    if (org === undefined) {
      throw new Error('org is undefined');
    }

    const apiVersion = flags['api-version'];
    const conn = org.getConnection(apiVersion);

    let query = '';

    if (flags.count) {
      query = `SELECT COUNT() FROM ${flags.sobject}`;
    } else {
      query = `SELECT ${flags.fields} FROM ${flags.sobject}`;

      if (flags.where) {
        query += ` WHERE ${flags.where}`;
      }

      if (flags.recent) {
        query += ' ORDER BY CreatedDate DESC';
      }

      query += ` LIMIT ${flags.limit}`;
    }

    const result = await conn.query(query);
    const records = result.records;

    console.log(records);

    return { path: '' };
  }
}

import { Knex } from 'knex';
import { HonorRecord, honorRecordTable } from '../models';

export default class HonorRecordRepository {
  knex: Knex;

  constructor(inject: { knex: Knex }) {
    this.knex = inject.knex;
  }

  async save(honorRecord: HonorRecord) {
    return (await this.HonorRecords().insert(honorRecord).returning('*'))[0];
  }

  HonorRecords() {
    return this.knex<HonorRecord>(honorRecordTable);
  }
}

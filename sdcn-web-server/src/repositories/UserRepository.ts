import { Knex } from 'knex';
import { User, userFields, userTable } from '../models';
import { SortDirection } from '../utils/SortDirection';

export default class UserRepository {
  knex: Knex;

  constructor(inject: { knex: Knex }) {
    this.knex = inject.knex;
  }

  async save(user: User) {
    return await this.Users().insert(user).returning('*');
  }

  async getById(id: bigint) {
    return await this.Users().where({ id: id }).first();
  }
  async getByUuid(uuid: string) {
    return await this.Users().where(userFields.uuid, uuid).first();
  }

  async getAll() {
    return await this.Users().orderBy(userFields.id, SortDirection.Desc);
  }

  async raw(sql: string) {
    return await this.knex.raw(sql);
  }

  Users() {
    return this.knex<User>(userTable);
  }
}

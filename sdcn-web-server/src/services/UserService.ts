import { Knex } from 'knex';
import IORedis from 'ioredis';

export default class UserService {
  knex: Knex;
  redis: IORedis;

  constructor(inject: { knex: Knex; redis: IORedis }) {
    this.knex = inject.knex;
    this.redis = inject.redis;
  }

  async helloWorld() {
    return await this.knex.raw('select now()');
  }

  async hello() {
    return await this.knex('user').first();
  }
}

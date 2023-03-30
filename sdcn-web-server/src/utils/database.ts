import IORedis from 'ioredis';
import config from '../config';
import Knex from 'knex';

const knex = Knex({
  client: 'pg',
  connection: {
    user: config.dbConfig.username,
    password: config.dbConfig.password,
    host: config.dbConfig.hostname,
    port: config.dbConfig.port,
    database: config.dbConfig.database,
  },
  pool: {
    min: config.dbConfig.poolMin,
    max: config.dbConfig.poolMax,
    idleTimeoutMillis: config.dbConfig.poolIdle,
  },
  acquireConnectionTimeout: 2000,
  migrations: {
    tableName: 'KnexMigrations',
  },
});

const redis = new IORedis(config.redisConfig.url);

export default { redis, knex };

import IORedis, { Redis } from 'ioredis';
import config from '../config';
import { RedisOptions } from 'ioredis';
import Knex from 'knex';
import logger from './logger';
import _ from 'lodash';

const knex = Knex({
  client: 'pg',
  debug: config.serverConfig.isDev,
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
  // Hook for modifying returned rows, before passing them forward to user. https://knexjs.org/guide/#postprocessresponse
  postProcessResponse: (result) => {
    if (Array.isArray(result)) {
      return result.map((row) => mapRowKeysToCamelCase(row));
    } else {
      return mapRowKeysToCamelCase(result);
    }
  },
  // transforming identifier names automatically to quoted versions for each dialect. https://knexjs.org/guide/#wrapidentifier
  wrapIdentifier: (value, origImpl) => {
    if (value === '*') {
      return origImpl(value);
    } else {
      return origImpl(_.snakeCase(value));
    }
  },
});

function mapRowKeysToCamelCase(row: any): any {
  const result: any = {};
  for (const key in row) {
    if (Object.prototype.hasOwnProperty.call(row, key)) {
      const camelCaseKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
      result[camelCaseKey] = row[key];
    }
  }
  return result;
}

const redis = new IORedis(config.redisConfig.url);

export default { redis, knex };

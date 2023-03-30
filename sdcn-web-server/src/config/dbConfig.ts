import dotenv from 'dotenv';

dotenv.config();

const schema = 'api';
const username = process.env.DATABASE_USERNAME || 'postgres';
const password = process.env.DATABASE_PASSWORD || 'mysecretpassword';
const database = process.env.DATABASE_DATABASE || 'postgres';
const hostname = process.env.DATABASE_HOSTNAME || '127.0.0.1';
const port = Number(process.env.DATABASE_PORT || '5432');
const url = process.env.DATABASE_URL || `postgres://${username}@${hostname}:${password}/${database}`;
const poolMin = Number(process.env.DATABASE_POOL_MIN || '0');
const poolMax = Number(process.env.DATABASE_POOL_MAX || '10');
const poolIdle = Number(process.env.DATABASE_POOL_IDLE || '10000');

export default {
  schema,
  username,
  password,
  database,
  hostname,
  port,
  url,
  poolMin,
  poolMax,
  poolIdle,
};

import dotenv from 'dotenv';

dotenv.config();

const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379/1';

export default { url };

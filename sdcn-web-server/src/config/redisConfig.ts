import dotenv from 'dotenv';

dotenv.config();

const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379/0';

const nodeKeepAlive = process.env.NODE_KEEP_ALIVE || 2147483647; // 2^31 - 1, ~68+ years^M;

export default { url, nodeKeepAlive };

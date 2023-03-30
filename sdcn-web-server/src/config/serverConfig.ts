import dotenv from 'dotenv';

dotenv.config();

const port = Number(process.env.PORT || '8080');
const bodyLimit = '100kb';
const corsHeaders = ['Link'];
const isDev = process.env.NODE_ENV === 'development';

export default { port, bodyLimit, corsHeaders, isDev };

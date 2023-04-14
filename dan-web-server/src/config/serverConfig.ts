import dotenv from 'dotenv';
import _ from 'lodash';

dotenv.config();

const port = Number(process.env.PORT || '8080');
const bodyLimit = '100kb';
const corsHeaders = ['Link'];
const isDev = process.env.NODE_ENV === 'development';
const koaSecretKey = (process.env.KOA_SECRET_KEY || 'koa-secret-key') as string;
const githubClientId = process.env.GITHUB_CLIENT_ID as string;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET as string;
const githubCallbackUrl = process.env.GITHUB_CALLBACK_URL || `http://localhost:${port}/api/user/connect/github`;
const googleClientId = process.env.GOOGLE_CLIENT_ID as string;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET as string;
const redirect_uri = process.env.REDIRECT_URI || 'http://localhost:9080/oauth/success';
const failure_redirect_uri = process.env.FALURE_REDIRECT_URI || 'http://localhost:9080/oauth/failure';
const domain = process.env.DOMAIN || 'opendan.ai';
const requestJsonLimitSize = process.env.REQUEST_JSON_LIMIT_SIZE || '10mb';
const honorAmountForRegister = BigInt(process.env.HONOR_AMOUNT_FOR_REGISTER || 10000);
const honorAmountForRewardOnline = BigInt(process.env.HONOR_AMOUNT_FOR_REWARD_ONLINE || 10);
const honorAmountForRewardTask = BigInt(process.env.HONOR_AMOUNT_FOR_REWARD_TASK || 100);
const concurrencyForTask = _.toNumber(process.env.CONCURRENCY_FOR_TASK || 4);
const publicUserId = BigInt(process.env.PUBLIC_USER_ID || 2);

export default {
  port,
  bodyLimit,
  corsHeaders,
  isDev,
  koaSecretKey,
  githubClientId,
  githubClientSecret,
  githubCallbackUrl,
  googleClientId,
  googleClientSecret,
  redirect_uri,
  failure_redirect_uri,
  domain,
  requestJsonLimitSize,
  honorAmountForRegister,
  honorAmountForRewardOnline,
  honorAmountForRewardTask,
  concurrencyForTask,
  publicUserId,
};

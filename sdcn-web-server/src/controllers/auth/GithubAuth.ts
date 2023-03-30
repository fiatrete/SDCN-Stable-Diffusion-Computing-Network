import { Context } from 'koa';
import serverConfig from '../../config/serverConfig';
import logger from '../../utils/logger';
import { assertAuthUserInfoValid, AuthUserInfo } from './AuthInterface';

const kGithubAccessTokenUrl = 'https://github.com/login/oauth/access_token';
const kGithubUserUrl = 'https://api.github.com/user';
const kGithubEmailUrl = 'https://api.github.com/user/emails';

export default async function GithubAuth(ctx: Context): Promise<AuthUserInfo> {
  if (ctx.query.code === undefined) {
    throw new Error('Missing auth code');
  }
  let init: RequestInit = {
    body: JSON.stringify({
      client_id: serverConfig.githubClientId,
      client_secret: serverConfig.githubClientSecret,
      code: ctx.query.code,
    }),
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
  };
  logger.debug(`Requesting github access token, code=${ctx.query.code}`);
  let githubRes = await fetch(kGithubAccessTokenUrl, init);

  const accessTokenResult = await githubRes.json();
  const accessToken = accessTokenResult.access_token;
  const tokenType = accessTokenResult.token_type;
  logger.debug(`Got github access token: ${accessToken}, type: ${tokenType}`);
  if (!accessToken || !tokenType) {
    throw Error('Failed to get access token, may an expired auth code');
  }

  init = {
    method: 'GET',
    headers: {
      accept: 'application/vnd.github+json',
      Authorization: `${tokenType} ${accessToken}`,
    },
  };
  logger.debug(`Requesting user info`);
  githubRes = await fetch(kGithubUserUrl, init);
  const userInfo = await githubRes.json();
  logger.log('User: ', userInfo);

  logger.debug(`Reuqesting user email`);
  githubRes = await fetch(kGithubEmailUrl, init);
  const emailInfo = await githubRes.json();
  logger.log('Email: ', emailInfo);

  function getPrimaryEmail(emailInfo: any[]) {
    for (let i = 0; i < emailInfo.length; ++i) {
      if (emailInfo[i].primary) {
        return emailInfo[i].email;
      }
    }
    return null;
  }

  const authUserInfo = {
    authType: 'Github',
    userName: userInfo.login,
    id: `${userInfo.id}`,
    email: getPrimaryEmail(emailInfo),
    tokenType: tokenType,
    accessToken: accessToken,
  } as AuthUserInfo;
  assertAuthUserInfoValid(authUserInfo);

  return authUserInfo;
}

import { Context } from 'koa';
import serverConfig from '../../config/serverConfig';
import logger from '../../utils/logger';
import querystring from 'querystring';
import { assertAuthUserInfoValid, AuthUserInfo } from './AuthInterface';

const kGoogleAccessTokenUrl = 'https://oauth2.googleapis.com/token';
const kGoogleUserUrl = 'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses';

const kRedirectUrl = 'http://localhost:8000/api/user/connect/google'; // NOTE: This url MUST has been registered at google's console page.

// https://developers.google.com/identity/protocols/oauth2/web-server
// https://developers.google.com/people/api/rest/v1/people/get
export default async function GoogleAuth(ctx: Context): Promise<AuthUserInfo> {
  if (ctx.query.code === undefined) {
    throw new Error(ctx.query.error ? <string>ctx.query.error : 'Missing auth code');
  }

  let init: RequestInit = {
    // body: `client_secret=${querystring.escape(serverConfig.googleClientSecret)}&redirect_uri=${querystring.escape(kRedirectUrl)}&grant_type=authorization_code`,
    body: [
      `code=${querystring.escape(ctx.query.code as string)}`,
      `client_id=${querystring.escape(serverConfig.googleClientId)}`,
      `client_secret=${querystring.escape(serverConfig.googleClientSecret)}`,
      `redirect_uri=${querystring.escape(kRedirectUrl)}`,
      `grant_type=authorization_code`,
    ].join('&'),
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
    },
  } as RequestInit;
  logger.debug(`Requesting google access token, code=${ctx.query.code}`, init);
  let userInfoRes = await fetch(kGoogleAccessTokenUrl, init);

  const accessTokenResult = await userInfoRes.json();
  const accessToken = accessTokenResult.access_token;
  const tokenType = accessTokenResult.token_type;
  if (!accessToken || !tokenType) {
    throw Error('Failed to get access token, may an expired auth code');
  }
  logger.debug(`Got google access token: ${accessToken}, type: ${tokenType}`);

  init = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `${tokenType} ${accessToken}`,
    },
  } as RequestInit;
  logger.debug(`Requesting user info`);
  userInfoRes = await fetch(kGoogleUserUrl, init);
  const userInfo = await userInfoRes.json();
  logger.log('User: ', userInfo);

  function getPrimaryName(userInfo: any) {
    for (let i = 0; i < userInfo.names.length; ++i) {
      if (userInfo.names[i].metadata.primary) {
        return userInfo.names[i].displayName;
      }
    }
  }

  function getPrimaryEmail(userInfo: any) {
    for (let i = 0; i < userInfo.emailAddresses.length; ++i) {
      if (userInfo.emailAddresses[i].metadata.primary) {
        return userInfo.emailAddresses[i].value;
      }
    }
    return null;
  }

  const authUserInfo = {
    authType: 'Google',
    userName: getPrimaryName(userInfo),
    id: userInfo.resourceName,
    email: getPrimaryEmail(userInfo),
    tokenType: tokenType,
    accessToken: accessToken,
  } as AuthUserInfo;
  assertAuthUserInfoValid(authUserInfo);

  return authUserInfo as AuthUserInfo;
}

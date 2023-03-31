import { Context } from 'koa';

interface AuthUserInfo {
  authType: 'Github' | 'Google';
  userName: string;
  id?: bigint;
  uuid: string;
  email: string;
  avatar_img: string;
}

interface AuthInterface {
  async(ctx: Context): Promise<AuthUserInfo>;
}

function isAuthUserInfoValid(userInfo: AuthUserInfo) {
  return (
    typeof userInfo.userName === 'string' &&
    typeof userInfo.uuid === 'string' &&
    (userInfo.email === null || typeof userInfo.email === 'string')
  );
}

function assertAuthUserInfoValid(userInfo: AuthUserInfo) {
  if (!isAuthUserInfoValid(userInfo)) {
    throw new Error('Invalid AuthUserInfo');
  }
}

export { AuthUserInfo, AuthInterface, isAuthUserInfoValid, assertAuthUserInfoValid };

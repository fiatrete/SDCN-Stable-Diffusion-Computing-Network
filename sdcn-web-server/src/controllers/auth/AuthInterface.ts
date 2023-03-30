import { Context } from "koa";

interface AuthUserInfo {
    authType: 'Github' | 'Google';
    userName: string;
    id: string;
    email: string;
}

interface AuthInterface {
    async (ctx: Context): Promise<AuthUserInfo>;
}

function isAuthUserInfoValid(userInfo: AuthUserInfo)
{
    return typeof (userInfo.userName) === 'string' &&
        typeof (userInfo.id) === 'string' &&
        (userInfo.email === null || typeof (userInfo.email) === 'string');
}

function assertAuthUserInfoValid(userInfo: AuthUserInfo)
{
    if (!isAuthUserInfoValid(userInfo)) {
        throw new Error("Invalid AuthUserInfo");
    }
}

export { AuthUserInfo, AuthInterface, isAuthUserInfoValid, assertAuthUserInfoValid }

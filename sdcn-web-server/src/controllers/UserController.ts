import { Context, Next } from 'koa';
import Router from 'koa-router';
import { RequireLoginAsync } from '../annotators/RequireLogin';
import UserService from '../services/UserService';
import logger from '../utils/logger';
import { AuthUserInfo } from './auth/AuthInterface';
import GithubAuth from './auth/GithubAuth';
import GoogleAuth from './auth/GoogleAuth';
import _ from 'lodash';
import config from '../config/index';
import querystring from 'querystring';
import responseHandler, { ErrorCode, SdcnError, StatusCode } from '../utils/responseHandler';
import Joi from 'joi';
import { ResponseSdcnErrorOnThrowAsync } from '../annotators/ResponseSdcnErrorOnThrow';

interface HelloParam {
  id: number;
  name: string;
  tags?: string[];
}

export default class UserControler {
  userService: UserService;

  constructor(inject: { userService: UserService }) {
    this.userService = inject.userService;
  }

  private static getAuthUserInfo(context: Context): AuthUserInfo {
    return context.session?.authUserInfo;
  }
  private static setAuthUserInfo(context: Context, authUserInfo: AuthUserInfo) {
    logger.debug('Set UserInfo: ', authUserInfo);
    context.session!.authUserInfo = authUserInfo;
  }

  @ResponseSdcnErrorOnThrowAsync
  private async userLogin(Authorizor: { (context: Context): Promise<AuthUserInfo> }, context: Context) {
    const authUserInfo = await Authorizor(context);
    const user = await this.userService.checkAccount(authUserInfo.uuid);
    logger.debug('user:', user);
    if (user.id === undefined) {
      user.nickname = authUserInfo.userName;
      user.email = authUserInfo.email;
      user.uuid = authUserInfo.uuid;
      user.avatarImg = authUserInfo.avatar_img;
      user.create_time = new Date();
      const newUser = await this.userService.createAccount(user);
      authUserInfo.id = newUser[0].id;
      logger.debug('newUser:', newUser);
    } else {
      authUserInfo.id = user.id;
    }

    UserControler.setAuthUserInfo(context, authUserInfo);
    context.redirect(config.serverConfig.redirect_uri);
    // TODO: Redirecto to a failure page on error?
  }

  @ResponseSdcnErrorOnThrowAsync
  async connectGithub(context: Context) {
    await this.userLogin(GithubAuth, context);
  }

  @ResponseSdcnErrorOnThrowAsync
  async connectGoogle(context: Context) {
    await this.userLogin(GoogleAuth, context);
  }

  @RequireLoginAsync
  async testAuth(context: Context) {
    context.body = `You are: ${UserControler.getAuthUserInfo(context).userName}`;
  }

  @ResponseSdcnErrorOnThrowAsync
  async loginWithGithub(context: Context) {
    const loginWithGithubUrl = `https://github.com/login/oauth/authorize?scope=user:email&client_id=${
      config.serverConfig.githubClientId
    }&redirect_uri=${querystring.escape(config.serverConfig.githubCallbackUrl)}`;
    context.redirect(loginWithGithubUrl);
  }

  async helloWorld(context: Context) {
    responseHandler.success(context, await this.userService.helloWorld());
  }

  async helloB(context: Context, next: Next) {
    logger.info(`request body: ${JSON.stringify(context.request.body)}`);
    logger.info(`request query: ${JSON.stringify(context.query)}`);
    logger.info(`request query string: ${context.querystring}`);
    const { id: rawId, name, tags } = context.query;
    logger.info(`is array: ${_.isArray(rawId)}`);
    logger.info(`type: ${typeof rawId}`);
    logger.info(`id: ${rawId}, name: ${name}`);
    logger.info('-----------------');
    logger.info(_.isArray(rawId));
    logger.info(_.isString(rawId));
    logger.info(_.isNaN(rawId));
    logger.info(_.isNumber(rawId));
    logger.info(_.toString(rawId));
    logger.info(rawId);

    const params: HelloParam = {
      id: _.isArray(rawId)
        ? _.parseInt((rawId as Array<string>)[0])
        : _.isString(rawId)
        ? _.parseInt(rawId as string)
        : _.isNumber(rawId)
        ? rawId
        : 1,
      name: _.isArray(name) ? (name as Array<string>)[0] : '',
      tags: Array.isArray(tags) ? tags : [],
    };
    logger.info(`request param: ${JSON.stringify(params)}`);
    context.state.params = params;

    await next();
  }

  async helloCreate(context: Context) {
    const requestBody = context.request.body;
    await this.userService.helloCreate(requestBody);
    responseHandler.success(context, true);
  }

  async world(context: Context) {
    responseHandler.success(context, await this.userService.world());
  }

  @ResponseSdcnErrorOnThrowAsync
  async info(context: Context) {
    const userInfo = context.session?.authUserInfo as AuthUserInfo;
    logger.debug('userInfo', userInfo);
    if (userInfo.id === undefined) {
      throw new SdcnError(StatusCode.Forbidden, ErrorCode.PermissionDenied, 'Permission Denied');
    }
    const id = userInfo.id as bigint;
    const user = await this.userService.getUserInfo(BigInt(id));
    logger.debug('info', user);
    const result = { nickname: user?.nickname, avatarImgUrl: user?.avatarImg, email: user?.email };
    logger.debug('result', result);
    responseHandler.success(context, result);
  }

  @ResponseSdcnErrorOnThrowAsync
  async getNodeSummaryWithAccountPaged(context: Context) {
    const schema = Joi.object({
      pageNo: Joi.number().integer().min(1).required(),
      pageSize: Joi.number().integer().min(1).max(100).required(),
    });
    const { value, error } = schema.validate(context.query);
    if (error) {
      throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, error.message);
    }
    const { pageNo, pageSize } = value;
    const result = await this.userService.getNodeSummaryWithAccountPaged(pageNo, pageSize);
    logger.debug(result);
    const responese = {
      items: result.items,
      pageNo: pageNo,
      pageSize: pageSize,
      totalSize: result.totalSize,
      totalPages: result.totalPages,
    };
    responseHandler.success(context, responese);
  }

  router() {
    const router = new Router({ prefix: '/user' });
    router.get('/test', this.helloWorld.bind(this));
    router.get('/testauth', this.testAuth.bind(this));
    router.get('/world', this.world.bind(this));
    router.get('/connect/github', this.connectGithub.bind(this));
    router.get('/login/github', this.loginWithGithub.bind(this));
    router.get('/info', this.info.bind(this));
    router.get('/list-by-task', this.getNodeSummaryWithAccountPaged.bind(this));
    return router;
  }
}

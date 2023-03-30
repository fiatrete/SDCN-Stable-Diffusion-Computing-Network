import { Context, Next } from 'koa';
import Router from 'koa-router';
import { RequireLoginAsync } from '../annotators/RequireLogin';
import UserService from '../services/UserService';
import logger from '../utils/logger';
import { AuthUserInfo } from './auth/AuthInterface';
import GithubAuth from './auth/GithubAuth';
import GoogleAuth from './auth/GoogleAuth';
import _ from 'lodash';
import responseHandler from '../utils/responseHandler';

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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    context.session!.authUserInfo = authUserInfo;
  }

  private static async userLogin(Authorizor: { (context: Context): Promise<AuthUserInfo> }, context: Context) {
    try {
      const authUserInfo = await Authorizor(context);

      UserControler.setAuthUserInfo(context, authUserInfo);
      context.status = 200;
      context.body = `Succeed to auth by ${Authorizor.name}`;
    } catch (error: any) {
      logger.error(`Failed to auth by ${Authorizor.name}: `, error);
      context.status = 500;
      context.body = `Failed to auth by ${Authorizor.name}`;
    }
  }

  async connectGithub(context: Context) {
    await UserControler.userLogin(GithubAuth, context);
  }

  async connectGoogle(context: Context) {
    await UserControler.userLogin(GoogleAuth, context);
  }

  @RequireLoginAsync
  async testAuth(context: Context) {
    context.body = `You are: ${UserControler.getAuthUserInfo(context).userName}`;
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

  async hello(context: Context) {
    const { id, name, tags } = context.state.params;
    logger.info(`hello, id:${id}, name:${name}, tags:${tags}`);
    responseHandler.success(context, await this.userService.hello(id));
  }

  async helloCreate(context: Context) {
    const requestBody = context.request.body;
    await this.userService.helloCreate(requestBody);
    responseHandler.success(context, true);
  }

  async hello1(context: Context) {
    const { id, name, tags } = context.query;
    logger.info(`hello, id:${id}, name:${name}, tags:${tags}`);
    responseHandler.success(context, await this.userService.hello(_.parseInt((id as Array<string>)[0])));
  }

  async world(context: Context) {
    responseHandler.success(context, await this.userService.world());
  }

  router() {
    const router = new Router({ prefix: '/user' });
    router.get('/test', this.helloWorld.bind(this));
    router.get('/testauth', this.testAuth.bind(this));
    router.get('/hello', this.hello.bind(this));
    router.post('/hello', this.helloCreate.bind(this));
    router.get('/hello1', this.hello1.bind(this));
    router.get('/world', this.world.bind(this));
    router.get('/connect/github', this.connectGithub.bind(this));
    router.get('/connect/google', this.connectGoogle.bind(this));
    return router;
  }
}

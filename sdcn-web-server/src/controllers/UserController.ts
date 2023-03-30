import { Context } from 'koa';
import Router from 'koa-router';
import UserService from '../services/UserService';

export default class UserControler {
  userService: UserService;

  constructor(inject: { userService: UserService }) {
    this.userService = inject.userService;
  }

  async connectGithub(context: Context) {
    context.body = 'connect github';
  }

  async connectGoogle(context: Context) {
    context.body = 'connect google';
  }

  async helloWorld(context: Context) {
    context.body = await this.userService.helloWorld();
  }

  async hello(context: Context) {
    context.body = await this.userService.hello();
  }

  router() {
    const router = new Router({ prefix: '/user' });
    router.get('/test', this.helloWorld.bind(this));
    router.get('/hello', this.hello.bind(this));
    router.get('/connect/github', this.connectGithub.bind(this));
    router.get('/connect/google', this.connectGoogle.bind(this));
    return router;
  }
}

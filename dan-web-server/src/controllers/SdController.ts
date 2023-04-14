import { Context } from 'koa';
import Router from 'koa-router';
import SdService from '../services/SdService';
import responseHandler, { ErrorCode, SdcnError, StatusCode } from '../utils/responseHandler';
import { toUtf8Bytes } from 'alchemy-sdk/dist/src/api/utils';

export default class SdControler {
  sdService: SdService;

  constructor(inject: { sdService: SdService }) {
    this.sdService = inject.sdService;
  }

  async txt2img(context: Context) {
    await this.sdService.txt2img(context);
  }

  async img2img(context: Context) {
    await this.sdService.img2img(context);
  }

  async interrogate(context: Context) {
    await this.sdService.interrogate(context);
  }

  async txt2imgAsync(context: Context) {
    const requestBody = context.request.body;
    responseHandler.success(context, await this.sdService.taskSubmit(requestBody, 0));
  }

  async img2imgAsync(context: Context) {
    const requestBody = context.request.body;
    responseHandler.success(context, await this.sdService.taskSubmit(requestBody, 1));
  }

  async taskStatus(context: Context) {
    const { taskId } = context.request.body;
    const taskStatus = await this.sdService.taskStatus(taskId);
    responseHandler.success(context, taskStatus);
  }

  async taskStatistics(context: Context) {
    const taskStatistics = await this.sdService.taskStatistics();
    responseHandler.success(context, taskStatistics);
  }

  router() {
    const router = new Router({ prefix: '/sd' });
    router.post('/txt2img', this.txt2img.bind(this));
    router.post('/img2img', this.img2img.bind(this));
    router.post('/interrogate', this.interrogate.bind(this));
    router.post('/txt2img/async', this.txt2imgAsync.bind(this));
    router.post('/img2img/async', this.img2imgAsync.bind(this));
    router.post('/task/status', this.taskStatus.bind(this));
    router.post('/statistics', this.taskStatistics.bind(this));
    return router;
  }
}

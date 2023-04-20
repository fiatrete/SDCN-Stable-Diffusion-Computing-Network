import { Context } from 'koa';
import Router from 'koa-router';
import SdService from '../services/SdService';
import responseHandler, { SdcnError, StatusCode, ErrorCode } from '../utils/responseHandler';
import _ from 'lodash';
import { UserService } from '../services';
import logger from '../utils/logger';
import { Job } from 'bullmq';
import { NodeTaskStatus, NodeTaskType } from '../models/enum';

export default class SdControler {
  sdService: SdService;
  userService: UserService;

  constructor(inject: { sdService: SdService; userService: UserService }) {
    this.sdService = inject.sdService;
    this.userService = inject.userService;
  }

  async txt2img(context: Context) {
    await this.taskSubmitAndWait(context, NodeTaskType.Txt2img);
  }

  async img2img(context: Context) {
    await this.taskSubmitAndWait(context, NodeTaskType.Img2img);
  }

  async interrogate(context: Context) {
    await this.taskSubmitAndWait(context, NodeTaskType.Interrogate);
  }

  private async taskSubmitAndWait(context: Context, nodeTaskType: NodeTaskType) {
    const user = await this.getAccount(context);
    const taskStatusResult = await this.sdService.taskSubmit(
      context.request.body,
      nodeTaskType,
      user!.honorAmount,
      user!.id,
    );
    responseHandler.success(context, await this.getTaskResult(context, taskStatusResult));
  }

  private async getTaskResult(context: Context, taskStatusResult: { job: Job; taskStatus: { taskId: string } }) {
    let index = 0;
    return new Promise((reslove, reject) => {
      let resultSuccess = false;
      const timerId = setInterval(async () => {
        const result = await this.sdService.taskStatus(taskStatusResult.taskStatus.taskId);
        if (result.status == NodeTaskStatus.Success || result.status == NodeTaskStatus.Failure) {
          resultSuccess = true;
          reslove(result);
          clearInterval(timerId);
        } else {
          if (index == 60) {
            try {
              if (await taskStatusResult.job.isWaiting()) {
                await taskStatusResult.job.remove();
              }
            } catch (error) {
              logger.error(error);
            }
            reject('timeout');
            clearInterval(timerId);
          }
        }
        index++;
      }, 2000);
      context.request.socket.on('close', async () => {
        if (!resultSuccess) {
          setTimeout(async () => {
            logger.info('---------------- client closed connection! ----------------');
            try {
              if (await taskStatusResult.job.isWaiting()) {
                await taskStatusResult.job.remove();
              }
            } catch (error) {
              logger.error(error);
            }
            reject('timeout');
            clearInterval(timerId);
          }, 1000);
        }
      });
    });
  }

  async txt2imgAsync(context: Context) {
    await this.taskSubmit(context, NodeTaskType.Txt2img);
  }

  async img2imgAsync(context: Context) {
    await this.taskSubmit(context, NodeTaskType.Img2img);
  }

  async interrogateAsync(context: Context) {
    await this.taskSubmit(context, NodeTaskType.Interrogate);
  }

  async taskSubmit(context: Context, nodeTaskType: NodeTaskType) {
    const user = await this.getAccount(context);
    const requestBody = context.request.body;
    responseHandler.success(
      context,
      (await this.sdService.taskSubmit(requestBody, nodeTaskType, user!.honorAmount, user!.id)).taskStatus,
    );
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

  async supportedModelInfo(context: Context) {
    const supportedModelInfo = await this.sdService.supportedModelInfo();
    responseHandler.success(context, supportedModelInfo);
  }

  private async getAccount(context: Context) {
    const userId = context.session?.authUserInfo?.id;
    const apiKey = context.request.headers?.authorization?.replace('Bearer ', '') as string;
    if (!_.isEmpty(userId)) {
      return await this.userService.getById(userId);
    } else if (!_.isEmpty(apiKey)) {
      const user = await this.userService.getByApiKey(apiKey);
      if (_.isEmpty(user)) {
        throw new SdcnError(StatusCode.Forbidden, ErrorCode.PermissionDenied, 'forbidden');
      }
      return user;
    } else {
      throw new SdcnError(StatusCode.Forbidden, ErrorCode.PermissionDenied, 'forbidden');
    }
  }

  router() {
    const router = new Router({ prefix: '/sd' });
    router.post('/txt2img', this.txt2img.bind(this));
    router.post('/img2img', this.img2img.bind(this));
    router.post('/interrogate', this.interrogate.bind(this));
    router.post('/txt2img/async', this.txt2imgAsync.bind(this));
    router.post('/img2img/async', this.img2imgAsync.bind(this));
    router.post('/interrogate/async', this.interrogateAsync.bind(this));
    router.post('/task/status', this.taskStatus.bind(this));
    router.post('/statistics', this.taskStatistics.bind(this));
    router.get('/statistics', this.taskStatistics.bind(this));
    router.get('/supportedModelInfo', this.supportedModelInfo.bind(this));
    return router;
  }
}

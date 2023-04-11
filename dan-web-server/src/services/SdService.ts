import { gatewayParamsToWebUI_xxx2img, gatewayParamsToWebUI_interrogate } from './utils/ParamConvert';
import NodeService from './NodeService';
import { Context } from 'koa';
import responseHandler, { ErrorCode, SdcnError, StatusCode } from '../utils/responseHandler';
import { NodeTask } from '../models';
import { RedisService, NodeTaskRepository } from '../repositories';
import { JsonObject } from '../utils/json';
import _ from 'lodash';
import logger from '../utils/logger';

const kXxx2ImgHttpPath = ['/sdapi/v1/txt2img', '/sdapi/v1/img2img'];
const kInterrogateHttpPath = '/sdapi/v1/interrogate';

export default class SdService {
  nodeService: NodeService;
  redisService: RedisService;
  nodeTaskRepository: NodeTaskRepository;
  concurrency: number;
  queueSize = 0;

  constructor(inject: {
    nodeService: NodeService;
    nodeTaskRepository: NodeTaskRepository;
    redisService: RedisService;
  }) {
    this.nodeService = inject.nodeService;
    this.nodeTaskRepository = inject.nodeTaskRepository;
    this.redisService = inject.redisService;
    this.concurrency = 8;
    this.schedule();
  }

  private async getNextWorkerNode(): Promise<{ workerAddress: string | null; nodeId: string | null }> {
    const { workerAddress, nodeId } = await this.nodeService.getNextWorkerNode();
    if (!workerAddress) {
      throw new SdcnError(StatusCode.InternalServerError, ErrorCode.ResourceUnavailable, 'No available worker found');
    }
    return { workerAddress, nodeId };
  }

  // handerType:
  //      0 --> txt2img
  //      1 --> img2img
  private async xxx2img(context: Context, handlerType: number): Promise<void> {
    const requestBody = context.request.body;
    const { model } = requestBody;
    const nodeTask = await this.saveNodeTask(model, handlerType);
    const webuiParams = gatewayParamsToWebUI_xxx2img(requestBody, handlerType);
    const resultObj = await this.executeImageGenerateTask({
      taskId: nodeTask.id,
      taskType: handlerType,
      taskParams: webuiParams,
    });
    responseHandler.success(context, resultObj);
  }

  async txt2img(context: Context) {
    await this.xxx2img(context, 0);
  }

  async img2img(context: Context) {
    await this.xxx2img(context, 1);
  }

  async interrogate(context: Context) {
    const { workerAddress, nodeId } = await this.getNextWorkerNode();

    const params = gatewayParamsToWebUI_interrogate(context.request.body);
    if (!params) {
      throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Invalid data');
    }

    const reqInit: RequestInit = {
      body: JSON.stringify(params),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };
    const upstreamRes: globalThis.Response = await fetch(workerAddress + kInterrogateHttpPath, reqInit);
    const status = upstreamRes.status;
    if (status !== 200) {
      throw new SdcnError(StatusCode.InternalServerError, ErrorCode.UpstreamError, `Upstream response ${status}`);
    }

    const upstreamResObj = await upstreamRes.json();
    this.nodeService.increaseTasksHandled(nodeId as string);
    responseHandler.success(context, { caption: upstreamResObj.caption });
  }

  private async saveNodeTask(model: string, taskType: number): Promise<NodeTask> {
    const nodeTask = {
      model,
      taskType,
      status: 0,
      createTime: new Date(),
      lastModifyTime: new Date(),
    } as NodeTask;
    const resultNodeTask = await this.nodeTaskRepository.save(nodeTask);
    nodeTask.id = resultNodeTask.id;
    return nodeTask;
  }

  async taskSubmit(requestBody: JsonObject, handlerType: number) {
    const { model } = requestBody;
    const taskInfo = gatewayParamsToWebUI_xxx2img(requestBody, handlerType);

    const nodeTask = await this.saveNodeTask(model as string, handlerType);
    await this.redisService.pushToTaskQueue(nodeTask.id, {
      taskId: nodeTask.id,
      taskType: handlerType,
      taskParams: taskInfo,
    });
    return {
      status: 0,
      taskId: nodeTask.id,
      queuePosition: await this.redisService.lengthTaskQueue(),
    };
  }

  async taskStatus(taskId: string) {
    const taskStatusStr = await this.redisService.getTaskStatus(taskId);
    if (_.isNull(taskStatusStr) || _.isNaN(taskStatusStr)) {
      return null;
    } else {
      return JSON.parse(taskStatusStr);
    }
  }

  async taskStatistics() {
    const totalCount = await this.nodeTaskRepository.countAll();
    const now = new Date();
    const startTimeAtLast24Hours = new Date(now.getTime() - 1000 * 60 * 60 * 24);
    const startTimeAtLastWeek = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7);
    const countInLast24Hours = await this.nodeTaskRepository.countByCreateTime(startTimeAtLast24Hours, now);
    const countInLastWeek = await this.nodeTaskRepository.countByCreateTime(startTimeAtLastWeek, now);
    return { totalCount, countInLast24Hours, countInLastWeek };
  }

  private async executeImageGenerateTask(taskInfo: JsonObject) {
    const { workerAddress, nodeId } = await this.getNextWorkerNode();

    const { taskId, taskType, taskParams } = taskInfo;
    this.nodeTaskRepository.updateNodeSeqAndStatus({ id: taskId, status: 1, nodeSeq: _.toNumber(nodeId) } as NodeTask);
    this.redisService.pushToTaskQueueProcessing(taskId as string);

    const reqInit: RequestInit = {
      body: JSON.stringify(taskParams),
      method: 'POST',
      headers: [['Content-Type', 'application/json']],
    };

    const upstreamRes: globalThis.Response = await fetch(workerAddress + kXxx2ImgHttpPath[taskType as number], reqInit);
    const status = upstreamRes.status;
    if (status !== 200) {
      throw new SdcnError(StatusCode.InternalServerError, ErrorCode.UpstreamError, `Upstream response ${status}`);
    }

    const resultObj = await upstreamRes.json();
    this.nodeService.increaseTasksHandled(nodeId as string);

    // update task status
    const images = resultObj.images;
    let taskStatus: number;
    if (_.isNaN(images) || _.isNull(images) || _.isEmpty(images)) {
      taskStatus = 3;
    } else {
      taskStatus = 2;
    }
    this.nodeTaskRepository.updateStatus({ id: taskId, status: taskStatus, finishTime: new Date() } as NodeTask);
    this.redisService.popFromTaskQueueProcessing(taskId as string, {
      taskId,
      status: taskStatus,
      queuePosition: 0,
      images: images,
    });

    return _.omit(resultObj, 'info', 'parameters');
  }

  private async asyncTask(taskInfo: JsonObject) {
    this.queueSize += 1;
    const { taskId } = taskInfo;
    try {
      const result = await this.executeImageGenerateTask(taskInfo);
      logger.info(`task(${taskId}) result: ${JSON.stringify(result)}`);
      this.queueSize -= 1;
    } catch (error) {
      logger.error(`task error: ${taskId}`);
      logger.error(error);
      this.nodeTaskRepository.updateStatus({ id: taskId, status: 3, finishTime: new Date() } as NodeTask);
      this.redisService.popFromTaskQueueProcessing(taskId as string, {
        taskId,
        status: 3,
        queuePosition: 0,
        images: [],
      });
      this.queueSize -= 1;
    }
  }

  schedule() {
    setInterval(async () => {
      // update task status
      const taskIdList = await this.redisService.getAllTaskFromQueue();
      if (taskIdList.length == 0) {
        return;
      }
      const taskStatusArray = taskIdList.map((taskId, index) => {
        return { taskId, queuePosition: index + 1, status: 0 };
      });
      await this.redisService.updateTaskStatus(taskStatusArray);

      // obtain idle workers
      logger.info(`---- queue: ${this.queueSize}, ${this.concurrency}, ${await this.redisService.lengthTaskQueue()}`);
      const length = await this.redisService.lengthTaskQueue();
      if (this.queueSize < this.concurrency && length > 0) {
        const taskArray = await this.redisService.batchPopFromTaskQueue(this.concurrency - this.queueSize);
        taskArray.forEach((task) => this.asyncTask(task));
      }
    }, 1000 * 4);
  }
}

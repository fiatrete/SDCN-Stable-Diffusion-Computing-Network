import { gatewayParamsToWebUI_xxx2img, gatewayParamsToWebUI_interrogate } from './utils/ParamConvert';
import NodeService from './NodeService';
import { ErrorCode, SdcnError, StatusCode } from '../utils/responseHandler';
import { CommandRequest, CommandResultData, NodeTask } from '../models';
import { RedisService, NodeTaskRepository } from '../repositories';
import { JsonObject } from '../utils/json';
import _ from 'lodash';
import logger from '../utils/logger';
import HonorService from './HonorService';
import { NodeTaskStatus, NodeTaskType } from '../models/enum';
import Redis from 'ioredis';
import { JobType, Queue, Worker } from 'bullmq';
import config from '../config';
import calculateTaskPriority from '../utils/taskPriority';
import WebsocketService from './Websocket';
import { CommandResultImageData } from '../models/Message';

const kXxx2ImgHttpPath = ['/sdapi/v1/txt2img', '/sdapi/v1/img2img'];
const kInterrogateHttpPath = '/sdapi/v1/interrogate';

export default class SdService {
  nodeService: NodeService;
  redisService: RedisService;
  nodeTaskRepository: NodeTaskRepository;
  honorService: HonorService;
  websocketService: WebsocketService;
  concurrency: number;
  taskQueue: Queue;
  redis: Redis;
  taskQueueName = 'task-queue';

  constructor(inject: {
    nodeService: NodeService;
    nodeTaskRepository: NodeTaskRepository;
    redisService: RedisService;
    honorService: HonorService;
    websocketService: WebsocketService;
    redis: Redis;
  }) {
    this.nodeService = inject.nodeService;
    this.nodeTaskRepository = inject.nodeTaskRepository;
    this.redisService = inject.redisService;
    this.honorService = inject.honorService;
    this.websocketService = inject.websocketService;
    this.concurrency = 8;
    this.redis = inject.redis;
    this.taskQueue = new Queue(this.taskQueueName, { connection: inject.redis });
    this.queueProcess();
    this.timerReorderTask();
  }

  private async getNextWorkerNode(): Promise<{ workerAddress: string | null; nodeId: string | null }> {
    const { workerAddress, nodeId } = await this.nodeService.getNextWorkerNode();
    if (!workerAddress) {
      throw new SdcnError(StatusCode.InternalServerError, ErrorCode.ResourceUnavailable, 'No available worker found');
    }
    return { workerAddress, nodeId };
  }
  private async getNextNodeName(): Promise<{ nodeName: string | null; nodeId: string | null }> {
    const { nodeName, nodeId } = await this.nodeService.getNextWorkerNodeByNodeName();
    if (!nodeName) {
      throw new SdcnError(StatusCode.InternalServerError, ErrorCode.ResourceUnavailable, 'No available worker found');
    }
    return { nodeName, nodeId };
  }

  private async saveNodeTask(model: string, taskType: number): Promise<NodeTask> {
    const nodeTask = {
      model,
      taskType,
      status: NodeTaskStatus.Pending,
      createTime: new Date(),
      lastModifyTime: new Date(),
    } as NodeTask;
    const resultNodeTask = await this.nodeTaskRepository.save(nodeTask);
    nodeTask.id = resultNodeTask.id;
    return nodeTask;
  }

  async taskSubmit(requestBody: JsonObject, handlerType: number, honorAmount: bigint, userId: bigint) {
    const taskCount = await this.redisService.getUserTaskCount(userId);
    if (!_.isNil(taskCount) && Number(taskCount) >= 10) {
      throw new SdcnError(
        StatusCode.BadRequest,
        ErrorCode.taskWaitingExceededLimit,
        'the number of pending tasks has exceeded the limit',
      );
    }

    let taskInfo: JsonObject;
    let priority: number;
    if (handlerType == NodeTaskType.Txt2img || handlerType == NodeTaskType.Img2img) {
      taskInfo = gatewayParamsToWebUI_xxx2img(requestBody, handlerType);
      const { width, height, step } = taskInfo!;
      priority =
        1 - calculateTaskPriority(Number(honorAmount), 1, _.toNumber(width), _.toNumber(height), _.toNumber(step));
    } else if (handlerType == NodeTaskType.Interrogate) {
      taskInfo = gatewayParamsToWebUI_interrogate(requestBody);
      priority = 1 - calculateTaskPriority(Number(honorAmount), 1, 1, 1, 1);
    }

    const { model } = requestBody;
    const nodeTask = await this.saveNodeTask(model as string, handlerType);
    const taskStatusResult = {
      taskId: nodeTask.id,
      queuePosition: (await this.taskQueue.getJobCountByTypes('delayed', 'waiting')) + 1,
      status: NodeTaskStatus.Pending,
    };
    await this.redisService.updateTaskStatus([taskStatusResult]);

    const job = await this.taskQueue.add(
      this.taskQueueName,
      {
        taskId: nodeTask.id,
        taskType: handlerType,
        taskParams: taskInfo!,
        userId: userId,
        submitTime: new Date().getTime(),
        honorAmount: honorAmount,
      },
      { priority: priority!, removeOnComplete: true, removeOnFail: true },
    );
    await this.redisService.userTaskCounterIncr(userId);
    return { taskStatus: taskStatusResult, job };
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

  async supportedModelInfo() {
    const Models = Object.entries(config.sdConfig.kValidModels).map(([hash, name]) => ({ name, hash }));
    const LoRAs = Object.entries(config.sdConfig.kValidLoras).map(([hash, name]) => ({ name, hash }));
    const Samplers = config.sdConfig.kValidSamplers;
    return { Models, LoRAs, Samplers };
  }

  private async executeTaskWrapper(taskInfo: JsonObject) {
    const { taskId, taskType } = taskInfo;
    try {
      await this.redisService.updateTaskStatus([
        {
          taskId: taskId as string,
          queuePosition: 0,
          status: NodeTaskStatus.Processing,
        },
      ]);
      let taskStatusResult: { taskId: string; queuePosition: number; status: number };
      if (taskType == NodeTaskType.Txt2img || taskType == NodeTaskType.Img2img) {
        taskStatusResult = await this.executeImageGenerateTask(taskInfo);
      } else if (taskType == NodeTaskType.Interrogate) {
        taskStatusResult = await this.executeInterrogateTask(taskInfo);
      } else {
        taskStatusResult = {
          taskId: taskId as string,
          queuePosition: 0,
          status: NodeTaskStatus.Failure,
        };
      }
      await this.redisService.updateTaskStatus([taskStatusResult!]);
      await this.nodeTaskRepository.updateStatus({
        id: taskStatusResult!.taskId,
        status: taskStatusResult!.status,
        finishTime: new Date(),
      } as NodeTask);
      await this.redisService.userTaskCounterDecr(BigInt(taskInfo.userId as string));
      if (taskStatusResult.status === NodeTaskStatus.Success) {
        await this.rewardHonorForTask(taskId as string);
      }
    } catch (error) {
      logger.error(`task error: ${taskId}`);
      logger.error(error);
      await this.redisService.updateTaskStatus([
        {
          taskId: taskId as string,
          queuePosition: 0,
          status: NodeTaskStatus.Failure,
        },
      ]);
      await this.nodeTaskRepository.updateStatus({ id: taskId, status: 3, finishTime: new Date() } as NodeTask);
      await this.redisService.userTaskCounterDecr(BigInt(taskInfo.userId as string));
      throw error;
    }
  }

  private async executeImageGenerateTask(taskInfo: JsonObject) {
    const { taskId, taskType, taskParams } = taskInfo;

    const { nodeId } = await this.getNextNodeName();
    if (nodeId === null) {
      logger.info('Cannot find a node for task.');
      return {
        taskId: taskId as string,
        queuePosition: 0,
        status: NodeTaskStatus.Failure,
      };
    }

    const commandReq: CommandRequest = {
      type: 'sd',
      uri: kXxx2ImgHttpPath[taskType as number],
      data: taskParams,
    };

    await this.nodeTaskRepository.updateNodeSeqAndStatus({
      id: taskId as string,
      status: NodeTaskStatus.Processing,
      nodeSeq: BigInt(nodeId!),
    } as NodeTask);

    const commandResultData = await this.websocketService.sendCommand(taskId as string, nodeId, commandReq);
    const status = commandResultData.code;
    if (status !== 200) {
      throw new SdcnError(StatusCode.InternalServerError, ErrorCode.NodeError, `Node response ${status}`);
    }

    this.nodeService.increaseTasksHandled(nodeId as string);
    logger.info('commandResultData', commandResultData);

    // update task status
<<<<<<< HEAD
    const images = resultObj.images;
    const seeds = JSON.parse(resultObj.info).all_seeds;
=======
>>>>>>> 8356b8b... feat: implement sendCommand in Websocket.ts
    let taskStatus: number;
    const images = (commandResultData.data as CommandResultImageData).images;
    logger.info('images', images);

    if (_.isNaN(images) || _.isNull(images) || _.isEmpty(images)) {
      taskStatus = NodeTaskStatus.Failure;
    } else {
      taskStatus = NodeTaskStatus.Success;
    }
    const taskStatusResult = {
      taskId: taskId as string,
      queuePosition: 0,
      status: taskStatus,
      seeds: seeds,
    };
    logger.info('taskStatusResult', taskStatusResult);
    return _.assign(taskStatusResult, _.omit(commandResultData.data, 'info', 'parameters'));
  }

  private async executeInterrogateTask(taskInfo: JsonObject) {
    const { workerAddress, nodeId } = await this.getNextWorkerNode();

    const { taskId, taskParams } = taskInfo;
    await this.nodeTaskRepository.updateNodeSeqAndStatus({
      id: taskId as string,
      status: NodeTaskStatus.Processing,
      nodeSeq: BigInt(nodeId!),
    } as NodeTask);

    const reqInit: RequestInit = {
      body: JSON.stringify(taskParams),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };
    const upstreamRes: globalThis.Response = await fetch(workerAddress + kInterrogateHttpPath, reqInit);
    const status = upstreamRes.status;
    if (status !== 200) {
      throw new SdcnError(StatusCode.InternalServerError, ErrorCode.UpstreamError, `Upstream response ${status}`);
    }

    const resultObj = await upstreamRes.json();
    this.nodeService.increaseTasksHandled(nodeId as string);

    const caption = resultObj.caption;
    let taskStatus: number;
    if (_.isNil(caption)) {
      taskStatus = NodeTaskStatus.Failure;
    } else {
      taskStatus = NodeTaskStatus.Success;
    }
    return {
      taskId: taskId as string,
      queuePosition: 0,
      status: taskStatus,
      caption: caption,
    };
  }

  private async rewardHonorForTask(taskId: string) {
    const nodeTask = await this.nodeTaskRepository.getById(taskId);
    await this.honorService.rewardForTask({ taskId: taskId, nodeSeq: nodeTask!.nodeSeq });
  }

  queueProcess() {
    const taskQueueWorker = new Worker(
      this.taskQueueName,
      async (job) => {
        await this.executeTaskWrapper(job.data);
      },
      { connection: this.redis, concurrency: config.serverConfig.concurrencyForTask },
    );
    taskQueueWorker.on('completed', async (job) => {
      // clear history task
      // await (await taskQueueWorker.client).del(taskQueueWorker.toKey(job.id!));
    });
    taskQueueWorker.on('failed', (_, error) => {
      logger.error(error);
    });
  }

  timerReorderTask() {
    setInterval(async () => {
      const jobs = await this.taskQueue.getJobs(['delayed', 'waiting'], 0, -1, false);
      const waittingJobs = _.forEach(jobs, async (job) => {
        if ((await job.isWaiting) || (await job.isDelayed())) {
          try {
            job.remove();
            return true;
          } catch (error) {
            return false;
          }
        } else {
          return false;
        }
      });
      const jobDataWrappers = _.map(waittingJobs, (waittingJob) => {
        const { taskType, taskParams, submitTime, honorAmount } = waittingJob.data;
        const waitTime = (new Date().getTime() - _.toNumber(submitTime)) / 1000;
        let priority: number;
        if (taskType == NodeTaskType.Txt2img || taskType == NodeTaskType.Img2img) {
          const { width, height, step } = taskParams!;
          priority =
            1 -
            calculateTaskPriority(
              Number(honorAmount),
              waitTime,
              _.toNumber(width),
              _.toNumber(height),
              _.toNumber(step),
            );
        } else if (taskType == NodeTaskType.Interrogate) {
          priority = 1 - calculateTaskPriority(Number(honorAmount), waitTime, 1, 1, 1);
        }

        return {
          jobData: waittingJob.data,
          priority: priority!,
        };
      });

      const taskStatusArray = _.map(_.sortBy(jobDataWrappers, ['priority'], ['desc']), (jobDataWrapper, index) => ({
        taskId: jobDataWrapper.jobData.taskId,
        queuePosition: index + 1,
        status: NodeTaskStatus.Pending,
      }));
      if (!_.isEmpty(taskStatusArray)) {
        this.redisService.updateTaskStatus(taskStatusArray);
      }

      _.forEach(jobDataWrappers, async (jobDataWrapper) => {
        this.taskQueue.add(this.taskQueueName, jobDataWrapper.jobData, { priority: jobDataWrapper.priority! });
      });
    }, 2000);
  }
}

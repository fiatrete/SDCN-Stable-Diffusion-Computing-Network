import _ from 'lodash';
import config from '../config';
import { HonorRecord } from '../models';
import { HonorRecordType } from '../models/enum';
import { HonorRecordRepository, UserRepository, NodeRepository } from '../repositories';
import { ErrorCode, SdcnError, StatusCode } from '../utils/responseHandler';
import * as honor from '../utils/honor';

export default class HonorService {
  userRepository: UserRepository;
  honorRecordRepository: HonorRecordRepository;
  nodeRepository: NodeRepository;
  constructor(inject: {
    userRepository: UserRepository;
    honorRecordRepository: HonorRecordRepository;
    nodeRepository: NodeRepository;
  }) {
    this.userRepository = inject.userRepository;
    this.honorRecordRepository = inject.honorRecordRepository;
    this.nodeRepository = inject.nodeRepository;
  }

  async mintHonor(accountId: bigint, honorRecordType: HonorRecordType, nodeSeq?: bigint, taskId?: string) {
    let honorAmount: bigint;
    switch (honorRecordType) {
      case HonorRecordType.Present:
        honorAmount = config.serverConfig.honorAmountForRegister;
        break;
      case HonorRecordType.RewardOnline:
        honorAmount = config.serverConfig.honorAmountForRewardOnline;
        break;
      case HonorRecordType.RewardTask:
        honorAmount = config.serverConfig.honorAmountForRewardTask;
        break;
      default:
        throw new SdcnError(StatusCode.InternalServerError, ErrorCode.Unknown, 'unknown');
    }

    const honorRecord = {
      accountId,
      type: honorRecordType,
      amount: honorAmount,
      createTime: new Date(),
    } as HonorRecord;
    if (!_.isNil(nodeSeq) && !_.isNaN(nodeSeq)) {
      honorRecord.nodeSeq = nodeSeq;
    }
    if (!_.isNil(taskId)) {
      honorRecord.taskId = taskId;
    }
    await this.honorRecordRepository.save(honorRecord);

    const user = await this.userRepository.getById(accountId);
    await this.userRepository.updateHonorAmount(BigInt(honorAmount) + BigInt(user!.honorAmount), user!);
  }

  // reward online
  async timedRewardForOnline(nodes: { nodeSeq: bigint; accountId: bigint }[]) {
    if (_.isEmpty(nodes) || _.isNil(nodes)) {
      return;
    }
    const users = await this.userRepository.getByAccountIdIn(_.map(nodes, 'accountId'));
    if (_.isEmpty(users)) {
      return;
    }
    nodes.forEach(async (node) => {
      await this.mintHonor(node.accountId, HonorRecordType.RewardOnline, node.nodeSeq, undefined);
    });
  }

  // reward from task
  async rewardForTask(task: { taskId: string; nodeSeq: bigint }) {
    const node = await this.nodeRepository.getNodeBySeq(task.nodeSeq);
    await this.mintHonor(node!.accountId, HonorRecordType.RewardTask, task.nodeSeq, task.taskId);
  }

  async transferHonor(payerId: bigint, payeeId: bigint, amount: bigint) {
    const transferHonorAmount = honor.transferToTenThousandth(amount);
    const payer = await this.userRepository.getById(payerId);
    if (payer!.honorAmount < transferHonorAmount) {
      throw new SdcnError(StatusCode.BadRequest, ErrorCode.NotSufficientHonor, 'not sufficient honor');
    }
    const payee = await this.userRepository.getById(payeeId);

    const payerUpdateRows = await this.userRepository.updateHonorAmount(
      BigInt(payer!.honorAmount) - BigInt(transferHonorAmount),
      payer!,
    );
    const payeeUpdateRows = await this.userRepository.updateHonorAmount(
      BigInt(payee!.honorAmount) + BigInt(transferHonorAmount),
      payee!,
    );
    if (payeeUpdateRows < 1 || payerUpdateRows < 1) {
      throw new SdcnError(StatusCode.BadRequest, ErrorCode.Unknown, 'transfer failure');
    }
    const honorRecord = {
      payerId,
      accountId: payeeId,
      amount: transferHonorAmount,
      type: 1,
      createTime: new Date(),
    } as HonorRecord;
    await this.honorRecordRepository.save(honorRecord);
  }
}

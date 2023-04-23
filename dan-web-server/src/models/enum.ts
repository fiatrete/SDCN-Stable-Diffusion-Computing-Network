import _ from 'lodash';

export enum RoleType {
  Default = 0,
  Admin = 1,
}
export function getRoleType(num: number) {
  return _.findKey(RoleType, (value) => value === num);
}

export enum HonorRecordType {
  Present = 0,
  Transfer = 1,
  RewardOnline = 2,
  RewardTask = 3,
  PresentBySystem = 4,
}
export function getHonorRecordType(num: number) {
  return _.findKey(HonorRecordType, (value) => value === num);
}

export enum NodeTaskType {
  Txt2img = 0,
  Img2img = 1,
  Interrogate = 2,
  Upscale = 3,
}
export function getNodeTaskType(num: number) {
  return _.findKey(NodeTaskType, (value) => value === num);
}

export enum NodeTaskStatus {
  Pending = 0,
  Processing = 1,
  Success = 2,
  Failure = 3,
}
export function getNodeTaskStatus(num: number) {
  return _.findKey(NodeTaskStatus, (value) => value === num);
}

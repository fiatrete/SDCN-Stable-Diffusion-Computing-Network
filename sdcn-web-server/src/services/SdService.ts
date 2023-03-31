import logger from '../utils/logger';
import _, { result } from 'lodash';
import { gatewayParamsToWebUI } from './utils/ParamConvert';
import NodeService from './NodeService';
import { Context } from 'koa';
import responseHandler, { ErrorCode, SdcnError, StatusCode } from '../utils/responseHandler';

const kXxx2ImgHttpPath = ['/sdapi/v1/txt2img', '/sdapi/v1/img2img'];
const kInterrogateHttpPath = '/sdapi/v1/interrogate';

export default class SdService {
  nodeService: NodeService;

  constructor(inject: { nodeService: NodeService }) {
    this.nodeService = inject.nodeService;
  }

  private async getNextWorkerNode(): Promise<string> {
    const { workerAddress } = await this.nodeService.getNextWorkerNode();
    if (!workerAddress) {
      throw new SdcnError(StatusCode.InternalServerError, ErrorCode.ResourceUnavailable, 'No available worker found');
    }
    return workerAddress;
  }

  // handerType:
  //      0 --> txt2img
  //      1 --> img2img
  private async xxx2img(context: Context, handlerType: number): Promise<void> {
    const workerAddress = await this.getNextWorkerNode();

    const req = context.request;
    const gatewayParams = req.body;
    const [webuiParams, error] = gatewayParamsToWebUI(gatewayParams, 1);
    if (!webuiParams) {
      throw new SdcnError(
        StatusCode.InternalServerError,
        ErrorCode.InvalidArgument,
        error ? error.message : 'Invalid argument',
      );
    }

    const reqInit: RequestInit = {
      body: JSON.stringify(webuiParams),
      method: 'POST',
      headers: [['Content-Type', 'application/json']],
    };
    const upstreamRes: globalThis.Response = await fetch(workerAddress + kXxx2ImgHttpPath[handlerType], reqInit);
    const status = upstreamRes.status;
    if (status !== 200) {
      throw new SdcnError(StatusCode.InternalServerError, ErrorCode.UpstreamError, `Upstream response ${status}`);
    }

    const resultObj = await upstreamRes.json();
    resultObj.info = undefined;
    resultObj.parameters = undefined;
    responseHandler.success(context, resultObj);
  }

  async txt2img(context: Context) {
    await this.xxx2img(context, 0);
  }

  async img2img(context: Context) {
    await this.xxx2img(context, 1);
  }

  async interrogate(context: Context) {
    const workerAddress = await this.getNextWorkerNode();

    const params = context.request.body;
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
    responseHandler.success(context, { caption: upstreamResObj.caption });
  }
}

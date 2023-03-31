import { Context } from 'koa';
import Router from 'koa-router';
import SdService from '../services/SdService';
import { ResponseSdcnErrorOnThrowAsync } from '../annotators/ResponseSdcnErrorOnThrow';

export default class SdControler {
  sdService: SdService;

  constructor(inject: { sdService: SdService }) {
    this.sdService = inject.sdService;
  }

  @ResponseSdcnErrorOnThrowAsync
  async txt2img(context: Context) {
    await this.sdService.txt2img(context);
  }

  @ResponseSdcnErrorOnThrowAsync
  async img2img(context: Context) {
    await this.sdService.img2img(context);
  }

  @ResponseSdcnErrorOnThrowAsync
  async interrogate(context: Context) {
    await this.sdService.interrogate(context);
  }

  router() {
    const router = new Router({ prefix: '/sd' });
    router.post('/txt2img', this.txt2img.bind(this));
    router.post('/img2img', this.img2img.bind(this));
    router.post('/interrogate', this.interrogate.bind(this));
    return router;
  }
}

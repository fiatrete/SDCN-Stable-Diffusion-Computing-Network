import type { Configuration } from 'log4js';
import log4js from 'log4js';

const config = {
  replaceConsole: true,
  appenders: {
    dateFile: {
      type: 'dateFile',
      filename: 'logs/dan-server.log',
      encoding: 'utf-8',
      layout: {
        type: 'pattern',
        pattern: '%d %p %z %m',
      },
      pattern: 'yyyy-MM-dd',
      keepFileExt: true,
      alwaysIncludePattern: true,
      numBackups: 30,
    },
    stdout: {
      type: 'stdout',
      encoding: 'utf-8',
      layout: {
        type: 'pattern',
        pattern: '%d %p %z %m',
      },
    },
  },
  categories: {
    default: { appenders: ['dateFile', 'stdout'], level: 'debug' },
  },
} as Configuration;

log4js.configure(config);

const logger = log4js.getLogger('cheese');
export default logger;

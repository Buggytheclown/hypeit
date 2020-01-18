import { LoggerTransports, LogLevels } from './logger.helpers';
import { Injectable } from '@nestjs/common';
import { ConfigService, Env } from '../config/config.service';
import { exhaustiveCheck } from '../../helpers/helpers';

export interface LoggerServiceOptions {
  transport: LoggerTransports;
  logLevels: LogLevels[];
}

@Injectable()
export class LoggerOptionsService {
  options: LoggerServiceOptions;

  constructor(configService: ConfigService) {
    const env = configService.env;

    const defaultOptions = {
      transport: LoggerTransports.CONSOLE,
      logLevels: [
        LogLevels.VERBOSE,
        LogLevels.DEBUG,
        LogLevels.WARN,
        LogLevels.ERROR,
        LogLevels.LOG,
      ],
    };

    if (env === Env.DEV) {
      this.options = defaultOptions;
    } else if (env === Env.PROD) {
      this.options = {
        ...defaultOptions,
        transport: LoggerTransports.SENTRY,
        logLevels: [LogLevels.WARN, LogLevels.ERROR],
      };
    } else if (env === Env.TEST) {
      this.options = {
        ...defaultOptions,
        transport: LoggerTransports.CONSOLE,
        logLevels: [
          LogLevels.VERBOSE,
          LogLevels.DEBUG,
          LogLevels.WARN,
          LogLevels.ERROR,
        ],
      };
    } else {
      exhaustiveCheck(env);
    }
  }
}

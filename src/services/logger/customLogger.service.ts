import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { exhaustiveCheck } from '../../helpers/helpers';
import { LoggerTransports, LogLevels } from './logger.helpers';
import { SentryTransport } from './sentryTransport.service';
import { LoggerOptionsService } from './loggerOptions.service';
import { Logger } from './connsoleTransport.service';

@Injectable()
export class CustomLoggerService implements NestLoggerService {
  private readonly transports: NestLoggerService;
  private readonly logLevels: Set<LogLevels>;

  constructor(
    loggerOptionsService: LoggerOptionsService,
    consoleTransport: Logger,
    sentryTransport: SentryTransport,
  ) {
    const { transport, logLevels } = loggerOptionsService.options;
    this.logLevels = new Set(logLevels);

    if (transport === LoggerTransports.CONSOLE) {
      this.transports = consoleTransport;
    } else if (transport === LoggerTransports.SENTRY) {
      this.transports = sentryTransport;
    } else {
      exhaustiveCheck(transport);
    }

    // TODO: Sentry.Integrations.OnUnhandledRejection
  }

  log(message: any, context?: string) {
    if (!this.logLevels.has(LogLevels.LOG)) {
      return;
    }
    this.transports.log(message, context);
  }

  error(message: any, context?: string) {
    if (!this.logLevels.has(LogLevels.ERROR)) {
      return;
    }
    this.transports.error(message, context);
  }

  warn(message: any, context?: string) {
    if (!this.logLevels.has(LogLevels.WARN)) {
      return;
    }
    this.transports.warn(message, context);
  }

  debug(message: any, context?: string) {
    if (!this.logLevels.has(LogLevels.DEBUG)) {
      return;
    }
    this.transports.debug(message, context);
  }

  verbose(message: any, context?: string) {
    if (!this.logLevels.has(LogLevels.VERBOSE)) {
      return;
    }
    this.transports.verbose(message, context);
  }
}

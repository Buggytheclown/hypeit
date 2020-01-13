import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { isObject } from '@nestjs/common/utils/shared.utils';
import { ConfigService } from '../config/config.service';

function prepareData(message: any, context?: string) {
  const output = isObject(message)
    ? `${JSON.stringify(message, null, 2)}\n`
    : message;

  const contextMessage = context ? `[${context}] ` : '';

  return `${contextMessage}${output}`;
}

@Injectable()
export class SentryTransport implements NestLoggerService {
  constructor(private readonly configService: ConfigService) {
    Sentry.init({
      dsn: configService.sentryDsn,
    });
  }

  log(message: any, context?: string) {
    Sentry.captureMessage(prepareData(message, context), Sentry.Severity.Log);
  }

  error(message: any, trace = '', context = '') {
    // message and trace are plain strings, wrap them to an Error to provide better DX for Sentry
    const err = new Error(message);
    err.stack = trace;
    Sentry.captureException(err);
  }

  warn(message: any, context?: string) {
    Sentry.captureMessage(
      prepareData(message, context),
      Sentry.Severity.Warning,
    );
  }

  debug(message: any, context?: string) {
    Sentry.captureMessage(prepareData(message, context), Sentry.Severity.Debug);
  }

  verbose(message: any, context?: string) {
    Sentry.captureMessage(prepareData(message, context), Sentry.Severity.Info);
  }
}

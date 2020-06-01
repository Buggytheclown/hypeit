import { DynamicModule, Module } from '@nestjs/common';
import { CustomLoggerService } from './customLogger.service';
import { ConfigModule } from '../config/config.module';
import { SentryTransport } from './sentryTransport.service';
import { LoggerOptionsService } from './loggerOptions.service';
import { Logger } from './connsoleTransport.service';

@Module({})
export class CustomLoggerModule {
  public static forRoot(): DynamicModule {
    return {
      module: CustomLoggerModule,
      imports: [ConfigModule],
      providers: [
        LoggerOptionsService,
        SentryTransport,
        {
          provide: Logger,
          useValue: new Logger('CLS'),
        },
        CustomLoggerService,
      ],
      exports: [CustomLoggerService],
      global: true,
    };
  }
}

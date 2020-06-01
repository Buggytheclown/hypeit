import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';

export const ConfigServiceProvider = {
  provide: ConfigService,
  useValue: new ConfigService(`env.${process.env.NODE_ENV || 'dev'}.env`),
};

@Module({
  providers: [ConfigServiceProvider],
  exports: [ConfigService],
})
export class ConfigModule {}

import { Module } from '@nestjs/common';
import { DBConnection } from './dBConnection.service';
import { PostModel } from './postModel.service';
import { ConfigModule } from '../services/config/config.module';
import { UserModelService } from './userModel.service';
import { EventModelService } from './eventModel.service';

@Module({
  imports: [ConfigModule],
  providers: [DBConnection, PostModel, UserModelService, EventModelService],
  exports: [DBConnection, PostModel, UserModelService, EventModelService],
})
export class DbModule {}

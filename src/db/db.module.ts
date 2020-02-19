import { Module } from '@nestjs/common';
import { DBConnection } from './dBConnection.service';
import { PostModel } from './postModel.service';
import { ConfigModule } from '../services/config/config.module';
import { UserModelService } from './userModel.service';

@Module({
  imports: [ConfigModule],
  providers: [DBConnection, PostModel, UserModelService],
  exports: [DBConnection, PostModel, UserModelService],
})
export class DbModule {}

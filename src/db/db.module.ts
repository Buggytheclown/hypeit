import { Module } from '@nestjs/common';
import { DBConnection } from './dBConnection.service';
import { PostModel } from './post.service';
import { ConfigModule } from '../services/config/config.module';
import { UserService } from './user.service';

@Module({
  imports: [ConfigModule],
  providers: [DBConnection, PostModel, UserService],
  exports: [DBConnection, PostModel, UserService],
})
export class DbModule {}

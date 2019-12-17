import { Module } from '@nestjs/common';
import { DBConnection } from './dBConnection.service';
import { PostModel } from './post.service';
import { ConfigModule } from '../services/config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [DBConnection, PostModel],
  exports: [DBConnection, PostModel],
})
export class DbModule {}

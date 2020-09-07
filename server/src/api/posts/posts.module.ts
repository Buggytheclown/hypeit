import { Module } from '@nestjs/common';
import { PostController } from './posts.controller';
import { DbModule } from '../../db/db.module';

@Module({
  controllers: [PostController],
  imports: [DbModule],
})
export class PostModule {}

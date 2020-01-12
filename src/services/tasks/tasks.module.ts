import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PostDeliveryModule } from '../postDelivery/postDelivery.module';

@Module({
  imports: [PostDeliveryModule],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}

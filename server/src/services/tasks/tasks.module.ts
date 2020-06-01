import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PostDeliveryModule } from '../postDelivery/postDelivery.module';
import { EventDeliveryModule } from '../eventDelivery/eventDelivery.module';

@Module({
  imports: [PostDeliveryModule, EventDeliveryModule],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}

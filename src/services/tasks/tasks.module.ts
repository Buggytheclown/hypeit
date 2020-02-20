import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PostDeliveryModule } from '../postDelivery/postDelivery.module';
import { DevbyEventsModule } from '../../eventGrabbers/devby/devbyEvents.module';
import { DbModule } from '../../db/db.module';

@Module({
  imports: [PostDeliveryModule, DevbyEventsModule, DbModule],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}

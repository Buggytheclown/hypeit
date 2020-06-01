import { Module } from '@nestjs/common';
import { EventDeliveryService } from './eventDelivery.service';
import { DevbyEventsModule } from '../../eventGrabbers/devby/devbyEvents.module';
import { DbModule } from '../../db/db.module';

@Module({
  imports: [DevbyEventsModule, DbModule],
  providers: [EventDeliveryService],
  exports: [EventDeliveryService],
})
export class EventDeliveryModule {}

import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventModelService } from '../../db/eventModel.service';

@Module({
  controllers: [EventController],
  imports: [EventModelService],
  exports: [EventModelService],
})
export class EventModule {}

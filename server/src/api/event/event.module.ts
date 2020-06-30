import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventModelService } from '../../db/eventModel.service';
import { DBConnection } from '../../db/dBConnection.service';

@Module({
  controllers: [EventController],
  providers: [EventModelService, DBConnection],
})
export class EventModule {}

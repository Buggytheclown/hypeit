import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { DbModule } from '../../db/db.module';

@Module({
  controllers: [EventController],
  imports: [DbModule],
})
export class EventModule {}

import { Module } from '@nestjs/common';
import { HabrGrabberModule } from '../../postGrabbers/habr/habrGrabber.module';
import { PostDeliveryService } from './postDelivery.service';
import { DbModule } from '../../db/db.module';

@Module({
  imports: [DbModule, HabrGrabberModule],
  providers: [PostDeliveryService],
  exports: [PostDeliveryService],
})
export class PostDeliveryModule {}

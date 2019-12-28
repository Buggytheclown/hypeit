import { Module } from '@nestjs/common';
import { HabrGrabberModule } from '../../postGrabbers/habr/habrGrabber.module';
import { PostDeliveryService } from './postDelivery.service';
import { DbModule } from '../../db/db.module';
import { MediumGrabberModule } from '../../postGrabbers/medium/mediumGrabber.module';

@Module({
  imports: [DbModule, HabrGrabberModule, MediumGrabberModule],
  providers: [PostDeliveryService],
  exports: [PostDeliveryService],
})
export class PostDeliveryModule {}

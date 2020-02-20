import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PostDeliveryService } from '../postDelivery/postDelivery.service';
import { DevbyEventsGrabberService } from '../../eventGrabbers/devby/devbyEventsGrabber.service';
import { EventModelService } from '../../db/eventModel.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly postDeliveryService: PostDeliveryService,
    private readonly devbyEventsService: DevbyEventsGrabberService,
    private readonly eventModelService: EventModelService,
  ) {
  }

  @Cron('0 */4 * * *')
  async handleCron() {
    this.postDeliveryService
      .updatePosts({
        period: this.postDeliveryService.period.WEEK,
      })
      .subscribe();

    this.devbyEventsService
      .getEvents(10)
      .then(data => this.eventModelService.saveEvents(data));
  }
}

import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PostDeliveryService } from '../postDelivery/postDelivery.service';
import { EventDeliveryService } from '../eventDelivery/eventDelivery.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly postDeliveryService: PostDeliveryService,
    private readonly eventDeliveryService: EventDeliveryService,
  ) {}

  @Cron('0 */4 * * *')
  async handleCron() {
    this.postDeliveryService
      .updatePosts({
        period: this.postDeliveryService.period.WEEK,
      })
      .subscribe();

    this.eventDeliveryService.updateEvent({ pageCount: 10 });
  }
}

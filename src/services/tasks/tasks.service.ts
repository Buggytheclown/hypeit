import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PostDeliveryService } from '../postDelivery/postDelivery.service';

@Injectable()
export class TasksService {
  constructor(private readonly postDeliveryService: PostDeliveryService) {}

  @Cron('0 */4 * * *')
  async handleCron() {
    await this.postDeliveryService.saveBestOfTheWeek();
  }
}

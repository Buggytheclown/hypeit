import { Controller, Get } from '@nestjs/common';
import { PostDeliveryService } from './services/postDelivery/postDelivery.service';

@Controller()
export class AppController {
  constructor(private readonly postDeliveryService: PostDeliveryService) {}

  @Get('/')
  async rootRoute() {
    return 'rootRoute';
  }

  @Get('/update')
  async updatePosts() {
    await this.postDeliveryService.saveBestOfTheWeek();
    await this.postDeliveryService.saveBestOfTheMonth();
    return 'ok';
  }
}

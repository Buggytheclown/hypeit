import {
  Controller,
  Get,
  Req,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { EventModelService } from '../../db/eventModel.service';
import { BasicEventsPageData } from './event.controller.helpers';

/**  
TODO
1. Решить вопрос с camelCase  - event_id
2. Добавить toggle endpoint для просмотренных
3. Добавить на возврат всем events isSeen
4. Формализовать время UTS
5. Посмотреть что возвращает база, если ничего не найдено

TODO NEXT
1. Добавить swagger
*/
@Controller()
export class EventController {
  constructor(private readonly eventModelService: EventModelService) {}

  @Get('/api/v1/events')
  async getPosts(@Req() request): Promise<BasicEventsPageData> {
    if (request.session.user?.user_id) {
      const events = await this.eventModelService.getEvents({
        featureXDays: 14,
        userId: request.session.user.user_id,
      });
      return {
        events: events || [],
      };
    }

    throw new HttpException('Please, authorization', HttpStatus.UNAUTHORIZED);
  }
}

import { Injectable } from '@nestjs/common';
import { DevbyEventsGrabberService } from '../../eventGrabbers/devby/devbyEventsGrabber.service';
import { EventModelService } from '../../db/eventModel.service';

@Injectable()
export class EventDeliveryService {
  constructor(
    private readonly devbyEventsService: DevbyEventsGrabberService,
    private readonly eventModelService: EventModelService,
  ) {}

  async updateEvent({ pageCount }: { pageCount: number }) {
    return this.devbyEventsService
      .getEvents(10)
      .then(data => this.eventModelService.saveEvents(data));
  }
}

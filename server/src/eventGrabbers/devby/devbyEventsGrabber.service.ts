import { Injectable } from '@nestjs/common';
import { DevbyEventsParserService } from './devbyEventsParser.service';
import * as _ from 'lodash';
import { DevbyEventsHttpService } from './devbyEventsHttp.service';

@Injectable()
export class DevbyEventsGrabberService {
  constructor(
    private readonly parser: DevbyEventsParserService,
    private readonly http: DevbyEventsHttpService,
  ) {}

  getEvents(pageCount: number) {
    return this.http
      .getEvents(pageCount)
      .then(pages => pages.map(page => this.parser.parse(page as string)))
      .then(_.flatten);
  }
}

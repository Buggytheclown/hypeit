import { Module } from '@nestjs/common';
import { DevbyEventsGrabberService } from './devbyEventsGrabber.service';
import { DevbyEventsParserService } from './devbyEventsParser.service';
import { DevbyEventsHttpService } from './devbyEventsHttp.service';

@Module({
  providers: [DevbyEventsGrabberService, DevbyEventsParserService, DevbyEventsHttpService],
  exports: [DevbyEventsGrabberService],
})
export class DevbyEventsModule {}

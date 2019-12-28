import { Module } from '@nestjs/common';
import { MediumParserService } from './mediumParser.service';
import { MediumHttpService } from './mediumHttp.service';
import { MediumPostGrabberService } from './mediumPostGrabber.service';

@Module({
  providers: [MediumParserService, MediumHttpService, MediumPostGrabberService],
  exports: [MediumPostGrabberService],
})
export class MediumGrabberModule {}

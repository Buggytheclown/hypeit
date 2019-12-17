import { Module } from '@nestjs/common';
import { HabrPostGrabberService } from './habrPostGrabber.service';
import { HabrParserService } from './habrParser.service';

@Module({
  providers: [HabrPostGrabberService, HabrParserService],
  exports: [HabrPostGrabberService, HabrParserService],
})
export class HabrGrabberModule {}

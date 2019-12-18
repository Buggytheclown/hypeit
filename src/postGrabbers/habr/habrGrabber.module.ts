import { Module } from '@nestjs/common';
import { HabrPostGrabberService } from './habrPostGrabber.service';
import { HabrParserService } from './habrParser.service';
import { HabrHttpService } from './habrHttp.service';

@Module({
  providers: [HabrPostGrabberService, HabrParserService, HabrHttpService],
  exports: [HabrPostGrabberService],
})
export class HabrGrabberModule {}

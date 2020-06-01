import { Module } from '@nestjs/common';
import { DevtoHttpService } from './devtoHttp.service';
import { DevtoParserService } from './devtoParser.service';
import { DevtoPostGrabberService } from './devtoPostGrabber.service';

@Module({
  providers: [DevtoHttpService, DevtoParserService, DevtoPostGrabberService],
  exports: [DevtoPostGrabberService],
})
export class DevtoGrabberModule {}

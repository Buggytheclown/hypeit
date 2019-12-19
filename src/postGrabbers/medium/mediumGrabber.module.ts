import { Module } from '@nestjs/common';
import { MediumParserService } from './mediumParser.service';


@Module({
  providers: [MediumParserService],
  exports: [],
})
export class MediumGrabberModule {}

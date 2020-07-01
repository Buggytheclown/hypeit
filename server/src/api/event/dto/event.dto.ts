import { ApiProperty } from '@nestjs/swagger';

export class EventDto {
  @ApiProperty()
  event_id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  link: string;

  @ApiProperty()
  time: string;
}

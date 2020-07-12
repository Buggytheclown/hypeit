import { ApiProperty } from '@nestjs/swagger';

export class PostRequestDto {
  @ApiProperty({
    required: false,
  })
  userId: number;

  @ApiProperty()
  lastXDays: number;

  @ApiProperty({
    required: false,
  })
  tagName: string;

  @ApiProperty({
    required: false,
  })
  bookmarked: boolean;

  @ApiProperty({
    required: false,
  })
  isNextPage: boolean;
}

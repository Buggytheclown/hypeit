import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean } from 'class-validator';
export class PostRequestDto {
  @ApiProperty({
    required: false,
  })
  @IsNumber()
  userId: number;

  @ApiProperty()
  @IsNumber()
  lastXDays: number;

  @ApiProperty({
    required: false,
  })
  @IsString()
  tagName: string;

  @ApiProperty({
    required: false,
  })
  @IsBoolean()
  bookmarked: boolean;

  @ApiProperty({
    required: false,
  })
  @IsBoolean()
  isNextPage: boolean;
}

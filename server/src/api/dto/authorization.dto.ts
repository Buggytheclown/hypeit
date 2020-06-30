import { ApiProperty } from '@nestjs/swagger';

export class AithorizationDto {
  @ApiProperty({
    example: 'Please, authorization',
  })
  message: string;
}

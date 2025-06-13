import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class SubmitAnswerDto {
  @ApiProperty({
    description: 'ID of the selected answer',
    type: Number,
    minimum: 1,
    example: 1,
  })
  @IsNumber()
  @Min(1)
  answerId: number;
}

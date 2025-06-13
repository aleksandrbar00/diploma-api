import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  Min,
  ArrayMinSize,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({
    description: 'Title of the lesson session',
    type: String,
    example: 'Geography Quiz - European Capitals',
    required: false,
  })
  @IsString()
  @MinLength(3)
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Array of question IDs to include in the lesson',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  questionIds: number[];

  @ApiProperty({
    description: 'Maximum time allowed for the lesson in seconds',
    type: Number,
    minimum: 30,
    example: 300,
  })
  @IsNumber()
  @Min(30)
  maxTimeInSeconds: number;
}

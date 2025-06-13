import { ApiProperty } from '@nestjs/swagger';
import { LessonSessionStatus } from '../lesson-session.entity';
import { IsOptional } from 'class-validator';

class CategoryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Geography' })
  title: string;
}

class SubcategoryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'European Capitals' })
  title: string;

  @ApiProperty({ type: CategoryDto })
  category: CategoryDto;
}

class AnswerDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Paris' })
  title: string;
}

class QuestionDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'What is the capital of France?' })
  title: string;

  @ApiProperty({ type: [AnswerDto] })
  answers: AnswerDto[];

  @ApiProperty({ type: AnswerDto })
  correctAnswer: AnswerDto;

  @ApiProperty({ type: SubcategoryDto })
  subcategory: SubcategoryDto;
}

export class LessonSessionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: 'Geography Quiz - European Capitals',
    nullable: true,
    required: false,
  })
  title: string | null;

  @ApiProperty({
    enum: LessonSessionStatus,
    example: LessonSessionStatus.IN_PROGRESS,
  })
  status: LessonSessionStatus;

  @ApiProperty({ type: QuestionDto })
  currentQuestion: QuestionDto;

  @ApiProperty({ type: [QuestionDto] })
  questions: QuestionDto[];

  @ApiProperty({ example: 2 })
  correctAnswersCount: number;

  @ApiProperty({ example: 5 })
  totalQuestions: number;

  @ApiProperty({ example: 240 })
  timeRemaining: number;

  @ApiProperty({ example: '2024-03-14T12:00:00Z' })
  startedAt: Date;

  @ApiProperty({ example: '2024-03-14T12:05:00Z', nullable: true })
  finishedAt: Date | null;

  @ApiProperty({ example: 300, nullable: true })
  totalTimeInSeconds: number | null;
}

export class SubmitAnswerResponseDto {
  @ApiProperty({ example: true })
  isCorrect: boolean;

  @ApiProperty({ example: 1 })
  correctAnswerId: number;

  @ApiProperty({ example: false })
  isLastQuestion: boolean;

  @ApiProperty({ example: 2 })
  score: number;

  @ApiProperty({ example: 240 })
  timeRemaining: number;
}

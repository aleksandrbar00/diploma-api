import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonSession } from './lesson-session.entity';
import { Question } from '../questions/question.entity';
import { QuestionAnswer } from '../questions/question-answer.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([LessonSession, Question, QuestionAnswer]),
    ScheduleModule.forRoot(),
  ],
  providers: [LessonsService],
  controllers: [LessonsController],
  exports: [LessonsService],
})
export class LessonsModule {}

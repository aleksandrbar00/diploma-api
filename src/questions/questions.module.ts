import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionCategory } from './category.entity';
import { QuestionSubcategory } from './subcategory.entity';
import { Question } from './question.entity';
import { QuestionAnswer } from './question-answer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestionCategory,
      QuestionSubcategory,
      Question,
      QuestionAnswer,
    ]),
  ],
  providers: [QuestionsService],
  controllers: [QuestionsController],
})
export class QuestionsModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { QuestionsModule } from './questions/questions.module';
import { QuestionCategory } from './questions/category.entity';
import { QuestionSubcategory } from './questions/subcategory.entity';
import { Question } from './questions/question.entity';
import { QuestionAnswer } from './questions/question-answer.entity';
import { LessonsModule } from './lessons/lessons.module';
import { LessonSession } from './lessons/lesson-session.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'diploma',
      synchronize: true, // Disable in production!
      entities: [
        User,
        QuestionCategory,
        QuestionSubcategory,
        Question,
        QuestionAnswer,
        LessonSession,
      ],
      logging: true,
    }),
    AuthModule,
    UsersModule,
    QuestionsModule,
    LessonsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

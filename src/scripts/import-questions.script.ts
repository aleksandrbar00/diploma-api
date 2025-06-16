// src/scripts/import-questions.ts
import { NestFactory } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {
  CategoryImport,
  QuestionImportService,
} from '../questions/import/import-questions.service';
import { Question } from '../questions/question.entity';
import { QuestionAnswer } from '../questions/question-answer.entity';
import { QuestionCategory } from '../questions/category.entity';
import { QuestionSubcategory } from '../questions/subcategory.entity';
import { User } from 'src/users/user.entity';
import { LessonSession } from 'src/lessons/lesson-session.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST ?? 'localhost',
      port: parseInt(process.env.DATABASE_PORT ?? '5433'),
      username: process.env.DATABASE_USERNAME ?? 'postgres',
      password: process.env.DATABASE_PASSWORD ?? 'root',
      database: process.env.DATABASE_NAME ?? 'diploma_db',
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
    TypeOrmModule.forFeature([
      Question,
      QuestionAnswer,
      QuestionCategory,
      QuestionSubcategory,
    ]),
  ],
  providers: [QuestionImportService],
})
class ImportModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ImportModule);
  const importService = app.get(QuestionImportService);

  try {
    const jsonPath = path.join(__dirname, 'questions.json');
    const jsonData = JSON.parse(
      fs.readFileSync(jsonPath, 'utf8'),
    ) as CategoryImport;

    console.log('Starting import...');
    await importService.importFromJson(jsonData);
    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();

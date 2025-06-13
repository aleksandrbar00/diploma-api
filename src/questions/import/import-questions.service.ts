import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../question.entity';
import { QuestionAnswer } from '../question-answer.entity';
import { QuestionCategory } from '../category.entity';
import { QuestionSubcategory } from '../subcategory.entity';

export interface AnswerImport {
  id: number;
  title: string;
}

export interface QuestionImport {
  id: number;
  title: string;
  answers: AnswerImport[];
  correctAnswerId: number;
}

export interface SubcategoryImport {
  id: number;
  title: string;
  questions: QuestionImport[];
}

export interface CategoryImport {
  title: string;
  subcategories: SubcategoryImport[];
}

@Injectable()
export class QuestionImportService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(QuestionAnswer)
    private readonly answerRepository: Repository<QuestionAnswer>,
    @InjectRepository(QuestionCategory)
    private readonly categoryRepository: Repository<QuestionCategory>,
    @InjectRepository(QuestionSubcategory)
    private readonly subcategoryRepository: Repository<QuestionSubcategory>,
  ) {}

  async importFromJson(jsonData: CategoryImport) {
    // Create category (always new)
    const category = this.categoryRepository.create({
      title: jsonData.title,
    });
    await this.categoryRepository.save(category);

    for (const subcatData of jsonData.subcategories) {
      // Create subcategory (always new)
      const subcategory = this.subcategoryRepository.create({
        title: subcatData.title,
        category,
      });
      await this.subcategoryRepository.save(subcategory);

      // Process questions
      for (const questionData of subcatData.questions) {
        await this.processQuestion(questionData, subcategory);
      }
    }
  }

  private async processQuestion(
    questionData: QuestionImport,
    subcategory: QuestionSubcategory,
  ) {
    // Create question (ignore original ID)
    const question = this.questionRepository.create({
      title: questionData.title,
      subcategory,
    });
    await this.questionRepository.save(question);

    // Create all answers first
    const answerEntities = await Promise.all(
      questionData.answers.map((answerData) => {
        return this.answerRepository.save(
          this.answerRepository.create({
            title: answerData.title,
            question,
          }),
        );
      }),
    );

    // Find and set correct answer
    const correctAnswer = answerEntities.find(
      (a) =>
        a.title ===
        questionData.answers.find(
          (originalAnswer) =>
            originalAnswer.id === questionData.correctAnswerId,
        )?.title,
    );

    if (correctAnswer) {
      question.correctAnswer = correctAnswer;
      await this.questionRepository.save(question);
    }
  }
}

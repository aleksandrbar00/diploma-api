import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionCategory } from './category.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(QuestionCategory)
    private readonly categoryRepository: Repository<QuestionCategory>,
  ) {}

  async getAllQuestionsStructured() {
    const categories = await this.categoryRepository.find({
      relations: {
        subcategories: {
          questions: {
            answers: true,
            correctAnswer: true,
          },
        },
      },
      order: {
        subcategories: {
          id: 'ASC',
          questions: {
            id: 'ASC',
          },
        },
      },
    });

    return categories.map((category) => ({
      title: category.title,
      subcategories: category.subcategories.map((subcategory) => ({
        id: subcategory.id,
        title: subcategory.title,
        questions: subcategory.questions.map((question) => ({
          id: question.id,
          title: question.title,
          answers: question.answers,
          correctAnswer: question.correctAnswer,
        })),
      })),
    }));
  }
}

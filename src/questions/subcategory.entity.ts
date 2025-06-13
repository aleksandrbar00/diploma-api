import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from './question.entity';
import { QuestionCategory } from './category.entity';

@Entity()
export class QuestionSubcategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @OneToMany(() => Question, (question) => question.subcategory)
  questions: Question[];

  @ManyToOne(() => QuestionCategory, (category) => category.subcategories)
  category: QuestionCategory;
}

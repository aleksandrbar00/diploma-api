import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuestionAnswer } from './question-answer.entity';
import { QuestionSubcategory } from './subcategory.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @OneToMany(() => QuestionAnswer, (answer) => answer.question)
  answers: QuestionAnswer[];

  @ManyToOne(() => QuestionAnswer)
  @JoinColumn()
  correctAnswer: QuestionAnswer;

  @ManyToOne(() => QuestionSubcategory, (subcategory) => subcategory.questions)
  subcategory: QuestionSubcategory;
}

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { QuestionSubcategory } from './subcategory.entity';

@Entity()
export class QuestionCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @OneToMany(() => QuestionSubcategory, (subcategory) => subcategory.category)
  subcategories: QuestionSubcategory[];
}

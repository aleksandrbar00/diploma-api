import {
  Column,
  Entity,
  ManyToOne,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Question } from '../questions/question.entity';
import { User } from '../users/user.entity';

export enum LessonSessionStatus {
  STARTED = 'started',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
}

@Entity()
export class LessonSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Question)
  currentQuestion: Question;

  @ManyToMany(() => Question)
  @JoinTable({
    name: 'lesson_session_questions',
    joinColumn: {
      name: 'lesson_session_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'question_id',
      referencedColumnName: 'id',
    },
  })
  questions: Question[];

  @Column({
    type: 'enum',
    enum: LessonSessionStatus,
    default: LessonSessionStatus.STARTED,
  })
  status: LessonSessionStatus;

  @Column({ type: 'int', default: 0 })
  correctAnswersCount: number;

  @Column({ type: 'int', default: 0 })
  totalQuestions: number;

  @Column({ type: 'int' })
  maxTimeInSeconds: number;

  @CreateDateColumn()
  startedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  finishedAt: Date;

  @Column({ type: 'int', nullable: true })
  totalTimeInSeconds: number;
}

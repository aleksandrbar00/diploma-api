import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonSession, LessonSessionStatus } from './lesson-session.entity';
import { Question } from '../questions/question.entity';
import { QuestionAnswer } from '../questions/question-answer.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  LessonSessionResponseDto,
  SubmitAnswerResponseDto,
} from './dto/lesson-response.dto';

@Injectable()
export class LessonsService implements OnModuleInit {
  private readonly CHECK_INTERVAL = 10000; // 10 seconds
  private timer: NodeJS.Timeout;

  constructor(
    @InjectRepository(LessonSession)
    private readonly lessonSessionRepository: Repository<LessonSession>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(QuestionAnswer)
    private readonly answerRepository: Repository<QuestionAnswer>,
  ) {}

  onModuleInit() {
    // Start the timer when the module initializes
    this.startTimer();
  }

  private startTimer() {
    this.timer = setInterval(() => {
      this.checkAndFinishExpiredLessons();
    }, this.CHECK_INTERVAL);
  }

  private calculateTimeRemaining(lessonSession: LessonSession): number {
    const timeElapsed = Math.floor(
      (Date.now() - lessonSession.startedAt.getTime()) / 1000,
    );
    return Math.max(0, lessonSession.maxTimeInSeconds - timeElapsed);
  }

  private mapToLessonSessionResponse(
    lessonSession: LessonSession,
  ): LessonSessionResponseDto {
    return {
      id: lessonSession.id,
      title: lessonSession.title,
      status: lessonSession.status,
      currentQuestion: lessonSession.currentQuestion,
      questions: lessonSession.questions,
      correctAnswersCount: lessonSession.correctAnswersCount,
      totalQuestions: lessonSession.totalQuestions,
      timeRemaining: this.calculateTimeRemaining(lessonSession),
      startedAt: lessonSession.startedAt,
      finishedAt: lessonSession.finishedAt,
      totalTimeInSeconds: lessonSession.totalTimeInSeconds,
    };
  }

  async getUserLessonHistory(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    lessons: LessonSessionResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const [lessons, total] = await this.lessonSessionRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['currentQuestion', 'currentQuestion.answers', 'questions'],
      order: { startedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const mappedLessons = lessons.map((lesson) =>
      this.mapToLessonSessionResponse(lesson),
    );

    return {
      lessons: mappedLessons,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createLessonSession(
    userId: number,
    questionIds: number[],
    maxTimeInSeconds: number,
    title?: string,
  ): Promise<LessonSessionResponseDto> {
    // Validate questions exist
    const questions = await this.questionRepository.findByIds(questionIds);
    if (questions.length !== questionIds.length) {
      throw new NotFoundException('Some questions were not found');
    }

    const lessonSession = this.lessonSessionRepository.create({
      user: { id: userId },
      questions,
      currentQuestion: questions[0],
      status: LessonSessionStatus.STARTED,
      totalQuestions: questions.length,
      maxTimeInSeconds,
      correctAnswersCount: 0,
      title: title,
    });

    await this.lessonSessionRepository.save(lessonSession);

    // Fetch the saved session with all relations
    const savedSession = await this.lessonSessionRepository.findOne({
      where: { id: lessonSession.id },
      relations: [
        'currentQuestion',
        'currentQuestion.answers',
        'currentQuestion.correctAnswer',
        'currentQuestion.subcategory',
        'currentQuestion.subcategory.category',
        'questions',
        'questions.answers',
        'questions.correctAnswer',
        'questions.subcategory',
        'questions.subcategory.category',
      ],
    });

    if (!savedSession) {
      throw new NotFoundException('Failed to create lesson session');
    }

    return this.mapToLessonSessionResponse(savedSession);
  }

  async submitAnswer(
    lessonSessionId: number,
    userId: number,
    answerId: number,
  ): Promise<SubmitAnswerResponseDto> {
    const lessonSession = await this.lessonSessionRepository.findOne({
      where: { id: lessonSessionId, user: { id: userId } },
      relations: [
        'currentQuestion',
        'currentQuestion.correctAnswer',
        'questions',
      ],
    });

    if (!lessonSession) {
      throw new NotFoundException('Lesson session not found');
    }

    if (lessonSession.status === LessonSessionStatus.FINISHED) {
      throw new BadRequestException('Lesson session is already finished');
    }

    // Check if lesson has expired
    const timeElapsed = Math.floor(
      (Date.now() - lessonSession.startedAt.getTime()) / 1000,
    );
    if (timeElapsed > lessonSession.maxTimeInSeconds) {
      await this.finishLesson(lessonSession);
      throw new BadRequestException('Lesson time has expired');
    }

    // Get current question and check answer
    const currentQuestion = lessonSession.currentQuestion;
    const isCorrect = currentQuestion.correctAnswer.id === answerId;

    // Update correct answers count if answer is correct
    if (isCorrect) {
      lessonSession.correctAnswersCount += 1;
    }

    // Find next question
    const currentQuestionIndex = lessonSession.questions.findIndex(
      (q) => q.id === currentQuestion.id,
    );
    const nextQuestion = lessonSession.questions[currentQuestionIndex + 1];

    if (nextQuestion) {
      // Update to next question
      lessonSession.currentQuestion = nextQuestion;
      lessonSession.status = LessonSessionStatus.IN_PROGRESS;
    } else {
      // Finish lesson if no more questions
      await this.finishLesson(lessonSession);
    }

    await this.lessonSessionRepository.save(lessonSession);

    const timeRemaining = this.calculateTimeRemaining(lessonSession);

    return {
      isCorrect,
      correctAnswerId: currentQuestion.correctAnswer.id,
      isLastQuestion: !nextQuestion,
      score: lessonSession.correctAnswersCount,
      timeRemaining,
    };
  }

  private async finishLesson(lessonSession: LessonSession) {
    lessonSession.status = LessonSessionStatus.FINISHED;
    lessonSession.finishedAt = new Date();
    lessonSession.totalTimeInSeconds = Math.floor(
      (lessonSession.finishedAt.getTime() - lessonSession.startedAt.getTime()) /
        1000,
    );
    await this.lessonSessionRepository.save(lessonSession);
  }

  async getLessonSession(
    lessonSessionId: number,
    userId: number,
  ): Promise<LessonSessionResponseDto> {
    const lessonSession = await this.lessonSessionRepository.findOne({
      where: { id: lessonSessionId, user: { id: userId } },
      relations: [
        'currentQuestion',
        'currentQuestion.answers',
        'currentQuestion.correctAnswer',
        'currentQuestion.subcategory',
        'currentQuestion.subcategory.category',
        'questions',
        'questions.answers',
        'questions.correctAnswer',
        'questions.subcategory',
        'questions.subcategory.category',
      ],
    });

    if (!lessonSession) {
      throw new NotFoundException('Lesson session not found');
    }

    return this.mapToLessonSessionResponse(lessonSession);
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async checkAndFinishExpiredLessons(): Promise<void> {
    const now = new Date();
    const expiredLessons = await this.lessonSessionRepository
      .createQueryBuilder('lesson')
      .where('lesson.status IN (:...statuses)', {
        statuses: [
          LessonSessionStatus.STARTED,
          LessonSessionStatus.IN_PROGRESS,
        ],
      })
      .andWhere(
        'EXTRACT(EPOCH FROM (:now - lesson.startedAt)) > lesson.maxTimeInSeconds',
        {
          now,
        },
      )
      .getMany();

    for (const lesson of expiredLessons) {
      await this.finishLesson(lesson);
    }
  }
}

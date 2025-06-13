import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import {
  LessonSessionResponseDto,
  SubmitAnswerResponseDto,
} from './dto/lesson-response.dto';

@ApiTags('lessons')
@Controller('lessons')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lesson session' })
  @ApiResponse({
    status: 201,
    description: 'Lesson session created successfully',
    type: LessonSessionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Some questions were not found' })
  async createLesson(
    @Request() req,
    @Body() createLessonDto: CreateLessonDto,
  ): Promise<LessonSessionResponseDto> {
    return this.lessonsService.createLessonSession(
      req.user.id,
      createLessonDto.questionIds,
      createLessonDto.maxTimeInSeconds,
      createLessonDto.title,
    );
  }

  @Get('my-history')
  @ApiOperation({ summary: 'Get user lesson history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lesson history retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        lessons: {
          type: 'array',
          items: { $ref: '#/components/schemas/LessonSessionResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async getLessonHistory(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.lessonsService.getUserLessonHistory(
      req.user.id,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  @Post(':id/answer')
  @ApiOperation({ summary: 'Submit an answer for the current question' })
  @ApiResponse({
    status: 200,
    description: 'Answer submitted successfully',
    type: SubmitAnswerResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Lesson time has expired or lesson is already finished',
  })
  @ApiResponse({ status: 404, description: 'Lesson session not found' })
  async submitAnswer(
    @Request() req,
    @Param('id') lessonId: number,
    @Body() submitAnswerDto: SubmitAnswerDto,
  ): Promise<SubmitAnswerResponseDto> {
    return this.lessonsService.submitAnswer(
      lessonId,
      req.user.id,
      submitAnswerDto.answerId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson session details' })
  @ApiResponse({
    status: 200,
    description: 'Lesson session retrieved successfully',
    type: LessonSessionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Lesson session not found' })
  async getLesson(
    @Request() req,
    @Param('id') lessonId: number,
  ): Promise<LessonSessionResponseDto> {
    return this.lessonsService.getLessonSession(lessonId, req.user.id);
  }
}

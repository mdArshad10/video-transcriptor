import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CourseService } from './course.service';
import {
  CreateCourseDto,
  CreateAssignmentDto,
  ListCoursesQueryDto,
  UpdateCourseDto,
} from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AuthUser } from '../../auth/interfaces/auth-user.interface';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class LmsCoursesController {
  private readonly logger = new Logger(LmsCoursesController.name);

  constructor(private readonly courseService: CourseService) { }

  // ─── Create ────────────────────────────────────────────────────────────────

  /** POST /courses */
  @Post()
  create(@Body() dto: CreateCourseDto, @CurrentUser() user: AuthUser) {
    this.logger.log('create course');
    return this.courseService.createCourse(dto, user);
  }

  // ─── Read ──────────────────────────────────────────────────────────────────

  /**
   * GET /courses/my
   * Returns courses relevant to the current user.
   * Supports filters: owned_by_me, assigned_to_me, status, page, limit, sort
   *
   * NOTE: this route MUST be declared before `:id` so NestJS matches it first.
   */
  @Get('my')
  findMy(@Query() query: ListCoursesQueryDto, @CurrentUser() user: AuthUser) {
    this.logger.log(`findMy courses – query: ${JSON.stringify(query)}`);
    return this.courseService.getMyCourses(query, user);
  }

  @Get(":id")
  getCourseById(@Param("id") id: string) {
    this.logger.log(`get course ${id}`);
    return this.courseService.getCourseById(id);
  }

  // ─── Update ────────────────────────────────────────────────────────────────

  /** PATCH /courses/:id */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    this.logger.log(`update course ${id}`);
    return this.courseService.updateCourse(id, dto);
  }

  // ─── Assignment ────────────────────────────────────────────────────────────

  /** POST /courses/:id/assign */
  @Post(':id/assign')
  assign(
    @Param('id') id: string,
    @Body() dto: CreateAssignmentDto,
    @CurrentUser() user: AuthUser,
  ) {
    this.logger.log(`assign course ${id} to ${dto.targetType}:${dto.targetId}`);
    return this.courseService.assign(id, dto, user);
  }

  // ─── Delete ────────────────────────────────────────────────────────────────

  /** DELETE /courses/:id  (soft delete) */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    this.logger.log(`soft-delete course ${id}`);
    return this.courseService.deleteCourse(id);
  }
}

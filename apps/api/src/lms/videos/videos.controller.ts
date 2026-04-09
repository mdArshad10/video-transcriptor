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
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto, UpdateVideoDto } from './dto';

@Controller()
export class VideosController {
  private readonly logger = new Logger(VideosController.name);

  constructor(private readonly videosService: VideosService) { }

  // ─── Scoped under /courses/:courseId ───────────────────────────────────────

  /** POST /courses/:courseId/videos */
  @Post('courses/:courseId/videos')
  create(
    @Param('courseId') courseId: string,
    @Body() dto: CreateVideoDto,
  ) {
    this.logger.log(`create video in course ${courseId}`);
    return this.videosService.createVideo(courseId, dto);
  }

  /** GET /courses/:courseId/videos */
  @Get('courses/:courseId/videos')
  findByCourse(@Param('courseId') courseId: string) {
    this.logger.log(`list videos for course ${courseId}`);
    return this.videosService.getCourseVideos(courseId);
  }

  // ─── Standalone /videos/:id ────────────────────────────────────────────────

  /** PATCH /videos/:id */
  @Patch('videos/:id')
  update(@Param('id') id: string, @Body() dto: UpdateVideoDto) {
    this.logger.log(`update video ${id}`);
    return this.videosService.updateVideo(id, dto);
  }

  /** DELETE /videos/:id  (soft delete, 204 No Content) */
  @Delete('videos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    this.logger.log(`soft-delete video ${id}`);
    return this.videosService.deleteVideo(id);
  }
}

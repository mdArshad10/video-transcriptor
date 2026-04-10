import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { UpdateProgressDto } from './dto';

@Controller()
export class ProgressController {
  private readonly logger = new Logger(ProgressController.name);

  constructor(private readonly progressService: ProgressService) { }

  // ─── Scoped under /videos/:videoId ────────────────────────────────────────

  /**
   * POST /videos/:videoId/progress
   * Upserts the authenticated user's playback position / completion flag
   * for the given video.
   */
  @Post('videos/:videoId/progress')
  upsertProgress(
    @Param('videoId') videoId: string,
    @Body() dto: UpdateProgressDto,
  ) {
    this.logger.log(`upsert progress for video ${videoId}`);
    return this.progressService.upsertProgress(videoId, dto);
  }

  // ─── /progress/* ───────────────────────────────────────────────────────────

  /**
   * GET /progress/my
   * GET /progress/my?courseId=<id>  — scoped to a single course
   * Returns all video-progress records for the authenticated user.
   */
  @Get('progress/my')
  findMy(@Query('courseId') courseId?: string) {
    this.logger.log(`findMy progress${courseId ? ` (course ${courseId})` : ''}`);
    return this.progressService.getMyProgress(courseId);
  }
}

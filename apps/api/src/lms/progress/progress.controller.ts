import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { UpdateProgressDto } from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AuthUser } from '../../auth/interfaces/auth-user.interface';

@Controller()
@UseGuards(JwtAuthGuard)
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
    @CurrentUser() user: AuthUser,
  ) {
    this.logger.log(`upsert progress for video ${videoId}`);
    return this.progressService.upsertProgress(videoId, dto, user);
  }

  // ─── /progress/* ───────────────────────────────────────────────────────────

  /**
   * GET /progress/my
   * GET /progress/my?courseId=<id>  — scoped to a single course
   * Returns all video-progress records for the authenticated user.
   */
  @Get('progress/my')
  findMy(
    @Query('courseId') courseId: string | undefined,
    @CurrentUser() user: AuthUser,
  ) {
    this.logger.log(`findMy progress${courseId ? ` (course ${courseId})` : ''}`);
    return this.progressService.getMyProgress(user, courseId);
  }
}

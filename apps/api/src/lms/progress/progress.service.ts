import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Video, VideoDocument, VideoProgress, VideoProgressDocument } from '@app/database';
import { UpdateProgressDto } from './dto';

@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name);

  constructor(
    @InjectModel(VideoProgress.name)
    private readonly progressModel: Model<VideoProgressDocument>,

    @InjectModel(Video.name)
    private readonly videoModel: Model<VideoDocument>,
  ) {}

  // ─── Upsert ───────────────────────────────────────────────────────────────────

  /**
   * Upsert the current user's progress for a given video.
   *
   * - If a record for (video_id, user_id) already exists it is updated.
   * - If the caller sets `completed = true`, `completed_at` is stamped with
   *   the current time (and is left unchanged when toggling back to false).
   * - The video document is fetched first so we can denormalise `course_id`
   *   into the progress record (needed for the course-level compound index).
   *
   * TODO: replace hardcoded userId 'system' with req.user._id once auth is wired.
   */
  async upsertProgress(videoId: string, dto: UpdateProgressDto) {
    this.logger.log(`Upserting progress for video ${videoId}`);

    // Fetch the video to get its course_id (needed for indexing)
    const video = await this.videoModel
      .findById(videoId)
      .select('course_id')
      .lean();

    if (!video) {
      throw new NotFoundException(`Video with id "${videoId}" not found`);
    }

    // TODO: swap placeholder with req.user._id from auth guard
    const userId = new Types.ObjectId('000000000000000000000000');

    const patch: Record<string, unknown> = {
      course_id: video.course_id,
    };

    if (dto.lastPositionSeconds !== undefined) {
      patch.last_position_seconds = dto.lastPositionSeconds;
    }

    if (dto.completed !== undefined) {
      patch.completed = dto.completed;
      // Stamp completed_at only when marking as completed; clear it on revert
      patch.completed_at = dto.completed ? new Date() : null;
    }

    const progress = await this.progressModel
      .findOneAndUpdate(
        {
          video_id: new Types.ObjectId(videoId),
          user_id: userId,
        },
        { $set: patch },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .lean();

    return { message: 'progress saved', data: progress };
  }

  // ─── Read ─────────────────────────────────────────────────────────────────────

  /**
   * Return all progress records for the authenticated user.
   * Optionally supply `courseId` to scope the result to a single course
   * (hits the compound index `course_id + user_id`).
   *
   * TODO: swap placeholder with req.user._id from auth guard.
   */
  async getMyProgress(courseId?: string) {
    this.logger.log(
      courseId
        ? `Fetching progress for current user in course ${courseId}`
        : 'Fetching all progress for current user',
    );

    // TODO: swap placeholder with req.user._id from auth guard
    const userId = new Types.ObjectId('000000000000000000000000');

    const filter: Record<string, unknown> = { user_id: userId };

    if (courseId) {
      filter.course_id = new Types.ObjectId(courseId);
    }

    const data = await this.progressModel
      .find(filter)
      .sort({ updated_at: -1 })
      .lean();

    return { data, total: data.length };
  }
}

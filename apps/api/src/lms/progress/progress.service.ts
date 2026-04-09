import { Injectable } from '@nestjs/common';
import { UpdateProgressDto } from './dto';

@Injectable()
export class ProgressService {
  /**
   * Upsert the current user's progress for a video.
   * Uses unique(video_id, user_id) — updates if exists, inserts otherwise.
   */
  upsertProgress(videoId: string, dto: UpdateProgressDto) {
    // TODO: VideoProgress.findOneAndUpdate(
    //   { video_id: videoId, user_id: currentUserId },
    //   { ...dto, ...(dto.completed ? { completed_at: new Date() } : {}) },
    //   { upsert: true, new: true }
    // )
    return { message: 'progress saved', videoId, data: dto };
  }

  /**
   * Return all progress records for the authenticated user,
   * optionally filtered by course via course_id index.
   */
  getMyProgress() {
    // TODO: VideoProgress.find({ user_id: currentUserId })
    return { message: 'my progress', data: [] };
  }
}

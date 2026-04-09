import { Injectable } from '@nestjs/common';
import { CreateVideoDto, UpdateVideoDto } from './dto';

@Injectable()
export class VideosService {
  /** Add a new video to a course */
  createVideo(courseId: string, dto: CreateVideoDto) {
    // TODO: persist to DB, enforce unique(course_id, video_order)
    return { message: 'video created', courseId, data: dto };
  }

  /** Return all (non-deleted) videos for a course, ordered by video_order */
  getCourseVideos(courseId: string) {
    // TODO: query DB — Videos.find({ course_id, deleted_at: null }).sort('video_order')
    return { message: 'course videos', courseId, data: [] };
  }

  /** Partially update a video */
  updateVideo(id: string, dto: UpdateVideoDto) {
    // TODO: findByIdAndUpdate with soft-delete guard
    return { message: 'video updated', id, data: dto };
  }

  /** Soft-delete a video by setting deleted_at */
  deleteVideo(id: string) {
    // TODO: set deleted_at = new Date()
    return { message: 'video deleted', id };
  }
}

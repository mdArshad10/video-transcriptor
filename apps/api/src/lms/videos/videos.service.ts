import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Video, VideoDocument } from '@app/database';
import { CreateVideoDto, UpdateVideoDto } from './dto';
import { StorageService } from '../storage/storage.service';
import { randomUUID } from 'crypto';

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  constructor(
    @InjectModel(Video.name)
    private readonly videoModel: Model<VideoDocument>,
    private readonly storageService: StorageService,
  ) { }

  // ─── Create ──────────────────────────────────────────────────────────────────

  /**
   * Add a new video to a course.
   * The schema enforces a compound unique index on (course_id, video_order),
   * so duplicate positions within the same course are rejected.
   */
  async createVideo(courseId: string, dto: CreateVideoDto) {
    this.logger.log(`Creating video "${dto.title}" in course ${courseId}`);

    const videoId = randomUUID();

    const storage_key = `courses/${courseId}/videos/${videoId}/${dto.title.replace(/\s/g, '_')}.mp4`;

    try {
      const video = await this.videoModel.create({
        course_id: new Types.ObjectId(courseId),
        title: dto.title,
        description: dto.description ?? null,
        storage_key,
        duration_seconds: dto.durationSeconds ?? null,
        thumbnail_url: dto.thumbnailUrl ?? null,
        video_order: dto.videoOrder,
        is_published: dto.isPublished ?? false,
        // TODO: replace with req.user._id from auth guard
        created_by: null,
        updated_by: null,
      });

      const url = await this.storageService.createPreSignedUrl(storage_key);

      return { message: 'video created', data: video, url };
    } catch (err: any) {
      // MongoDB duplicate key — (course_id, video_order) already taken
      if (err?.code === 11000) {
        throw new ConflictException(
          `Course "${courseId}" already has a video at position ${dto.videoOrder}`,
        );
      }
      throw err;
    }
  }

  // ─── Read ─────────────────────────────────────────────────────────────────────

  /**
   * Return all non-deleted videos for a course, ordered by video_order ASC.
   * The schema pre-hook automatically filters deleted_at = null.
   */
  async getCourseVideos(courseId: string) {
    this.logger.log(`Listing videos for course ${courseId}`);

    const data = await this.videoModel
      .find({ course_id: new Types.ObjectId(courseId) })
      .sort({ video_order: 1 })
      .lean();

    return { data, total: data.length };
  }

  // ─── Update ───────────────────────────────────────────────────────────────────

  /**
   * Partially update a video.
   * The pre-find hook on the schema ensures soft-deleted videos are invisible,
   * so findByIdAndUpdate will return null for deleted records.
   */
  async updateVideo(id: string, dto: UpdateVideoDto) {
    this.logger.log(`Updating video ${id}`);

    const update: Partial<Video> = {};
    if (dto.title !== undefined) update.title = dto.title;
    if (dto.description !== undefined) update.description = dto.description ?? null;
    if (dto.durationSeconds !== undefined) update.duration_seconds = dto.durationSeconds ?? null;
    if (dto.thumbnailUrl !== undefined) update.thumbnail_url = dto.thumbnailUrl ?? null;
    if (dto.videoOrder !== undefined) update.video_order = dto.videoOrder;
    if (dto.isPublished !== undefined) update.is_published = dto.isPublished;
    if (dto.status !== undefined) update.status = dto.status;

    try {
      const video = await this.videoModel
        .findByIdAndUpdate(
          id,
          { $set: update },
          { new: true, runValidators: true },
        )
        .lean();

      if (!video) {
        throw new NotFoundException(`Video with id "${id}" not found`);
      }

      return { message: 'video updated', data: video };
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err;
      // Duplicate video_order within the same course
      if (err?.code === 11000) {
        throw new ConflictException(
          `Another video in this course already occupies position ${dto.videoOrder}`,
        );
      }
      throw err;
    }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────────

  /**
   * Soft-delete a video by setting deleted_at to the current timestamp.
   * Uses findByIdAndUpdate directly (bypasses the pre-find soft-delete hook)
   * so we can target the document even if it's already soft-deleted — in which
   * case we still return 404 since it was never visible to the caller.
   */
  async deleteVideo(id: string) {
    this.logger.log(`Soft-deleting video ${id}`);

    const video = await this.videoModel
      .findByIdAndUpdate(
        id,
        { $set: { deleted_at: new Date() } },
        { new: true },
      )
      .lean();

    if (!video) {
      throw new NotFoundException(`Video with id "${id}" not found`);
    }

    return { message: 'video deleted', id };
  }
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VideoProgressDocument = HydratedDocument<VideoProgress>;

@Schema({
  collection: 'video_progress',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class VideoProgress {
  @Prop({ type: Types.ObjectId, ref: 'Video', required: true })
  video_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  /** The playback position (in seconds) where the user last stopped */
  @Prop({ type: Number, default: 0 })
  last_position_seconds: number;

  @Prop({ type: Boolean, default: false })
  completed: boolean;

  @Prop({ type: Date, default: null })
  completed_at: Date | null;
}

export const VideoProgressSchema = SchemaFactory.createForClass(VideoProgress);

// Unique: one progress record per (video, user) pair
VideoProgressSchema.index({ video_id: 1, user_id: 1 }, { unique: true });

// Compound index for fetching all progress in a course for a given user
VideoProgressSchema.index({ course_id: 1, user_id: 1 });

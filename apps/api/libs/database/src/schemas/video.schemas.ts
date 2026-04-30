import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VideoDocument = HydratedDocument<Video>;

@Schema({
  collection: 'videos',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Video {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  course_id: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Prop({ type: String, default: null })
  description: string | null;

  @Prop({
    type: String,
    enum: ['UPLOADING', 'READY', 'UPLOADED', 'FAILED'],
    default: 'UPLOADING',
  })
  status: 'UPLOADING' | 'UPLOADED' | 'READY' | 'FAILED';

  /** S3 / GCS / R2 object key */
  @Prop({ type: String, required: true })
  raw_storage_key: string;

  @Prop({ type: String, default: null })
  hls_Master_Url: string

  @Prop({ type: Number, default: null })
  duration_seconds: number | null;

  @Prop({ type: String, default: null })
  thumbnail_url: string | null;

  /** Position of this video within the course playlist (1-based) */
  @Prop({ type: Number, required: true })
  video_order: number;

  @Prop({ type: Boolean, default: false })
  is_published: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  created_by: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updated_by: Types.ObjectId | null;

  /** Soft-delete timestamp */
  @Prop({ type: Date, default: null })
  deleted_at: Date | null;
}

export const VideoSchema = SchemaFactory.createForClass(Video);

// Compound unique: a course cannot have two videos at the same position
// VideoSchema.index({ course_id: 1, video_order: 1 }, { unique: true });

// Soft-delete: exclude deleted documents from default queries
VideoSchema.pre(/^find/, function (this: any) {
  this.where({ deleted_at: null });
});

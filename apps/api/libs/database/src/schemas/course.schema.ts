import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CourseDocument = HydratedDocument<Course>;

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Schema({
  collection: 'courses',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Course {
  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({
    type: String,
    enum: Object.values(CourseStatus),
    default: CourseStatus.DRAFT,
    required: true,
  })
  status: CourseStatus;

  @Prop({ type: String, default: null })
  thumbnail_url: string | null;

  /** Business owner / organisation that owns the course */
  @Prop({ type: String, required: true })
  owner_id: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  created_by: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  updated_by: Types.ObjectId;

  /** Soft-delete timestamp */
  @Prop({ type: Date, default: null })
  deleted_at: Date | null;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

// Soft-delete: exclude deleted documents from default queries
CourseSchema.pre(/^find/, function (this: any) {
  this.where({ deleted_at: null });
});

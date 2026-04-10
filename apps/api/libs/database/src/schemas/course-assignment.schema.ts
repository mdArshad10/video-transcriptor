import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CourseAssignmentDocument = HydratedDocument<CourseAssignment>;

export enum AssignmentTargetType {
  USER = 'user',
  GROUP = 'group',
  ORGANISATION = 'organisation',
}

@Schema({
  collection: 'course_assignments',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class CourseAssignment {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  course_id: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(AssignmentTargetType),
    required: true,
  })
  target_type: AssignmentTargetType;

  /** ObjectId of the user / group / organisation being assigned */
  @Prop({ type: String, required: true, index: true })
  target_id: string;

  /** Who created this assignment */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  assigned_by: Types.ObjectId | null;
}

export const CourseAssignmentSchema =
  SchemaFactory.createForClass(CourseAssignment);

// Compound unique index: one record per (course, target_type, target_id)
CourseAssignmentSchema.index(
  { course_id: 1, target_type: 1, target_id: 1 },
  { unique: true },
);

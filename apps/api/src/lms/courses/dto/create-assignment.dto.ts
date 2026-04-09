import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';

/**
 * The entity type a course can be assigned/linked to.
 * Extend this enum as more target types are needed.
 */
export enum AssignmentTargetType {
  USER = 'user',
  GROUP = 'group',
  ORGANISATION = 'organisation',
}

export class CreateAssignmentDto {
  @IsEnum(AssignmentTargetType, {
    message: `targetType must be one of: ${Object.values(AssignmentTargetType).join(', ')}`,
  })
  targetType: AssignmentTargetType;

  /** MongoDB ObjectId of the user / group / organisation being assigned */
  @IsMongoId()
  @IsNotEmpty()
  targetId: string;
}

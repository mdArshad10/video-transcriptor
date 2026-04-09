import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { CourseStatus } from '@app/database';

export class ListCoursesQueryDto {
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  ownedByMe?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  assignedToMe?: boolean;

  @IsEnum(CourseStatus, {
    message: `status must be one of: ${Object.values(CourseStatus).join(', ')}`,
  })
  @IsOptional()
  status?: CourseStatus;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 20;

  /** Field to sort by, e.g. `created_at` or `-created_at` (prefix `-` = DESC) */
  @IsString()
  @IsOptional()
  sort?: string = '-created_at';
}

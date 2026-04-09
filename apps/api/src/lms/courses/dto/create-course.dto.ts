import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { CourseStatus } from '@app/database';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(CourseStatus, {
    message: `status must be one of: ${Object.values(CourseStatus).join(', ')}`,
  })
  @IsOptional()
  status?: CourseStatus = CourseStatus.DRAFT;

  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;
}

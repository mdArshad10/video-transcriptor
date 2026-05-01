import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateVideoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;


  @IsInt()
  @Min(0)
  @IsOptional()
  durationSeconds?: number;

  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  /** 1-based position within the course playlist */
  @IsInt()
  @Min(1, { message: 'videoOrder must be at least 1' })
  videoOrder: number;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean = false;

  @IsInt()
  @IsOptional()
  fileSize?: number;

  @IsString()
  @IsOptional()
  originalFilename?: string;

  @IsString()
  @IsOptional()
  fileOriginalType?: string;
}

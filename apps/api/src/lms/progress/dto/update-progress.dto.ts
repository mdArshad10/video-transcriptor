import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateProgressDto {
  @IsInt()
  @Min(0, { message: 'lastPositionSeconds must be 0 or greater' })
  @IsOptional()
  lastPositionSeconds?: number;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}

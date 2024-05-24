import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { MusicStatus } from '../music-status.enum';
import { Type } from 'class-transformer';
export class GetMusicFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  skip?: number;

  @IsOptional()
  @IsEnum(MusicStatus)
  status?: MusicStatus;
}

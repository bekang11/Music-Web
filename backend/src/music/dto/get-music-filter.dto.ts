import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MusicStatus } from '../music-status.enum';
export class GetMusicFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(MusicStatus)
  status?: MusicStatus;
}

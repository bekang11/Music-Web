import { IsEnum } from 'class-validator';
import { MusicStatus } from '../music-status.enum';

export class UpdateMusicArtistDto {
  artist?: string;

  @IsEnum(MusicStatus)
  status: MusicStatus;
}

import { IsEnum } from 'class-validator';
import { MusicStatus } from '../music-status.enum';

export class UpdateMusicTitleDto {
  title?: string;

  @IsEnum(MusicStatus)
  status: MusicStatus;
}

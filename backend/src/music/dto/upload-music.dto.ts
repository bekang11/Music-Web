import { IsNotEmpty, IsString } from 'class-validator';

export class UploadMusicDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  artist: string;
}

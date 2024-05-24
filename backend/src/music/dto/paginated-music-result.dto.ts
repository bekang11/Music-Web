import { Music } from 'src/entities/music.entity';

export class PaginatedMusicResultDto {
  tracks: Music[];
  total: number;
}

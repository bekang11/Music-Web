import { Music } from 'src/entities/music.entity';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { CreateMusicDto } from './dto/create-music.dto';
import { GetMusicFilterDto } from './dto/get-music-filter.dto';
import { User } from 'src/entities/user.entity';
import { MusicStatus } from './music-status.enum';

@Injectable()
export class MusicRepository extends Repository<Music> {
  constructor(private dataSource: DataSource) {
    super(Music, dataSource.createEntityManager());
  }
  private logger = new Logger('MusicRepository', { timestamp: true });

  async getMusic(filterDto: GetMusicFilterDto, user: User): Promise<Music[]> {
    const { status, search } = filterDto;

    const query = this.createQueryBuilder('music');
    query.where({ user });

    if (status) {
      query.andWhere('music.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(LOWER(music.title) LIKE LOWER(:search) OR LOWER(music.artist) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }
    try {
      const musics = await query.getMany();
      return musics;
    } catch (error) {
      this.logger.error(
        `Failed to get musics for user "${
          user.username
        }". Filters: ${JSON.stringify(filterDto)}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
  async createMusic(
    createMusicDto: CreateMusicDto,
    user: User,
  ): Promise<Music> {
    const { title, artist } = createMusicDto;

    const music = this.create({
      title,
      status: MusicStatus.PLAYING,
      artist,
      user,
    });

    await this.save(music);
    return music;
  }
}

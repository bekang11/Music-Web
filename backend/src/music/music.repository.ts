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
import { PaginatedMusicResultDto } from './dto/paginated-music-result.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MusicRepository extends Repository<Music> {
  constructor(
    @InjectRepository(Music)
    private readonly musicRepository: Repository<Music>,
    private dataSource: DataSource,
  ) {
    super(Music, dataSource.createEntityManager());
  }
  private logger = new Logger('MusicRepository', { timestamp: true });

  async getMusic(
    filterDto: GetMusicFilterDto,
    user: User,
  ): Promise<PaginatedMusicResultDto> {
    const { search, page = 1 } = filterDto;
    const query = this.createQueryBuilder('music');

    query.where('music.userId = :userId', { userId: user.id });

    if (search) {
      query.andWhere(
        '(music.title LIKE :search OR music.artist LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const pageNumber = Number(page);
    const pageLimit = 5;

    if (isNaN(pageNumber)) {
      throw new InternalServerErrorException('Invalid pagination parameters');
    }

    try {
      const [tracks, total] = await query
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();

      return { tracks, total };
    } catch (error) {
      this.logger.error(
        `Failed to get musics for user "${user.username}". Filters: ${JSON.stringify(filterDto)}`,
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

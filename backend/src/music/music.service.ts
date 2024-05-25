import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MusicRepository } from './music.repository';
import { Music } from 'src/entities/music.entity';
import { CreateMusicDto } from './dto/create-music.dto';
import { GetMusicFilterDto } from './dto/get-music-filter.dto';
import { User } from 'src/entities/user.entity';
import { PaginatedMusicResultDto } from './dto/paginated-music-result.dto';

@Injectable()
export class MusicService {
  constructor(
    @InjectRepository(MusicRepository)
    private musicRepository: MusicRepository,
  ) {}

  async uploadMusic(
    file: Express.Multer.File,
    user: User,
    musicId: string,
  ): Promise<any> {
    try {
      return this.musicRepository.associateFileWithMusicTrack(
        file,
        user,
        musicId,
      );
    } catch (error) {
      console.error('Failed to upload music:', error);
      throw new InternalServerErrorException('Failed to upload music');
    }
  }

  async getMusicById(id: string, user: User): Promise<Music> {
    const found = await this.musicRepository.findOne({ where: { id, user } });

    if (!found) {
      throw new NotFoundException(`Music with ID "${id}" not found`);
    }
    return found;
  }
  createMusic(createMusicDto: CreateMusicDto, user: User): Promise<Music> {
    return this.musicRepository.createMusic(createMusicDto, user);
  }
  async deleteMusicById(id: string, user: User): Promise<void> {
    const result = await this.musicRepository.delete({ id, user });

    if (result.affected === 0) {
      throw new NotFoundException(`Music with ID "${id}" not found`);
    }
  }
  async getMusic(
    filterDto: GetMusicFilterDto,
    user: User,
  ): Promise<PaginatedMusicResultDto> {
    const filter = {
      page: 1,
      skip: 0,
      limit: 10,
      search: '',
      ...filterDto,
    };

    return this.musicRepository.getMusic(filter, user);
  }
  async updateMusicTitle(
    id: string,
    title: string,
    user: User,
  ): Promise<Music> {
    const music = await this.getMusicById(id, user);

    music.title = title;
    await this.musicRepository.save(music);

    return music;
  }
  async updateMusicArtist(
    id: string,
    artist: string,
    user: User,
  ): Promise<Music> {
    const music = await this.getMusicById(id, user);

    music.artist = artist;
    await this.musicRepository.save(music);

    return music;
  }
}

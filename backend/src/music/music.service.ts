import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MusicRepository } from './music.repository';
import { Music } from 'src/entities/music.entity';
import { CreateMusicDto } from './dto/create-music.dto';
import { GetMusicFilterDto } from './dto/get-music-filter.dto';
import { User } from 'src/entities/user.entity';
import { MusicStatus } from './music-status.enum';

@Injectable()
export class MusicService {
  constructor(
    @InjectRepository(MusicRepository)
    private musicRepository: MusicRepository,
  ) {}
  async getMusicById(id: string): Promise<Music> {
    const found = await this.musicRepository.findOneBy({ id });

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
  getMusic(filterDto: GetMusicFilterDto, user: User): Promise<Music[]> {
    return this.musicRepository.getMusic(filterDto, user);
  }
  async updateMusicTitle(
    id: string,
    status: MusicStatus,
    title: string,
    user: User,
  ): Promise<Music> {
    const music = await this.getMusicById(id, user);

    music.title = title;
    music.status = status;
    await this.musicRepository.save(music);

    return music;
  }
  async updateMusicArtist(
    id: string,
    status: MusicStatus,
    artist: string,
    user: User,
  ): Promise<Music> {
    const music = await this.getMusicById(id, user);

    music.artist = artist;
    music.status = status;
    await this.musicRepository.save(music);

    return music;
  }
}

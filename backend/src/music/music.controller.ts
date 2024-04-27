import {
  Controller,
  Get,
  Param,
  Delete,
  Post,
  Body,
  Logger,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { MusicService } from './music.service';
import { Music } from 'src/entities/music.entity';
import { User } from 'src/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { CreateMusicDto } from './dto/create-music.dto';
import { GetUser } from 'src/user/get-user.decorator';
import { GetMusicFilterDto } from './dto/get-music-filter.dto';
import { UpdateMusicArtistsDto } from './dto/update-music-artist.dto';
import { UpdateMusicTitleDto } from './dto/update-music-title.dto';
import { MusicStatus } from './music-status.enum';
@Controller('music')
@UseGuards(AuthGuard())
export class MusicController {
  private logger = new Logger('MusicController');

  constructor(private musicService: MusicService) {}
  @Get()
  getMusic(
    @Query() filterDto: GetMusicFilterDto,
    @GetUser() user: User,
  ): Promise<Music[]> {
    this.logger.verbose(
      `User "${user.username}" retrieving all music. Filters: ${JSON.stringify(filterDto)}`,
    );
    return this.musicService.getMusic(filterDto, user);
  }

  @Get('/:id')
  getMusiccById(@Param('id') id: string): Promise<Music> {
    return this.musicService.getMusicById(id);
  }

  @Delete('/:id')
  deleteMusicById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.musicService.deleteMusicById(id, user);
  }

  @Post()
  createMusic(
    @Body() createMusicDto: CreateMusicDto,
    @GetUser() user: User,
  ): Promise<Music> {
    this.logger.verbose(
      `User "${user.username}" creating a new music. Data:v${JSON.stringify(createMusicDto)}`,
    );
    return this.musicService.createMusic(createMusicDto, user);
  }
  @Patch('/:id/title')
  updateMusicTitle(
    @Param('id') id: string,
    @Body() updateMusicTitleDto: UpdateMusicTitleDto,
    @GetUser() user: User,
  ): Promise<Music> {
    const { title } = updateMusicTitleDto;
    return this.musicService.updateMusicTitle(
      id,
      title,
      user,
      MusicStatus.OPEN,
    );
  }
  @Patch('/:id/artist')
  updateMusicArtist(
    @Param('id') id: string,
    @Body() updateMusicArtistDto: UpdateMusicArtistsDto,
    @GetUser() user: User,
  ): Promise<Music> {
    const { artist } = updateMusicArtistDto;
    return this.musicService.updateMusicArtist(
      id,
      artist,
      user,
      MusicStatus.OPEN,
    );
  }
}

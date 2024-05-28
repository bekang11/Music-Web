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
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { MusicService } from './music.service';
import { Music } from 'src/entities/music.entity';
import { User } from 'src/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { CreateMusicDto } from './dto/create-music.dto';
import { GetUser } from 'src/user/get-user.decorator';
import { GetMusicFilterDto } from './dto/get-music-filter.dto';
import { UpdateMusicArtistDto } from './dto/update-music-artist.dto';
import { UpdateMusicTitleDto } from './dto/update-music-title.dto';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadMusicDto } from './dto/upload-music.dto';

@Controller('music')
@UseGuards(AuthGuard('jwt'))
export class MusicController {
  private logger = new Logger('MusicController');

  constructor(private musicService: MusicService) {}
  @Get()
  getMusic(@Query() filterDto: GetMusicFilterDto, @Req() req: Request) {
    const user = req.user as User;
    return this.musicService.getMusic(filterDto, user);
  }

  @Get('/:id')
  getMusicById(@Param('id') id: string, @GetUser() user: User): Promise<Music> {
    return this.musicService.getMusicById(id, user);
  }

  @Delete('/:id')
  deleteMusicById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.musicService.deleteMusicById(id, user);
  }

  @Get('/:id/file')
  async getMusicFile(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const music = await this.musicService.findMusicById(id);

    if (!music || !music.file) {
      throw new NotFoundException(`Music file with ID "${id}" not found`);
    }

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': music.file.length,
    });

    res.send(music.file);
  }

  @Post('/:id/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMusic(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') musicId: string,
    @Body() uploadMusicDto: UploadMusicDto,
  ): Promise<Music> {
    const { title, artist } = uploadMusicDto;
    if (!file || !title || !artist || !musicId) {
      throw new BadRequestException('Missing required parameters');
    }

    try {
      const musicTrack = await this.musicService.associateFileWithMusicTrack(
        file.buffer, // Pass the file buffer
        musicId,
        title,
        artist,
      );
      return musicTrack;
    } catch (error) {
      console.error('Error uploading music:', error);
      throw new InternalServerErrorException('Failed to upload music');
    }
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
    return this.musicService.updateMusicTitle(id, title, user);
  }

  @Patch('/:id/artist')
  updateMusicArtist(
    @Param('id') id: string,
    @Body() updateMusicArtistDto: UpdateMusicArtistDto,
    @GetUser() user: User,
  ): Promise<Music> {
    const { artist } = updateMusicArtistDto;
    return this.musicService.updateMusicArtist(id, artist, user);
  }
}

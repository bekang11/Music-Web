import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MusicController } from './music.controller';
import { MusicService } from './music.service';
import { Music } from '../entities/music.entity';
import { AuthModule } from 'src/auth/auth.module';
import { MusicRepository } from './music.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Music]), AuthModule],
  controllers: [MusicController],
  providers: [MusicService, MusicRepository],
})
export class MusicModule {}

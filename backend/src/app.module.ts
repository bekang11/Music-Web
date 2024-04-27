import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MusicModule } from './music/music.module';
import { Music } from './entities/music.entity';

@Module({
  imports: [
    MusicModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: '12345',
      database: 'Music',
      entities: [Music],
      autoLoadEntities: true,
      synchronize: true,
    }),
    MusicModule,
  ],
})
export class AppModule {}

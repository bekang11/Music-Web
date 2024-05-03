import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MusicModule } from './music/music.module';
import { Music } from './entities/music.entity';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './http-exception.filter';
import * as cors from 'cors';

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
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cors({
          origin: 'http://127.0.0.1:8080',
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
          allowedHeaders: ['Content-Type', 'Authorization'],
        }),
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

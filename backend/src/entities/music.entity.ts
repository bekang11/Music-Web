import { MusicStatus } from 'src/music/music-status.enum';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from './user.entity';

@Entity()
export class Music {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  artist: string;

  @Column()
  status: MusicStatus;

  @Column({ type: 'bytea', nullable: true })
  file: Buffer;

  @ManyToOne(() => User, (user) => user.musics, { eager: false })
  @Exclude({ toPlainOnly: true })
  user: User;
}

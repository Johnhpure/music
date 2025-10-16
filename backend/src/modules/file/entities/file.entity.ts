import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@modules/user/entities/user.entity';

export enum FileType {
  AUDIO = 'audio',
  IMAGE = 'image',
  VIDEO = 'video',
  OTHER = 'other',
}

export enum StorageType {
  LOCAL = 'local',
  MINIO = 'minio',
}

@Entity('t_files')
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user_id?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column()
  original_name: string;

  @Column()
  file_name: string;

  @Column()
  file_path: string;

  @Column()
  file_url: string;

  @Column({ type: 'enum', enum: FileType })
  file_type: FileType;

  @Column({ type: 'bigint' })
  file_size: number;

  @Column()
  mime_type: string;

  @Column({ type: 'enum', enum: StorageType, default: StorageType.LOCAL })
  storage_type: StorageType;

  @CreateDateColumn()
  created_at: Date;
}

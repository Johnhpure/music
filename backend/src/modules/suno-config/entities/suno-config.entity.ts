import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('suno_configs')
export class SunoConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  api_key: string;

  @Column({ length: 255, default: 'https://api.sunoapi.org' })
  api_url: string;

  @Column({ type: 'boolean', default: false })
  is_active: boolean;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MusicController } from './music.controller';
import { PublicMusicController } from './public-music.controller';
import { SunoController } from './suno.controller';
import { SunoAdminController } from './suno-admin.controller';
import { SunoMiniprogramController } from './suno-miniprogram.controller';
import { MusicService } from './music.service';
import { SunoService } from './suno.service';
import { SunoAdminService } from './suno-admin.service';
import { SunoMiniprogramService } from './suno-miniprogram.service';
import { MusicTaskProcessor } from './processors/music-task.processor';
import { MusicTask } from './entities/music-task.entity';
import { UserMusicLike } from './entities/user-music-like.entity';
import { User } from '../user/entities/user.entity';
import { SunoApiLog } from './entities/suno-api-log.entity';
import { SunoLyricsTask } from './entities/suno-lyrics-task.entity';
import { SunoExtendTask } from './entities/suno-extend-task.entity';
import { SunoVocalSeparationTask } from './entities/suno-vocal-separation-task.entity';
import { SunoWavConversionTask } from './entities/suno-wav-conversion-task.entity';
import { SunoMusicVideoTask } from './entities/suno-music-video-task.entity';
import { SunoCoverTask } from './entities/suno-cover-task.entity';
import { SunoAddVocalsTask } from './entities/suno-add-vocals-task.entity';
import { SunoAddInstrumentalTask } from './entities/suno-add-instrumental-task.entity';
import { SunoUploadExtendTask } from './entities/suno-upload-extend-task.entity';
import { SunoCoverSunoTask } from './entities/suno-cover-suno-task.entity';
import { SunoCreditUsageLog } from './entities/suno-credit-usage-log.entity';
import { SunoApiDailyStats } from './entities/suno-api-daily-stats.entity';
import { SunoUserStats } from './entities/suno-user-stats.entity';
import { SunoTimestampedLyrics } from './entities/suno-timestamped-lyrics.entity';
import { CreditModule } from '@modules/credit/credit.module';
import { FileModule } from '@modules/file/file.module';
import { SunoConfigModule } from '@modules/suno-config/suno-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MusicTask,
      UserMusicLike,
      User,
      SunoApiLog,
      SunoLyricsTask,
      SunoExtendTask,
      SunoVocalSeparationTask,
      SunoWavConversionTask,
      SunoMusicVideoTask,
      SunoCoverTask,
      SunoAddVocalsTask,
      SunoAddInstrumentalTask,
      SunoUploadExtendTask,
      SunoCoverSunoTask,
      SunoCreditUsageLog,
      SunoApiDailyStats,
      SunoUserStats,
      SunoTimestampedLyrics,
    ]),
    BullModule.registerQueue({
      name: 'music',
    }),
    CreditModule,
    FileModule,
    SunoConfigModule,
  ],
  controllers: [
    MusicController,
    PublicMusicController,
    SunoController,
    SunoAdminController,
    SunoMiniprogramController,
  ],
  providers: [
    MusicService,
    SunoService,
    SunoAdminService,
    SunoMiniprogramService,
    MusicTaskProcessor,
  ],
  exports: [
    MusicService,
    SunoService,
    SunoAdminService,
    SunoMiniprogramService,
  ],
})
export class MusicModule {}

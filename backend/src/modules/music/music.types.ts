export enum MusicModel {
  V3_5 = 'V3_5',
  V4 = 'V4',
  V4_5 = 'V4_5',
  V4_5PLUS = 'V4_5PLUS',
  V5 = 'V5',
}

export enum TaskStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum SunoTaskType {
  GENERATE = 'generate',
  EXTEND = 'extend',
  LYRICS = 'lyrics',
  VOCAL_SEPARATION = 'vocal_separation',
  WAV_CONVERSION = 'wav_conversion',
  MUSIC_VIDEO = 'music_video',
  COVER = 'cover',
  ADD_VOCALS = 'add_vocals',
  ADD_INSTRUMENTAL = 'add_instrumental',
}

export interface GenerateMusicParams {
  prompt?: string;
  customMode: boolean;
  instrumental?: boolean;
  model: MusicModel;
  style?: string;
  title?: string;
  lyrics?: string;
  negativeTags?: string;
  vocalGender?: 'm' | 'f';
  styleWeight?: number;
  weirdnessConstraint?: number;
  audioWeight?: number;
  callBackUrl?: string;
}

export interface ExtendMusicParams {
  audioId: string;
  defaultParamFlag?: boolean;
  prompt?: string;
  continueAt?: number;
  model: MusicModel;
  callBackUrl?: string;
}

export interface GenerateLyricsParams {
  prompt: string;
  callBackUrl?: string;
}

export interface SeparateVocalsParams {
  taskId: string;
  audioId: string;
  callBackUrl?: string;
}

export interface ConvertToWavParams {
  taskId: string;
  audioId: string;
  callBackUrl?: string;
}

export interface CreateMusicVideoParams {
  taskId: string;
  audioId: string;
  author?: string;
  domainName?: string;
  callBackUrl?: string;
}

export interface UploadAndCoverParams {
  uploadUrl?: string;
  customMode?: boolean;
  prompt?: string;
  style?: string;
  title?: string;
  model: MusicModel;
  callBackUrl?: string;
}

export interface BoostMusicStyleParams {
  content: string;
}

export interface BoostMusicStyleResult {
  taskId: string;
  param: string;
  result: string;
  creditsConsumed: number;
  creditsRemaining: number;
  successFlag: string;
  errorCode?: number;
  errorMessage?: string;
  createTime: string;
}

export interface AddVocalsParams {
  prompt: string;
  title: string;
  negativeTags: string;
  style: string;
  uploadUrl: string;
  callBackUrl: string;
  vocalGender?: 'm' | 'f';
  styleWeight?: number;
  weirdnessConstraint?: number;
  audioWeight?: number;
  model?: MusicModel;
}

export interface AddInstrumentalParams {
  uploadUrl: string;
  title: string;
  negativeTags: string;
  tags: string;
  callBackUrl: string;
  vocalGender?: 'm' | 'f';
  styleWeight?: number;
  weirdnessConstraint?: number;
  audioWeight?: number;
  model?: MusicModel;
}

export interface UploadAndExtendParams {
  uploadUrl: string;
  defaultParamFlag: boolean;
  model: MusicModel;
  callBackUrl: string;
  instrumental?: boolean;
  prompt?: string;
  style?: string;
  title?: string;
  continueAt?: number;
  negativeTags?: string;
  vocalGender?: 'm' | 'f';
  styleWeight?: number;
  weirdnessConstraint?: number;
  audioWeight?: number;
}

// Cover Suno 相关类型定义
export interface CoverSunoParams {
  taskId: string;
  callBackUrl: string;
}

export interface CoverSunoResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface CoverSunoStatusResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    parentTaskId: string;
    callbackUrl: string;
    completeTime?: string;
    response?: {
      images?: string[];
    };
    successFlag: 0 | 1 | 2 | 3; // 0-待执行，1-成功，2-生成中，3-生成失败
    createTime: string;
    errorCode?: number;
    errorMessage?: string;
  };
}

export interface SunoGenerateRequest {
  prompt?: string;
  customMode: boolean;
  instrumental?: boolean;
  model: string;
  style?: string;
  title?: string;
  lyrics?: string;
  negativeTags?: string;
  vocalGender?: 'm' | 'f';
  styleWeight?: number;
  weirdnessConstraint?: number;
  audioWeight?: number;
  callBackUrl?: string;
}

export interface SunoTaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface SunoGenerateResult {
  id: string;
  audio_url: string;
  source_audio_url?: string;
  stream_audio_url?: string;
  source_stream_audio_url?: string;
  video_url?: string;
  image_url?: string;
  source_image_url?: string;
  title: string;
  tags?: string;
  prompt?: string;
  model_name?: string;
  duration: number;
  createTime?: string;
}

export interface SunoTaskStatusResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    callbackType?: 'text' | 'first' | 'complete' | 'error';
    status: 'PENDING' | 'GENERATING' | 'SUCCESS' | 'FAILED';
    response?: {
      data: SunoGenerateResult[];
    };
    errorMessage?: string;
  };
}

export interface SunoLyricsResult {
  id: string;
  text: string;
  title: string;
}

export interface SunoLyricsResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface SunoLyricsStatusResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    status: 'PENDING' | 'GENERATING' | 'SUCCESS' | 'FAILED';
    data?: SunoLyricsResult[];
    errorMessage?: string;
  };
}

export interface SunoVocalSeparationResult {
  id: string;
  instrumental_url: string;
  vocal_url: string;
}

export interface SunoVocalSeparationResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface SunoWavConversionResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface SunoMusicVideoResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface SunoTimestampedLyricsResponse {
  code: number;
  msg: string;
  data: {
    audioId: string;
    lyrics: Array<{
      timestamp: number;
      text: string;
    }>;
  };
}

export interface SunoCreditsResponse {
  code: number;
  msg: string;
  data: {
    credits: number;
  };
}

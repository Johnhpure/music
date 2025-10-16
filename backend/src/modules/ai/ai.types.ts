export enum MusicStyle {
  POP = 'pop',
  ROCK = 'rock',
  JAZZ = 'jazz',
  CLASSICAL = 'classical',
  ELECTRONIC = 'electronic',
  HIPHOP = 'hiphop',
  COUNTRY = 'country',
  FOLK = 'folk',
  RNB = 'rnb',
  BALLAD = 'ballad',
}

export enum Mood {
  HAPPY = 'happy',
  SAD = 'sad',
  ROMANTIC = 'romantic',
  ENERGETIC = 'energetic',
  CALM = 'calm',
  MELANCHOLIC = 'melancholic',
  INSPIRATIONAL = 'inspirational',
  NOSTALGIC = 'nostalgic',
}

export interface GenerateLyricsParams {
  theme: string;
  style?: MusicStyle;
  mood?: Mood;
  language?: string;
  customPrompt?: string;
}

export interface LyricsResult {
  lyrics: string;
  title?: string;
  structure?: string;
  wordCount?: number;
}

export interface ExpandInspirationParams {
  originalPrompt: string;
}

export interface ExpandInspirationResult {
  expandedContent: string;
  originalPrompt: string;
}

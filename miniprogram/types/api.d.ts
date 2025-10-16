/**
 * API Type Definitions
 *
 * This file contains TypeScript type definitions for all API responses
 * used in the miniprogram application.
 */

/**
 * Generic API Response Type
 * All API responses follow this structure
 */
export interface APIResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * Credit System Types
 */
export interface CreditBalanceData {
  balance: number;
  userId: number;
}

export interface CreditPackageData {
  id: number;
  name: string;
  credits: number;
  price: number;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface CreditLogData {
  id: number;
  userId: number;
  type: 'consume' | 'reward' | 'purchase' | 'refund';
  amount: number;
  balanceAfter: number;
  description?: string;
  relatedId?: number;
  relatedType?: string;
  createdAt: string;
}

/**
 * Banner Types
 */
export interface BannerData {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  linkType?: 'none' | 'internal' | 'external' | 'miniprogram';
  sortOrder: number;
  isActive: boolean;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Prompt Template Types
 */
export interface PromptTemplateData {
  id: number;
  category: string;
  title: string;
  content: string;
  tags: string | string[];
  tagsArray?: string[];
  icon?: string;
  iconBg?: string;
  usageCount: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Hot Recommendation Types
 */
export interface HotRecommendationData {
  id: number;
  category: string;
  title: string;
  coverUrl: string;
  audioUrl: string;
  artist?: string;
  genre?: string;
  duration?: string;
  description?: string;
  playCount: number;
  likeCount: number;
  tags?: string[];
  isHot?: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * User Types
 */
export interface UserData {
  id: number;
  username?: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
  email?: string;
  creditBalance: number;
  token?: string;
  ApiToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileData extends UserData {
  totalWorks?: number;
  totalLikes?: number;
  totalPlays?: number;
}

/**
 * Authentication Types
 */
export interface WechatLoginRequest {
  code: string;
  encryptedData?: string;
  iv?: string;
}

export interface WechatAuthRequest {
  code: string;
  phoneCode?: string;
  encryptedData?: string;
  iv?: string;
}

export interface LoginResponseData {
  token: string;
  user: UserData;
}

/**
 * Music Task Types
 */
export interface MusicTaskData {
  id: number;
  userId: number;
  title?: string;
  prompt: string;
  style?: string;
  lyrics?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audioUrl?: string;
  coverUrl?: string;
  duration?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMusicTaskRequest {
  title?: string;
  prompt: string;
  style?: string;
  lyrics?: string;
  isInstrumental?: boolean;
}

/**
 * AI Lyrics Types
 */
export interface GenerateLyricsRequest {
  theme: string;
  style?: string;
  keywords?: string[];
  length?: 'short' | 'medium' | 'long';
}

export interface LyricsGenerationData {
  id: number;
  userId: number;
  requestId: string;
  theme: string;
  style?: string;
  keywords?: string;
  lyrics: string;
  rating?: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Query DTOs
 */
export interface QueryHotRecommendationDto {
  page?: number;
  pageSize?: number;
  category?: string;
  isHot?: number | boolean;
}

export interface QueryPromptTemplateDto {
  category?: string;
  isActive?: number | boolean;
}

export interface QueryCreditLogsDto {
  page?: number;
  pageSize?: number;
  type?: 'consume' | 'reward' | 'purchase' | 'refund';
  startDate?: string;
  endDate?: string;
}

/**
 * Payment Types
 */
export interface CreateOrderRequest {
  packageId: number;
  paymentMethod: 'wechat' | 'alipay';
}

export interface OrderData {
  id: number;
  orderNo: string;
  userId: number;
  packageId: number;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  paymentMethod: 'wechat' | 'alipay';
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * File Upload Types
 */
export interface UploadFileResponse {
  code: number;
  message: string;
  data: {
    fileId: number;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  };
}

/**
 * Tracking DTOs
 */
export interface TrackPromptTemplateUsageDto {
  templateId: number;
  timestamp: string;
}

export interface TrackMusicPlayDto {
  musicId: number;
  action: 'play' | 'click' | 'like';
  timestamp: string;
}

/**
 * Error Response Types
 */
export interface APIError {
  code: number;
  message: string;
  error?: string;
  stack?: string;
}

/**
 * Pagination Response Types
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

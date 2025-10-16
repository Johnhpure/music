// API specific types

export interface LoginRequest {
  username: string
  password: string
  remember?: boolean
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: {
    id: string
    username: string
    email: string
    role: string
    permissions: string[]
  }
  expiresIn: number
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  token: string
  expiresIn: number
}

// User API types
export interface CreateUserRequest {
  username: string
  email: string
  password: string
  role?: string
  profile?: {
    nickname?: string
    phone?: string
  }
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  role?: string
  status?: string
  profile?: {
    nickname?: string
    phone?: string
    gender?: string
    birthday?: string
    bio?: string
  }
}

export interface UserListQuery {
  page?: number
  pageSize?: number
  search?: string
  role?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  startDate?: string
  endDate?: string
}

// Content API types
export interface CreateBannerRequest {
  title: string
  description: string
  imageUrl: string
  linkUrl?: string
  startDate?: string
  endDate?: string
  sortOrder?: number
}

export interface UpdateBannerRequest extends Partial<CreateBannerRequest> {
  isActive?: boolean
}

export interface CreatePromptRequest {
  title: string
  content: string
  category: string
  tags: string[]
  icon: string
  iconBg?: string
  sortOrder?: number
}

export interface UpdatePromptRequest extends Partial<CreatePromptRequest> {
  isActive?: boolean
}

export interface CreateRecommendationRequest {
  title: string
  artist: string
  genre: string
  duration: string
  coverUrl: string
  audioUrl: string
  tags: string[]
  sortOrder?: number
}

export interface UpdateRecommendationRequest extends Partial<CreateRecommendationRequest> {
  isHot?: boolean
  isActive?: boolean
}

// Analytics API types
export interface AnalyticsQuery {
  startDate: string
  endDate: string
  granularity?: 'hour' | 'day' | 'week' | 'month'
  metrics?: string[]
  dimensions?: string[]
}

export interface AnalyticsResponse {
  dimensions: string[]
  metrics: Array<{
    name: string
    values: number[]
  }>
  timestamps: string[]
  summary: Record<string, number>
}

export interface UserAnalyticsResponse {
  newUsers: number[]
  activeUsers: number[]
  retentionRates: number[]
  userGrowth: number
  activityGrowth: number
  topRegions: Array<{
    region: string
    count: number
    percentage: number
  }>
  ageDistribution: Array<{
    ageGroup: string
    count: number
    percentage: number
  }>
  deviceTypes: Array<{
    device: string
    count: number
    percentage: number
  }>
}

export interface ContentAnalyticsResponse {
  promptUsage: Array<{
    id: string
    title: string
    usageCount: number
    growth: number
  }>
  bannerClicks: Array<{
    id: string
    title: string
    clickCount: number
    ctr: number
  }>
  recommendationPlays: Array<{
    id: string
    title: string
    playCount: number
    growth: number
  }>
  categoryDistribution: Array<{
    category: string
    count: number
    percentage: number
  }>
}

// System API types
export interface SystemStatsResponse {
  users: {
    total: number
    active: number
    new: number
    growth: number
  }
  content: {
    works: number
    prompts: number
    banners: number
    recommendations: number
  }
  performance: {
    responseTime: number
    uptime: number
    errorRate: number
    throughput: number
  }
  storage: {
    used: number
    total: number
    percentage: number
  }
}

export interface SystemServiceStatus {
  name: string
  status: 'healthy' | 'warning' | 'error'
  uptime: string
  responseTime: string
  lastCheck: string
  details?: Record<string, any>
}

export interface SystemConfigRequest {
  key: string
  value: string | number | boolean
  description?: string
  category?: string
}

// Upload API types
export interface UploadResponse {
  url: string
  filename: string
  size: number
  mimeType: string
  path: string
}

export interface BulkUploadResponse {
  successful: UploadResponse[]
  failed: Array<{
    filename: string
    error: string
  }>
}

// Export API types
export interface ExportRequest {
  type: 'users' | 'works' | 'transactions' | 'analytics'
  format: 'csv' | 'xlsx' | 'json'
  dateRange?: {
    start: string
    end: string
  }
  filters?: Record<string, any>
  columns?: string[]
}

export interface ExportResponse {
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  downloadUrl?: string
  progress?: number
  error?: string
  createdAt: string
}

// WebSocket API types
export interface WebSocketEvent {
  type: 'connect' | 'disconnect' | 'message' | 'error'
  data?: any
  timestamp: string
}

export interface NotificationMessage {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  content: string
  userId?: string
  broadcast: boolean
  persistent: boolean
  actions?: Array<{
    text: string
    action: string
    style?: 'primary' | 'secondary' | 'danger'
  }>
  createdAt: string
}

// Batch operation types
export interface BatchOperation {
  action: 'activate' | 'deactivate' | 'delete' | 'update'
  ids: string[]
  data?: Record<string, any>
}

export interface BatchOperationResult {
  successful: string[]
  failed: Array<{
    id: string
    error: string
  }>
  total: number
  successCount: number
  failureCount: number
}

// Search API types
export interface SearchRequest {
  query: string
  type?: 'users' | 'works' | 'prompts' | 'all'
  page?: number
  pageSize?: number
  filters?: Record<string, any>
  highlight?: boolean
}

export interface SearchResult {
  id: string
  type: string
  title: string
  description: string
  url: string
  score: number
  highlights?: Record<string, string[]>
  metadata?: Record<string, any>
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  took: number
  aggregations?: Record<string, any>
}

// Audit log types
export interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId: string
  changes?: {
    before: Record<string, any>
    after: Record<string, any>
  }
  ip: string
  userAgent: string
  timestamp: string
}

export interface AuditLogQuery {
  userId?: string
  action?: string
  resource?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

// Health check types
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  duration: number
  checks: Record<string, {
    status: 'healthy' | 'unhealthy'
    message?: string
    duration: number
    data?: any
  }>
}

// Rate limiting types
export interface RateLimitInfo {
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
}

// API Error types
export interface ApiError {
  code: number
  message: string
  details?: any
  requestId: string
  timestamp: string
  path: string
  method: string
}

export interface ValidationError extends ApiError {
  errors: Array<{
    field: string
    message: string
    value?: any
  }>
}

// Pagination types
export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedApiResponse<T> {
  code: number
  message: string
  data: T[]
  meta: PaginationMeta
  timestamp: string
}
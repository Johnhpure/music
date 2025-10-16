// Global types for the admin dashboard

export interface User {
  id: string
  username: string
  email?: string
  phone?: string
  avatar?: string
  role: 'admin' | 'user'
  userType: 'free' | 'vip' | 'admin'
  status: 'active' | 'inactive' | 'banned' | 'pending'
  registrationSource: 'wechat' | 'web' | 'mobile'
  totalCredits: number
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  profile?: UserProfile
}

export interface UserProfile {
  nickname?: string
  phone?: string
  gender?: 'male' | 'female' | 'other'
  birthday?: string
  bio?: string
  tags?: string[]
}

export interface MusicWork {
  id: string
  title: string
  artist: string
  genre: string
  duration: string
  coverUrl: string
  audioUrl: string
  userId: string
  status: 'draft' | 'published' | 'review' | 'rejected'
  isHot: boolean
  playCount: number
  likeCount: number
  shareCount: number
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface PromptTemplate {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  icon: string
  iconBg?: string
  isActive: boolean
  usageCount: number
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Banner {
  id: string
  title: string
  description: string
  imageUrl: string
  linkUrl?: string
  isActive: boolean
  sortOrder: number
  startDate?: string
  endDate?: string
  clickCount: number
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface HotRecommendation {
  id: string
  title: string
  artist: string
  genre: string
  duration: string
  coverUrl: string
  audioUrl: string
  isHot: boolean
  tags: string[]
  playCount: number
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreditTransaction {
  id: string
  userId: string
  type: 'consume' | 'reward' | 'purchase' | 'refund'
  amount: number
  balance: number
  description: string
  relatedId?: string
  createdAt: string
}

export interface SystemConfig {
  id: string
  key: string
  value: string | number | boolean
  description: string
  category: 'ai' | 'credit' | 'system' | 'ui'
  type: 'string' | 'number' | 'boolean' | 'json'
  isReadonly: boolean
  updatedAt: string
}

// API Response types
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ListQuery {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  status?: string
  category?: string
  startDate?: string
  endDate?: string
}

// Dashboard types
export interface DashboardStats {
  totalUsers: number
  totalWorks: number
  activeUsers: number
  totalRevenue: number
  userGrowth: number
  workGrowth: number
  activeGrowth: number
  revenueGrowth: number
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string
  borderWidth?: number
  tension?: number
}

export interface Activity {
  id: string
  type: 'user' | 'content' | 'system' | 'alert'
  title: string
  description: string
  time: string
  icon: string
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  status?: 'pending' | 'completed' | 'failed'
  userId?: string
  relatedId?: string
}

export interface SystemService {
  name: string
  status: 'healthy' | 'warning' | 'error'
  uptime: string
  responseTime: string
  url?: string
  lastCheck: string
}

// Form types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file'
  placeholder?: string
  required?: boolean
  options?: Array<{ label: string; value: any }>
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

export interface FormConfig {
  fields: FormField[]
  submitText?: string
  resetText?: string
  layout?: 'vertical' | 'horizontal'
}

// Notification types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  action?: {
    text: string
    handler: () => void
  }
  read?: boolean
  createdAt: string
}

// Table types
export interface TableColumn {
  key: string
  title: string
  width?: number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, record: any, index: number) => any
}

export interface TableConfig {
  columns: TableColumn[]
  data: any[]
  loading?: boolean
  pagination?: {
    current: number
    pageSize: number
    total: number
    showSizeChanger?: boolean
    showQuickJumper?: boolean
  }
  selection?: {
    type: 'checkbox' | 'radio'
    selectedRowKeys: string[]
    onChange: (selectedRowKeys: string[], selectedRows: any[]) => void
  }
  actions?: {
    create?: () => void
    edit?: (record: any) => void
    delete?: (record: any) => void
    view?: (record: any) => void
  }
}

// Modal types
export interface ModalConfig {
  title: string
  content?: string
  width?: number
  closable?: boolean
  maskClosable?: boolean
  footer?: boolean
  onOk?: () => void | Promise<void>
  onCancel?: () => void
  okText?: string
  cancelText?: string
  confirmLoading?: boolean
}

// Upload types
export interface UploadFile {
  uid: string
  name: string
  status: 'uploading' | 'done' | 'error'
  url?: string
  response?: any
  error?: any
  size?: number
  type?: string
}

// Route types
export interface RouteConfig {
  path: string
  name: string
  component?: any
  redirect?: string
  meta?: {
    title?: string
    icon?: string
    requiresAuth?: boolean
    roles?: string[]
    permissions?: string[]
    hideInMenu?: boolean
    keepAlive?: boolean
  }
  children?: RouteConfig[]
}

// Store types
export interface AppState {
  user: User | null
  token: string | null
  permissions: string[]
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  loading: boolean
}

export interface UserState {
  profile: User | null
  preferences: Record<string, any>
}

export interface ContentState {
  banners: Banner[]
  prompts: PromptTemplate[]
  recommendations: HotRecommendation[]
}

// Error types
export interface AppError {
  code: number
  message: string
  details?: any
  timestamp: string
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Event types
export interface AppEvent {
  type: string
  payload?: any
  timestamp: string
}

export interface WebSocketMessage {
  type: 'notification' | 'system' | 'user' | 'content'
  data: any
  timestamp: string
}

// Export all types
export * from './api'
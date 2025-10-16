# AI音乐创作助手 - 详细开发计划

> **版本**: v1.0  
> **创建时间**: 2024年  
> **项目名称**: AI音乐创作助手  
> **开发方式**: 迭代式增量开发  
> **预估工期**: 20-27个工作日

---

## 📋 目录

- [1. 项目概览](#1-项目概览)
- [2. 开发原则](#2-开发原则)
- [3. 开发阶段划分](#3-开发阶段划分)
- [4. 详细任务拆分](#4-详细任务拆分)
- [5. 里程碑与时间表](#5-里程碑与时间表)
- [6. 风险管理](#6-风险管理)
- [7. 质量保证](#7-质量保证)

---

## 1. 项目概览

### 1.1 项目背景

基于已完成的系统架构设计、技术架构设计和API文档,需要从零开始构建后端系统。当前backend目录已被删除,需要完全重建。

### 1.2 技术栈

- **后端框架**: NestJS 10.x + TypeScript 5.x
- **数据库**: MySQL 8.0+ + TypeORM 0.3.x
- **缓存**: Redis 7.x
- **消息队列**: Bull (基于Redis)
- **对象存储**: 本地文件存储 (使用MinIO或文件系统)
- **AI服务**: Google Gemini API + Suno API
- **认证**: JWT + 微信小程序登录

### 1.3 核心模块

| 模块 | 功能描述 | 优先级 |
|------|---------|--------|
| 用户认证 | 微信登录、JWT验证、手机号绑定 | P1 |
| 用户管理 | 用户信息CRUD、个人资料管理 | P1 |
| AI歌词生成 | Gemini API集成、多版本生成 | P1 |
| 点数系统 | 点数充值/消费、交易记录 | P1 |
| 音乐生成 | Suno API集成、异步任务处理 | P2 |
| 作品管理 | 作品CRUD、分享、下载 | P3 |
| 文件管理 | 文件上传、本地存储集成 | P3 |
| 热门推荐 | 推荐列表、分类管理、播放统计 | P4 |
| 素材管理 | Banner、提示词模板 | P4 |
| 部署运维 | Docker、监控、CI/CD | P5 |

---

## 2. 开发原则

### 2.1 核心原则

- **KISS (Keep It Simple, Stupid)**: 追求代码简洁,避免过度设计
- **YAGNI (You Aren't Gonna Need It)**: 只实现当前需要的功能
- **DRY (Don't Repeat Yourself)**: 消除重复代码,提升复用性
- **SOLID**: 单一职责、开闭原则、里氏替换、接口隔离、依赖倒置

### 2.2 开发规范

- **代码规范**: ESLint + Prettier统一代码风格
- **提交规范**: 遵循Conventional Commits规范
- **分支策略**: Git Flow (main/develop/feature/hotfix)
- **测试要求**: 核心模块单元测试覆盖率≥80%
- **文档同步**: 代码修改同步更新API文档

### 2.3 质量标准

- **性能**: API响应时间P95 < 200ms
- **可用性**: 系统可用性≥99.5%
- **安全性**: 通过OWASP Top 10安全检查
- **可维护性**: 代码圈复杂度≤15

---

## 3. 开发阶段划分

### P0 - 基础设施搭建 (优先级: 最高, 工期: 2-3天)

**目标**: 完成项目初始化和基础环境配置

**产出**:
- NestJS项目框架
- 数据库环境(MySQL + TypeORM)
- 缓存环境(Redis)
- 项目结构规范
- 全局配置模块
- 异常处理框架

---

### P1 - 核心功能开发 (优先级: 最高, 工期: 5-7天)

**目标**: 实现MVP最小可用产品

**产出**:
- 用户认证模块(微信登录、JWT)
- 用户管理模块(用户CRUD)
- AI歌词生成模块(Gemini集成)
- 点数系统模块(充值/消费)

**里程碑**: M1 - MVP可用

---

### P2 - 音乐生成功能 (优先级: 高, 工期: 4-5天)

**目标**: 实现异步音乐生成能力

**产出**:
- Bull队列配置
- 音乐任务模块
- Suno API集成
- 任务处理器
- 进度查询API

**里程碑**: M2 - 核心功能完整

---

### P3 - 作品管理功能 (优先级: 中, 工期: 3-4天)

**目标**: 实现作品全生命周期管理

**产出**:
- 本地文件存储集成
- 文件上传模块
- 作品CRUD模块
- 作品分享功能
- 作品下载功能

**里程碑**: M3 - 功能完善

---

### P4 - 增强功能 (优先级: 中, 工期: 4-5天)

**目标**: 提升用户体验和运营能力

**产出**:
- 热门推荐模块
- 素材管理模块
- 用户互动功能
- 统计分析功能

---

### P5 - 部署与运维 (优先级: 中, 工期: 2-3天)

**目标**: 生产环境就绪

**产出**:
- Docker容器化
- 监控告警系统
- CI/CD流水线
- 性能优化

**里程碑**: M4 - 生产就绪

---

## 4. 详细任务拆分

### P0 - 基础设施搭建

#### P0.1 NestJS项目初始化 (0.5天)

**任务清单**:
- [ ] P0.1.1 安装NestJS CLI: `npm i -g @nestjs/cli`
- [ ] P0.1.2 创建项目: `nest new backend`
- [ ] P0.1.3 安装核心依赖
  ```bash
  npm install @nestjs/typeorm typeorm mysql2
  npm install @nestjs/jwt passport passport-jwt
  npm install @nestjs/config
  npm install ioredis
  npm install @nestjs/bull bull
  npm install class-validator class-transformer
  ```
- [ ] P0.1.4 安装开发依赖
  ```bash
  npm install -D @types/passport-jwt
  npm install -D @types/node
  npm install -D eslint prettier
  ```
- [ ] P0.1.5 配置ESLint和Prettier
- [ ] P0.1.6 配置tsconfig.json

**验收标准**:
- 项目可正常启动: `npm run start:dev`
- ESLint检查通过: `npm run lint`
- 代码格式化正常: `npm run format`

---

#### P0.2 项目结构规范 (0.5天)

**任务清单**:
- [ ] P0.2.1 创建标准目录结构
  ```
  backend/
  ├── src/
  │   ├── common/           # 公共模块
  │   │   ├── decorators/   # 自定义装饰器
  │   │   ├── filters/      # 异常过滤器
  │   │   ├── guards/       # 守卫
  │   │   ├── interceptors/ # 拦截器
  │   │   ├── pipes/        # 管道
  │   │   └── utils/        # 工具函数
  │   ├── config/           # 配置模块
  │   ├── modules/          # 业务模块
  │   │   ├── auth/         # 认证模块
  │   │   ├── user/         # 用户模块
  │   │   ├── ai/           # AI服务模块
  │   │   ├── music/        # 音乐生成模块
  │   │   ├── work/         # 作品模块
  │   │   ├── credit/       # 点数模块
  │   │   └── ...
  │   ├── entities/         # 数据实体(可选,也可放在各模块内)
  │   ├── database/         # 数据库相关
  │   │   ├── migrations/   # 迁移文件
  │   │   └── seeds/        # 种子数据
  │   ├── app.module.ts
  │   └── main.ts
  ├── test/                 # 测试目录
  ├── logs/                 # 日志目录
  ├── uploads/              # 临时上传目录
  └── package.json
  ```
- [ ] P0.2.2 创建模块基础文件模板
- [ ] P0.2.3 配置路径别名(@common, @config等)

**验收标准**:
- 目录结构清晰规范
- 路径别名可正常使用

---

#### P0.3 数据库环境搭建 (0.5天)

**任务清单**:
- [ ] P0.3.1 安装MySQL 8.0+
- [ ] P0.3.2 创建数据库: `CREATE DATABASE music_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
- [ ] P0.3.3 配置TypeORM连接
  ```typescript
  // config/database.config.ts
  TypeOrmModule.forRoot({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: true,
    timezone: '+08:00',
  })
  ```
- [ ] P0.3.4 创建数据表SQL脚本(基于架构设计文档)
- [ ] P0.3.5 执行数据库初始化脚本
- [ ] P0.3.6 测试数据库连接

**验收标准**:
- 数据库连接成功
- 16张数据表创建完成
- 索引创建完成

---

#### P0.4 Redis环境搭建 (0.3天)

**任务清单**:
- [ ] P0.4.1 安装Redis 7.x
- [ ] P0.4.2 配置Redis连接
  ```typescript
  // config/redis.config.ts
  @Module({
    providers: [
      {
        provide: 'REDIS_CLIENT',
        useFactory: () => {
          return new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD,
            db: parseInt(process.env.REDIS_DB) || 0,
          });
        },
      },
    ],
    exports: ['REDIS_CLIENT'],
  })
  ```
- [ ] P0.4.3 创建RedisService封装
- [ ] P0.4.4 测试Redis连接和基本操作

**验收标准**:
- Redis连接成功
- 基本操作(GET/SET/DEL)正常

---

#### P0.5 全局配置模块 (0.3天)

**任务清单**:
- [ ] P0.5.1 安装@nestjs/config
- [ ] P0.5.2 创建.env文件和.env.example
  ```bash
  # .env
  NODE_ENV=development
  PORT=3000
  
  # Database
  DB_HOST=localhost
  DB_PORT=3306
  DB_USERNAME=root
  DB_PASSWORD=password
  DB_DATABASE=music_platform
  
  # Redis
  REDIS_HOST=localhost
  REDIS_PORT=6379
  REDIS_PASSWORD=
  REDIS_DB=0
  
  # JWT
  JWT_SECRET=your-secret-key
  JWT_EXPIRES_IN=7d
  
  # Wechat
  WECHAT_APPID=
  WECHAT_SECRET=
  
  # Gemini
  GEMINI_API_KEY=
  
  # Suno
  SUNO_API_KEY=
  SUNO_API_BASE_URL=
  
  # 本地文件存储配置
  STORAGE_TYPE=local
  STORAGE_PATH=/app/uploads
  STORAGE_BASE_URL=http://localhost:3000/uploads
  ```
- [ ] P0.5.3 配置ConfigModule
- [ ] P0.5.4 创建配置验证Schema

**验收标准**:
- 环境变量可正常读取
- 配置验证正常工作

---

#### P0.6 全局异常处理 (0.4天)

**任务清单**:
- [ ] P0.6.1 创建自定义异常类
  ```typescript
  // common/exceptions/base.exception.ts
  export class BaseException extends Error {
    constructor(
      public readonly code: number,
      public readonly message: string,
      public readonly error?: string,
    ) {
      super(message);
    }
  }
  
  export class BusinessException extends BaseException {}
  export class SystemException extends BaseException {}
  export class ExternalApiException extends BaseException {}
  ```
- [ ] P0.6.2 创建全局异常过滤器
  ```typescript
  // common/filters/http-exception.filter.ts
  @Catch()
  export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      // 异常处理逻辑
    }
  }
  ```
- [ ] P0.6.3 创建响应拦截器
  ```typescript
  // common/interceptors/transform.interceptor.ts
  @Injectable()
  export class TransformInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
        map(data => ({
          code: 200,
          message: 'success',
          data,
          timestamp: new Date().toISOString(),
        })),
      );
    }
  }
  ```
- [ ] P0.6.4 创建ValidationPipe配置
- [ ] P0.6.5 在main.ts中注册全局过滤器、拦截器、管道

**验收标准**:
- 异常可被正确捕获和格式化
- 响应格式统一
- 参数验证正常工作

---

#### P0.7 日志系统 (0.5天)

**任务清单**:
- [ ] P0.7.1 安装winston和相关依赖
  ```bash
  npm install winston winston-daily-rotate-file
  ```
- [ ] P0.7.2 配置Winston Logger
  ```typescript
  // common/logger/winston.logger.ts
  import * as winston from 'winston';
  import 'winston-daily-rotate-file';
  
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
    transports: [
      new winston.transports.DailyRotateFile({
        filename: 'logs/%DATE%-combined.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '30d',
      }),
      new winston.transports.DailyRotateFile({
        level: 'error',
        filename: 'logs/%DATE%-error.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '30d',
      }),
    ],
  });
  ```
- [ ] P0.7.3 创建LoggerService
- [ ] P0.7.4 集成到NestJS Logger

**验收标准**:
- 日志可正常输出到文件
- 日志分级正常
- 日志轮转正常

---

### P1 - 核心功能开发

#### P1.1 用户认证模块 (1.5天)

**任务清单**:

**P1.1.1 微信登录Service (0.5天)**
- [ ] 创建WechatService
  ```typescript
  // modules/auth/wechat.service.ts
  @Injectable()
  export class WechatService {
    async getOpenidByCode(code: string): Promise<WechatAuthResult> {
      // 调用微信API: GET https://api.weixin.qq.com/sns/jscode2session
    }
    
    async getPhoneNumber(phoneCode: string): Promise<string> {
      // 获取手机号
    }
  }
  ```
- [ ] 创建认证DTO
  ```typescript
  // modules/auth/dto/wechat-auth.dto.ts
  export class WechatAuthDto {
    @IsString()
    code: string;
    
    @IsOptional()
    @IsString()
    nickName?: string;
    
    @IsOptional()
    @IsString()
    avatarUrl?: string;
    
    @IsOptional()
    @IsString()
    phoneCode?: string;
  }
  ```
- [ ] 测试微信API调用

**P1.1.2 JWT策略配置 (0.3天)**
- [ ] 安装passport相关依赖
- [ ] 配置JwtModule
  ```typescript
  // modules/auth/auth.module.ts
  JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  })
  ```
- [ ] 创建JwtStrategy
  ```typescript
  // modules/auth/strategies/jwt.strategy.ts
  @Injectable()
  export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly userService: UserService) {
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
      });
    }
    
    async validate(payload: any) {
      return await this.userService.findById(payload.userId);
    }
  }
  ```

**P1.1.3 Guards和Decorators (0.3天)**
- [ ] 创建JwtAuthGuard
  ```typescript
  // modules/auth/guards/jwt-auth.guard.ts
  @Injectable()
  export class JwtAuthGuard extends AuthGuard('jwt') {}
  ```
- [ ] 创建@CurrentUser装饰器
  ```typescript
  // common/decorators/current-user.decorator.ts
  export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      return request.user;
    },
  );
  ```
- [ ] 创建@Public装饰器(跳过JWT验证)

**P1.1.4 AuthService实现 (0.4天)**
- [ ] 实现登录逻辑
  ```typescript
  // modules/auth/auth.service.ts
  @Injectable()
  export class AuthService {
    async wechatAuth(dto: WechatAuthDto) {
      // 1. 获取openid
      const { openid, session_key } = await this.wechatService.getOpenidByCode(dto.code);
      
      // 2. 查询或创建用户
      let user = await this.userService.findByOpenid(openid);
      if (!user) {
        user = await this.userService.create({
          openid,
          nickName: dto.nickName,
          avatarUrl: dto.avatarUrl,
        });
      }
      
      // 3. 生成JWT Token
      const token = this.jwtService.sign({ userId: user.id, openid });
      
      // 4. 缓存Session到Redis
      await this.redis.setex(`session:${token}`, 7 * 24 * 3600, JSON.stringify({ userId: user.id }));
      
      return {
        token,
        userInfo: user,
      };
    }
    
    async checkLoginState(userId: number) {
      // 检查登录状态
    }
    
    async logout(token: string) {
      // 清除Session
    }
  }
  ```

**验收标准**:
- 微信登录流程正常
- JWT Token生成和验证正常
- Guards正常工作
- 登录状态检查正常

---

#### P1.2 用户管理模块 (1天)

**任务清单**:

**P1.2.1 User实体定义 (0.2天)**
- [ ] 创建User实体
  ```typescript
  // modules/user/entities/user.entity.ts
  @Entity('t_users')
  export class User {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ unique: true })
    openid: string;
    
    @Column({ nullable: true })
    phone: string;
    
    @Column({ name: 'nick_name' })
    nickName: string;
    
    @Column({ name: 'avatar_url', nullable: true })
    avatarUrl: string;
    
    @Column({ name: 'credit_balance', default: 100 })
    creditBalance: number;
    
    @Column({ default: false })
    isBanned: boolean;
    
    @Column({ default: false })
    isAdmin: boolean;
    
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
    
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  }
  ```

**P1.2.2 UserService实现 (0.4天)**
- [ ] 实现用户CRUD
  ```typescript
  // modules/user/user.service.ts
  @Injectable()
  export class UserService {
    constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      @Inject('REDIS_CLIENT')
      private readonly redis: Redis,
    ) {}
    
    async findById(id: number): Promise<User> {}
    async findByOpenid(openid: string): Promise<User> {}
    async create(data: CreateUserDto): Promise<User> {}
    async update(id: number, data: UpdateUserDto): Promise<User> {}
    async updateCreditBalance(id: number, amount: number): Promise<void> {}
    async getUserProfile(id: number): Promise<UserProfileDto> {}
  }
  ```
- [ ] 实现缓存策略(用户信息缓存)

**P1.2.3 UserController实现 (0.4天)**
- [ ] 实现用户API
  ```typescript
  // modules/user/user.controller.ts
  @Controller('api/user')
  @UseGuards(JwtAuthGuard)
  export class UserController {
    @Get('profile')
    async getProfile(@CurrentUser() user: User) {}
    
    @Put('profile')
    async updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {}
    
    @Put('bind-phone')
    async bindPhone(@CurrentUser() user: User, @Body() dto: BindPhoneDto) {}
    
    @Put('change-password')
    async changePassword(@CurrentUser() user: User, @Body() dto: ChangePasswordDto) {}
    
    @Get('works')
    async getUserWorks(@CurrentUser() user: User, @Query() query: ListQueryDto) {}
    
    @Get('credit-logs')
    async getCreditLogs(@CurrentUser() user: User, @Query() query: ListQueryDto) {}
  }
  ```

**验收标准**:
- 用户信息可正常查询
- 用户信息可正常更新
- 手机号绑定正常
- 用户缓存正常工作

---

#### P1.3 AI歌词生成模块 (1.5天)

**任务清单**:

**P1.3.1 Gemini客户端封装 (0.4天)**
- [ ] 安装Google Generative AI SDK
  ```bash
  npm install @google/generative-ai
  ```
- [ ] 创建GeminiService
  ```typescript
  // modules/ai/gemini.service.ts
  @Injectable()
  export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private model: GenerativeModel;
    
    constructor() {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
    
    async generateLyrics(prompt: string): Promise<string> {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    }
  }
  ```
- [ ] 实现错误重试机制(指数退避)

**P1.3.2 提示词模板设计 (0.3天)**
- [ ] 创建提示词模板
  ```typescript
  // modules/ai/templates/lyrics-prompt.template.ts
  export function buildLyricsPrompt(params: {
    theme: string;
    style?: string;
    mood?: string;
    language?: string;
    additionalRequirements?: string;
  }): string {
    return `你是一位专业的歌词创作者。请根据以下要求创作一首歌词：
  
  主题: ${params.theme}
  风格: ${params.style || '流行'}
  情绪: ${params.mood || '中性'}
  语言: ${params.language || '中文'}
  
  ${params.additionalRequirements ? `额外要求: ${params.additionalRequirements}` : ''}
  
  要求:
  1. 歌词结构完整,包含主歌、副歌
  2. 语言流畅,富有感染力
  3. 符合指定的风格和情绪
  4. 总字数控制在200-500字
  
  请直接输出歌词内容,不要包含其他说明。`;
  }
  ```

**P1.3.3 歌词生成Service (0.5天)**
- [ ] 创建歌词实体
  ```typescript
  // modules/ai/entities/lyrics-generation.entity.ts
  @Entity('t_lyrics_generation')
  export class LyricsGeneration {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ name: 'request_id', unique: true })
    requestId: string;
    
    @Column({ name: 'user_id' })
    userId: number;
    
    @Column()
    theme: string;
    
    @Column({ nullable: true })
    style: string;
    
    @Column({ nullable: true })
    mood: string;
    
    @Column({ type: 'json' })
    versions: Array<{
      versionNumber: number;
      title: string;
      lyrics: string;
      wordCount: number;
    }>;
    
    @Column({ name: 'cost_credits', default: 10 })
    costCredits: number;
    
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  }
  ```
- [ ] 实现AIService
  ```typescript
  // modules/ai/ai.service.ts
  @Injectable()
  export class AIService {
    async generateLyrics(userId: number, dto: GenerateLyricsDto) {
      // 1. 检查点数
      const balance = await this.creditService.getBalance(userId);
      if (balance < 10) {
        throw new BusinessException(402, '点数不足', 'INSUFFICIENT_CREDITS');
      }
      
      // 2. 扣减点数(事务)
      await this.creditService.consume(userId, 10, 'AI歌词生成');
      
      // 3. 生成歌词(多版本)
      const versions = await this.generateMultipleVersions(dto);
      
      // 4. 保存生成记录
      const record = await this.saveLyricsGeneration(userId, dto, versions);
      
      return {
        requestId: record.requestId,
        versions: record.versions,
        costCredits: 10,
        remainingCredits: await this.creditService.getBalance(userId),
        createdAt: record.createdAt,
      };
    }
    
    private async generateMultipleVersions(dto: GenerateLyricsDto) {
      const versionsCount = dto.versionsCount || 2;
      const results = [];
      
      for (let i = 0; i < versionsCount; i++) {
        const prompt = buildLyricsPrompt(dto);
        const lyrics = await this.geminiService.generateLyrics(prompt);
        
        results.push({
          versionNumber: i + 1,
          title: this.extractTitle(lyrics),
          lyrics: lyrics,
          wordCount: this.countWords(lyrics),
        });
      }
      
      return results;
    }
  }
  ```

**P1.3.4 AI Controller实现 (0.3天)**
- [ ] 实现API端点
  ```typescript
  // modules/ai/ai.controller.ts
  @Controller('api/ai')
  @UseGuards(JwtAuthGuard)
  export class AIController {
    @Post('lyrics/generate')
    @ApiOperation({ summary: '生成AI歌词' })
    async generateLyrics(@CurrentUser() user: User, @Body() dto: GenerateLyricsDto) {}
    
    @Get('lyrics/history')
    async getLyricsHistory(@CurrentUser() user: User, @Query() query: ListQueryDto) {}
    
    @Get('lyrics/:requestId')
    async getLyricsDetail(@Param('requestId') requestId: string) {}
  }
  ```

**验收标准**:
- Gemini API调用正常
- 多版本歌词生成正常
- 点数扣减正常
- 生成记录保存正常
- 错误重试机制正常

---

#### P1.4 点数系统模块 (1.5天)

**任务清单**:

**P1.4.1 点数实体定义 (0.2天)**
- [ ] 创建点数套餐实体
  ```typescript
  // modules/credit/entities/credit-package.entity.ts
  @Entity('t_credit_packages')
  export class CreditPackage {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    name: string;
    
    @Column()
    credits: number;
    
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;
    
    @Column({ name: 'bonus_credits', default: 0 })
    bonusCredits: number;
    
    @Column({ name: 'is_active', default: true })
    isActive: boolean;
  }
  ```
- [ ] 创建点数记录实体
  ```typescript
  // modules/credit/entities/credit-log.entity.ts
  @Entity('t_credit_logs')
  export class CreditLog {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ name: 'user_id' })
    userId: number;
    
    @Column()
    amount: number; // 正数=充值, 负数=消费
    
    @Column({ name: 'balance_before' })
    balanceBefore: number;
    
    @Column({ name: 'balance_after' })
    balanceAfter: number;
    
    @Column({ type: 'enum', enum: ['recharge', 'consume', 'reward', 'refund'] })
    type: string;
    
    @Column()
    description: string;
    
    @Column({ name: 'order_id', nullable: true })
    orderId: string;
    
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  }
  ```

**P1.4.2 CreditService实现 (0.6天)**
- [ ] 实现点数服务
  ```typescript
  // modules/credit/credit.service.ts
  @Injectable()
  export class CreditService {
    async getBalance(userId: number): Promise<number> {
      // 优先从Redis获取
      const cached = await this.redis.get(`user:credit:${userId}`);
      if (cached) return parseInt(cached);
      
      // 从数据库查询
      const user = await this.userService.findById(userId);
      
      // 写入缓存
      await this.redis.setex(`user:credit:${userId}`, 3600, user.creditBalance);
      
      return user.creditBalance;
    }
    
    async consume(userId: number, amount: number, description: string): Promise<CreditLog> {
      return await this.dataSource.transaction(async manager => {
        // 1. 查询当前余额
        const user = await manager.findOne(User, { where: { id: userId } });
        if (user.creditBalance < amount) {
          throw new BusinessException(402, '点数不足', 'INSUFFICIENT_CREDITS');
        }
        
        // 2. 扣减点数
        const balanceBefore = user.creditBalance;
        const balanceAfter = balanceBefore - amount;
        
        await manager.update(User, { id: userId }, { creditBalance: balanceAfter });
        
        // 3. 记录日志
        const log = await manager.save(CreditLog, {
          userId,
          amount: -amount,
          balanceBefore,
          balanceAfter,
          type: 'consume',
          description,
        });
        
        // 4. 更新缓存
        await this.redis.setex(`user:credit:${userId}`, 3600, balanceAfter);
        
        return log;
      });
    }
    
    async recharge(userId: number, packageId: number, orderId: string): Promise<CreditLog> {
      // 充值逻辑(事务)
    }
    
    async reward(userId: number, amount: number, description: string): Promise<CreditLog> {
      // 奖励点数(签到、分享等)
    }
    
    async refund(userId: number, amount: number, description: string): Promise<CreditLog> {
      // 退款(任务失败)
    }
    
    async getCreditLogs(userId: number, query: ListQueryDto) {
      // 查询点数记录
    }
  }
  ```

**P1.4.3 CreditController实现 (0.4天)**
- [ ] 实现API端点
  ```typescript
  // modules/credit/credit.controller.ts
  @Controller('api/credit')
  @UseGuards(JwtAuthGuard)
  export class CreditController {
    @Get('balance')
    async getBalance(@CurrentUser() user: User) {}
    
    @Get('packages')
    @Public() // 公开接口
    async getPackages() {}
    
    @Post('recharge')
    async recharge(@CurrentUser() user: User, @Body() dto: RechargeDto) {}
    
    @Get('logs')
    async getLogs(@CurrentUser() user: User, @Query() query: ListQueryDto) {}
  }
  ```

**P1.4.4 点数套餐种子数据 (0.3天)**
- [ ] 创建种子数据脚本
  ```sql
  -- database/seeds/credit-packages.sql
  INSERT INTO t_credit_packages (name, credits, price, bonus_credits, is_active) VALUES
  ('基础套餐', 100, 9.90, 0, 1),
  ('进阶套餐', 500, 49.00, 50, 1),
  ('专业套餐', 1000, 99.00, 200, 1),
  ('豪华套餐', 5000, 399.00, 1000, 1);
  ```

**验收标准**:
- 点数查询正常(缓存优先)
- 点数消费正常(事务保证)
- 点数充值正常
- 点数奖励和退款正常
- 点数记录查询正常
- 缓存同步正常

---

### P2 - 音乐生成功能

#### P2.1 Bull队列配置 (0.5天)

**任务清单**:
- [ ] P2.1.1 安装Bull和相关依赖
  ```bash
  npm install @nestjs/bull bull
  npm install -D @types/bull
  ```
- [ ] P2.1.2 配置BullModule
  ```typescript
  // modules/task/task.module.ts
  @Module({
    imports: [
      BullModule.forRoot({
        redis: {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT),
        },
      }),
      BullModule.registerQueue({
        name: 'music-generation',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: false,
          removeOnFail: false,
        },
      }),
    ],
  })
  ```
- [ ] P2.1.3 测试队列连接

**验收标准**:
- Bull队列初始化成功
- 队列可正常添加任务

---

#### P2.2 音乐任务模块 (1天)

**任务清单**:

**P2.2.1 音乐任务实体 (0.2天)**
- [ ] 创建MusicTask实体
  ```typescript
  // modules/music/entities/music-task.entity.ts
  @Entity('t_music_tasks')
  export class MusicTask {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ name: 'task_id', unique: true })
    taskId: string;
    
    @Column({ name: 'user_id' })
    userId: number;
    
    @Column()
    title: string;
    
    @Column({ type: 'text' })
    lyrics: string;
    
    @Column()
    style: string;
    
    @Column({ name: 'voice_gender' })
    voiceGender: string;
    
    @Column({ type: 'enum', enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' })
    status: string;
    
    @Column({ default: 0 })
    progress: number;
    
    @Column({ name: 'audio_url', nullable: true })
    audioUrl: string;
    
    @Column({ name: 'cover_url', nullable: true })
    coverUrl: string;
    
    @Column({ nullable: true })
    duration: string;
    
    @Column({ name: 'error_message', nullable: true, type: 'text' })
    errorMessage: string;
    
    @Column({ name: 'suno_task_id', nullable: true })
    sunoTaskId: string;
    
    @Column({ name: 'cost_credits', default: 20 })
    costCredits: number;
    
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
    
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
    
    @Column({ name: 'completed_at', nullable: true })
    completedAt: Date;
  }
  ```

**P2.2.2 MusicService实现 (0.5天)**
- [ ] 实现音乐服务
  ```typescript
  // modules/music/music.service.ts
  @Injectable()
  export class MusicService {
    constructor(
      @InjectRepository(MusicTask)
      private readonly taskRepository: Repository<MusicTask>,
      @InjectQueue('music-generation')
      private readonly musicQueue: Queue,
      private readonly creditService: CreditService,
      @Inject('REDIS_CLIENT')
      private readonly redis: Redis,
    ) {}
    
    async createMusicTask(userId: number, dto: CreateMusicDto): Promise<MusicTask> {
      // 1. 检查点数
      const balance = await this.creditService.getBalance(userId);
      if (balance < 20) {
        throw new BusinessException(402, '点数不足', 'INSUFFICIENT_CREDITS');
      }
      
      // 2. 扣减点数
      await this.creditService.consume(userId, 20, '音乐生成');
      
      // 3. 创建任务记录
      const taskId = `music_task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const task = await this.taskRepository.save({
        taskId,
        userId,
        title: dto.title,
        lyrics: dto.lyrics,
        style: dto.style,
        voiceGender: dto.voiceGender,
        status: 'pending',
        progress: 0,
      });
      
      // 4. 加入队列
      await this.musicQueue.add('generate-music', {
        taskId: task.taskId,
        userId: task.userId,
        title: task.title,
        lyrics: task.lyrics,
        style: task.style,
        voiceGender: task.voiceGender,
      });
      
      // 5. 初始化Redis进度
      await this.redis.setex(
        `music:task:progress:${task.taskId}`,
        3600,
        JSON.stringify({ status: 'pending', progress: 0 }),
      );
      
      return task;
    }
    
    async getTaskStatus(taskId: string) {
      // 优先从Redis获取实时进度
      const cached = await this.redis.get(`music:task:progress:${taskId}`);
      if (cached) return JSON.parse(cached);
      
      // 从数据库查询
      const task = await this.taskRepository.findOne({ where: { taskId } });
      return {
        status: task.status,
        progress: task.progress,
        audioUrl: task.audioUrl,
        coverUrl: task.coverUrl,
      };
    }
    
    async getUserTasks(userId: number, query: ListQueryDto) {
      // 查询用户的音乐任务列表
    }
  }
  ```

**P2.2.3 MusicController实现 (0.3天)**
- [ ] 实现API端点
  ```typescript
  // modules/music/music.controller.ts
  @Controller('api/music')
  @UseGuards(JwtAuthGuard)
  export class MusicController {
    @Post('generate')
    @ApiOperation({ summary: '创建音乐生成任务' })
    async generateMusic(@CurrentUser() user: User, @Body() dto: CreateMusicDto) {}
    
    @Get(':taskId/status')
    async getTaskStatus(@Param('taskId') taskId: string) {}
    
    @Get('tasks')
    async getUserTasks(@CurrentUser() user: User, @Query() query: ListQueryDto) {}
    
    @Delete(':taskId')
    async cancelTask(@CurrentUser() user: User, @Param('taskId') taskId: string) {}
  }
  ```

**验收标准**:
- 音乐任务可正常创建
- 任务加入队列成功
- 任务状态可正常查询
- 点数扣减正常

---

#### P2.3 Suno API集成 (1天)

**任务清单**:

**P2.3.1 Suno客户端封装 (0.4天)**
- [ ] 创建SunoService
  ```typescript
  // modules/music/suno.service.ts
  @Injectable()
  export class SunoService {
    private readonly baseUrl: string;
    private readonly apiKey: string;
    
    constructor() {
      this.baseUrl = process.env.SUNO_API_BASE_URL;
      this.apiKey = process.env.SUNO_API_KEY;
    }
    
    async generateMusic(params: {
      lyrics: string;
      style: string;
      title?: string;
    }): Promise<{ taskId: string }> {
      // 调用Suno API创建任务
      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          lyrics: params.lyrics,
          style: params.style,
          title: params.title,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      
      return { taskId: response.data.taskId };
    }
    
    async getTaskStatus(taskId: string): Promise<{
      status: 'processing' | 'completed' | 'failed';
      audioUrl?: string;
      coverUrl?: string;
      duration?: string;
      errorMessage?: string;
    }> {
      // 查询Suno任务状态
      const response = await axios.get(
        `${this.baseUrl}/api/status/${taskId}`,
        {
          headers: { 'Authorization': `Bearer ${this.apiKey}` },
        },
      );
      
      return response.data;
    }
  }
  ```
- [ ] 实现错误重试和超时处理

**P2.3.2 任务处理器实现 (0.6天)**
- [ ] 创建Processor
  ```typescript
  // modules/task/processors/music-task.processor.ts
  @Processor('music-generation')
  export class MusicTaskProcessor {
    constructor(
      @InjectRepository(MusicTask)
      private readonly taskRepository: Repository<MusicTask>,
      private readonly sunoService: SunoService,
      private readonly ossService: OSSService,
      private readonly creditService: CreditService,
      @Inject('REDIS_CLIENT')
      private readonly redis: Redis,
    ) {}
    
    @Process('generate-music')
    async handleMusicGeneration(job: Job) {
      const { taskId, userId, title, lyrics, style, voiceGender } = job.data;
      
      try {
        // 1. 更新状态为processing
        await this.updateTaskStatus(taskId, 'processing', 10);
        
        // 2. 调用Suno API
        const { taskId: sunoTaskId } = await this.sunoService.generateMusic({
          lyrics,
          style,
          title,
        });
        
        await this.taskRepository.update({ taskId }, { sunoTaskId });
        await this.updateTaskStatus(taskId, 'processing', 30);
        
        // 3. 轮询Suno任务状态
        let sunoStatus = await this.sunoService.getTaskStatus(sunoTaskId);
        let attempts = 0;
        const maxAttempts = 60; // 最多轮询60次(5分钟)
        
        while (sunoStatus.status === 'processing' && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // 等待5秒
          sunoStatus = await this.sunoService.getTaskStatus(sunoTaskId);
          attempts++;
          
          // 更新进度
          const progress = 30 + (attempts / maxAttempts) * 60;
          await this.updateTaskStatus(taskId, 'processing', Math.floor(progress));
        }
        
        if (sunoStatus.status === 'failed') {
          throw new Error(sunoStatus.errorMessage || 'Suno生成失败');
        }
        
        if (sunoStatus.status === 'processing') {
          throw new Error('Suno生成超时');
        }
        
        // 4. 下载并上传到OSS
        await this.updateTaskStatus(taskId, 'processing', 90);
        
        const audioUrl = await this.ossService.uploadFromUrl(
          sunoStatus.audioUrl,
          `music/generated/${taskId}.mp3`,
        );
        
        const coverUrl = await this.ossService.uploadFromUrl(
          sunoStatus.coverUrl,
          `music/covers/${taskId}.jpg`,
        );
        
        // 5. 更新任务完成
        await this.taskRepository.update(
          { taskId },
          {
            status: 'completed',
            progress: 100,
            audioUrl,
            coverUrl,
            duration: sunoStatus.duration,
            completedAt: new Date(),
          },
        );
        
        await this.updateTaskStatus(taskId, 'completed', 100, { audioUrl, coverUrl });
        
        return { success: true, taskId };
        
      } catch (error) {
        this.logger.error(`任务${taskId}失败: ${error.message}`);
        
        // 判断是否需要重试
        if (job.attemptsMade < job.opts.attempts) {
          throw error; // 抛出错误触发重试
        } else {
          // 达到最大重试次数,标记失败
          await this.taskRepository.update(
            { taskId },
            {
              status: 'failed',
              errorMessage: error.message,
            },
          );
          
          await this.updateTaskStatus(taskId, 'failed', 0, { errorMessage: error.message });
          
          // 退还点数
          await this.creditService.refund(userId, 20, '音乐生成失败退款');
        }
      }
    }
    
    private async updateTaskStatus(
      taskId: string,
      status: string,
      progress: number,
      extra: any = {},
    ) {
      await this.redis.setex(
        `music:task:progress:${taskId}`,
        3600,
        JSON.stringify({ status, progress, ...extra }),
      );
    }
  }
  ```

**验收标准**:
- Suno API调用正常
- 任务状态轮询正常
- 文件下载和OSS上传正常
- 任务状态实时更新
- 失败重试正常
- 失败后点数退款正常

---

#### P2.4 WebSocket进度推送(可选) (0.5天)

**任务清单**:
- [ ] P2.4.1 安装WebSocket依赖
  ```bash
  npm install @nestjs/websockets @nestjs/platform-socket.io
  ```
- [ ] P2.4.2 创建MusicGateway
  ```typescript
  // modules/music/music.gateway.ts
  @WebSocketGateway({ cors: true })
  export class MusicGateway {
    @WebSocketServer()
    server: Server;
    
    sendTaskProgress(taskId: string, progress: any) {
      this.server.emit(`task:${taskId}:progress`, progress);
    }
  }
  ```
- [ ] P2.4.3 在Processor中推送进度

**验收标准**:
- WebSocket连接正常
- 进度实时推送正常

---

### P3 - 作品管理功能

#### P3.1 本地文件存储集成 (0.8天)

**任务清单**:
- [ ] P3.1.1 安装文件处理库
  ```bash
  npm install @nestjs/platform-express multer
  npm install -D @types/multer
  ```
- [ ] P3.1.2 创建StorageService
  ```typescript
  // modules/file/storage.service.ts
  @Injectable()
  export class StorageService {
    private readonly uploadPath: string;
    private readonly baseUrl: string;
    
    constructor(private configService: ConfigService) {
      this.uploadPath = this.configService.get<string>('STORAGE_PATH') || './uploads';
      this.baseUrl = this.configService.get<string>('STORAGE_BASE_URL') || 'http://localhost:3000/uploads';
      
      // 确保上传目录存在
      if (!fs.existsSync(this.uploadPath)) {
        fs.mkdirSync(this.uploadPath, { recursive: true });
      }
    }
    
    async upload(file: Express.Multer.File, subPath: string): Promise<string> {
      const filePath = path.join(this.uploadPath, subPath);
      const dir = path.dirname(filePath);
      
      // 确保目录存在
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // 保存文件
      await fs.promises.writeFile(filePath, file.buffer);
      
      // 返回访问URL
      return `${this.baseUrl}/${subPath}`;
    }
    
    async uploadFromUrl(url: string, subPath: string): Promise<string> {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const filePath = path.join(this.uploadPath, subPath);
      const dir = path.dirname(filePath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      await fs.promises.writeFile(filePath, Buffer.from(response.data));
      return `${this.baseUrl}/${subPath}`;
    }
    
    async delete(subPath: string): Promise<void> {
      const filePath = path.join(this.uploadPath, subPath);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }
    
    getFileUrl(subPath: string): string {
      return `${this.baseUrl}/${subPath}`;
    }
  }
  ```
- [ ] P3.1.3 配置静态文件访问
- [ ] P3.1.4 测试上传和下载

**验收标准**:
- 文件上传成功
- 文件下载正常
- 静态文件访问正常
- 文件删除功能正常

---

#### P3.2 文件上传模块 (0.7天)

**任务清单**:
- [ ] P3.2.1 安装Multer
  ```bash
  npm install -D @types/multer
  ```
- [ ] P3.2.2 配置文件上传拦截器
  ```typescript
  // modules/file/file.service.ts
  @Injectable()
  export class FileService {
    constructor(
      @InjectRepository(File)
      private readonly fileRepository: Repository<File>,
      private readonly ossService: OSSService,
    ) {}
    
    async uploadFile(
      file: Express.Multer.File,
      userId: number,
      type: 'audio' | 'image' | 'other',
    ): Promise<File> {
      // 1. 验证文件
      this.validateFile(file, type);
      
      // 2. 生成文件路径
      const ext = path.extname(file.originalname);
      const filename = `${type}_${Date.now()}_${userId}_${Math.random().toString(36).substr(2, 9)}${ext}`;
      const ossPath = `music-platform/${type}s/uploads/${filename}`;
      
      // 3. 上传到OSS
      const url = await this.ossService.upload(file, ossPath);
      
      // 4. 保存记录
      const fileRecord = await this.fileRepository.save({
        userId,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: type,
        mimeType: file.mimetype,
        url,
        ossPath,
      });
      
      return fileRecord;
    }
    
    private validateFile(file: Express.Multer.File, type: string) {
      // 验证文件大小和类型
      const maxSizes = {
        audio: 50 * 1024 * 1024, // 50MB
        image: 5 * 1024 * 1024,  // 5MB
        other: 10 * 1024 * 1024, // 10MB
      };
      
      if (file.size > maxSizes[type]) {
        throw new BusinessException(400, '文件过大', 'FILE_TOO_LARGE');
      }
      
      const allowedMimeTypes = {
        audio: ['audio/mpeg', 'audio/mp3', 'audio/wav'],
        image: ['image/jpeg', 'image/png', 'image/gif'],
      };
      
      if (type !== 'other' && !allowedMimeTypes[type].includes(file.mimetype)) {
        throw new BusinessException(400, '文件类型不支持', 'INVALID_FILE_TYPE');
      }
    }
  }
  ```
- [ ] P3.2.3 实现FileController
  ```typescript
  // modules/file/file.controller.ts
  @Controller('api/file')
  @UseGuards(JwtAuthGuard)
  export class FileController {
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
      @CurrentUser() user: User,
      @UploadedFile() file: Express.Multer.File,
      @Body('type') type: 'audio' | 'image' | 'other',
    ) {}
    
    @Get(':id')
    async getFile(@Param('id') id: number) {}
    
    @Delete(':id')
    async deleteFile(@CurrentUser() user: User, @Param('id') id: number) {}
  }
  ```

**验收标准**:
- 文件上传成功
- 文件验证正常
- 文件记录保存正常
- 文件可正常访问

---

#### P3.3 作品管理模块 (1天)

**任务清单**:

**P3.3.1 Work实体定义 (0.2天)**
- [ ] 创建Work实体
  ```typescript
  // modules/work/entities/work.entity.ts
  @Entity('t_works')
  export class Work {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ name: 'user_id' })
    userId: number;
    
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    author: User;
    
    @Column()
    title: string;
    
    @Column({ type: 'text' })
    lyrics: string;
    
    @Column({ name: 'audio_url' })
    audioUrl: string;
    
    @Column({ name: 'cover_url', nullable: true })
    coverUrl: string;
    
    @Column({ nullable: true })
    duration: string;
    
    @Column({ nullable: true })
    genre: string;
    
    @Column()
    style: string;
    
    @Column({ name: 'voice_gender' })
    voiceGender: string;
    
    @Column({ type: 'enum', enum: ['public', 'private'], default: 'private' })
    visibility: string;
    
    @Column({ name: 'play_count', default: 0 })
    playCount: number;
    
    @Column({ name: 'like_count', default: 0 })
    likeCount: number;
    
    @Column({ name: 'share_count', default: 0 })
    shareCount: number;
    
    @Column({ name: 'download_count', default: 0 })
    downloadCount: number;
    
    @Column({ name: 'is_deleted', default: false })
    isDeleted: boolean;
    
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
    
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  }
  ```

**P3.3.2 WorkService实现 (0.5天)**
- [ ] 实现作品服务
  ```typescript
  // modules/work/work.service.ts
  @Injectable()
  export class WorkService {
    async createWork(userId: number, dto: CreateWorkDto): Promise<Work> {}
    
    async getUserWorks(userId: number, query: ListQueryDto) {
      return await this.workRepository
        .createQueryBuilder('work')
        .leftJoinAndSelect('work.author', 'user')
        .where('work.userId = :userId', { userId })
        .andWhere('work.isDeleted = :isDeleted', { isDeleted: false })
        .orderBy('work.createdAt', 'DESC')
        .skip((query.page - 1) * query.pageSize)
        .take(query.pageSize)
        .getManyAndCount();
    }
    
    async getWorkDetail(id: number): Promise<Work> {}
    
    async updateWork(id: number, userId: number, dto: UpdateWorkDto): Promise<Work> {}
    
    async deleteWork(id: number, userId: number): Promise<void> {
      // 软删除
      await this.workRepository.update(
        { id, userId },
        { isDeleted: true },
      );
    }
    
    async incrementPlayCount(id: number): Promise<void> {}
    async incrementLikeCount(id: number): Promise<void> {}
    async incrementShareCount(id: number): Promise<void> {}
    async incrementDownloadCount(id: number): Promise<void> {}
  }
  ```

**P3.3.3 WorkController实现 (0.3天)**
- [ ] 实现API端点
  ```typescript
  // modules/work/work.controller.ts
  @Controller('api/work')
  @UseGuards(JwtAuthGuard)
  export class WorkController {
    @Post()
    async createWork(@CurrentUser() user: User, @Body() dto: CreateWorkDto) {}
    
    @Get('my')
    async getMyWorks(@CurrentUser() user: User, @Query() query: ListQueryDto) {}
    
    @Get(':id')
    async getWorkDetail(@Param('id') id: number) {}
    
    @Put(':id')
    async updateWork(
      @CurrentUser() user: User,
      @Param('id') id: number,
      @Body() dto: UpdateWorkDto,
    ) {}
    
    @Delete(':id')
    async deleteWork(@CurrentUser() user: User, @Param('id') id: number) {}
    
    @Post(':id/play')
    async trackPlay(@Param('id') id: number) {}
    
    @Post(':id/like')
    async likeWork(@CurrentUser() user: User, @Param('id') id: number) {}
    
    @Post(':id/share')
    async shareWork(@Param('id') id: number, @Body() dto: ShareWorkDto) {}
    
    @Get(':id/download')
    async downloadWork(@Param('id') id: number) {}
  }
  ```

**验收标准**:
- 作品可正常创建
- 作品列表查询正常(分页、排序)
- 作品详情查询正常
- 作品更新和删除正常
- 统计计数正常

---

#### P3.4 作品分享和下载 (0.5天)

**任务清单**:
- [ ] P3.4.1 实现分享链接生成
  ```typescript
  async shareWork(id: number, dto: ShareWorkDto): Promise<{ shareUrl: string }> {
    // 生成分享链接
    const shareToken = this.generateShareToken(id);
    await this.redis.setex(`share:${shareToken}`, 7 * 24 * 3600, id);
    
    // 增加分享计数
    await this.incrementShareCount(id);
    
    // 分享奖励点数
    if (dto.userId) {
      await this.creditService.reward(dto.userId, 1, '分享作品奖励');
    }
    
    return {
      shareUrl: `${process.env.FRONTEND_URL}/share/${shareToken}`,
    };
  }
  ```
- [ ] P3.4.2 实现下载功能
  ```typescript
  async downloadWork(id: number): Promise<{ downloadUrl: string }> {
    const work = await this.workRepository.findOne({ where: { id } });
    
    // 增加下载计数
    await this.incrementDownloadCount(id);
    
    // 生成临时下载链接(1小时有效)
    const downloadUrl = await this.ossService.getSignedUrl(work.audioUrl, 3600);
    
    return { downloadUrl };
  }
  ```

**验收标准**:
- 分享链接生成正常
- 分享奖励正常
- 下载链接生成正常
- 下载统计正常

---

### P4 - 增强功能

#### P4.1 热门推荐模块 (1.5天)

**任务清单**:

**P4.1.1 推荐实体定义 (0.2天)**
- [ ] 创建HotRecommendation实体
- [ ] 创建RecommendationCategory实体
- [ ] 创建MusicPlayStat实体(播放统计)
- [ ] 创建UserMusicLike实体(用户点赞)

**P4.1.2 RecommendationService实现 (0.6天)**
- [ ] 实现推荐服务
  ```typescript
  // modules/hot-recommendation/hot-recommendation.service.ts
  @Injectable()
  export class HotRecommendationService {
    async getHotMusicList(category: string, page: number, pageSize: number) {
      // 优先从Redis缓存获取
      const cacheKey = `hot:music:list:${category}:${page}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
      
      // 从数据库查询
      const [items, total] = await this.recommendationRepository.findAndCount({
        where: {
          category,
          isActive: true,
        },
        order: {
          sortOrder: 'ASC',
          playCount: 'DESC',
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
      
      const result = { items, total, page, pageSize };
      
      // 写入缓存(30分钟)
      await this.redis.setex(cacheKey, 1800, JSON.stringify(result));
      
      return result;
    }
    
    async trackPlay(musicId: number, userId?: number): Promise<void> {
      // 记录播放统计
    }
    
    async toggleLike(musicId: number, userId: number): Promise<boolean> {
      // 点赞/取消点赞
    }
  }
  ```

**P4.1.3 推荐Controller实现 (0.3天)**
- [ ] 实现API端点

**P4.1.4 缓存预热和更新 (0.4天)**
- [ ] 实现定时任务刷新缓存
  ```bash
  npm install @nestjs/schedule
  ```
  ```typescript
  @Cron('0 */30 * * * *') // 每30分钟
  async warmupCache() {
    const categories = await this.categoryService.getAll();
    for (const category of categories) {
      await this.getHotMusicList(category.code, 1, 20);
    }
  }
  ```

**验收标准**:
- 推荐列表查询正常
- 缓存正常工作
- 播放统计正常
- 点赞功能正常
- 缓存预热正常

---

#### P4.2 素材管理模块 (1天)

**任务清单**:

**P4.2.1 Banner管理 (0.4天)**
- [ ] 创建Banner实体
- [ ] 实现BannerService
- [ ] 实现BannerController
- [ ] 实现Banner缓存策略

**P4.2.2 提示词模板管理 (0.6天)**
- [ ] 创建PromptTemplate实体
- [ ] 实现TemplateService
- [ ] 实现TemplateController
- [ ] 创建默认提示词种子数据
  ```sql
  INSERT INTO t_prompt_templates (category, title, content, tags, is_active) VALUES
  ('风格', '流行风格', '创作一首流行风格的歌词...', 'pop,流行', 1),
  ('风格', '摇滚风格', '创作一首摇滚风格的歌词...', 'rock,摇滚', 1),
  ('情绪', '欢快', '创作一首欢快的歌词...', 'happy,欢快', 1),
  ('情绪', '忧伤', '创作一首忧伤的歌词...', 'sad,忧伤', 1),
  ('主题', '夏日海滩', '创作一首关于夏日海滩的歌词...', 'summer,beach', 1),
  ('主题', '青春校园', '创作一首关于青春校园的歌词...', 'youth,campus', 1);
  ```

**验收标准**:
- Banner列表正常显示
- Banner缓存正常
- 提示词模板可正常使用
- 模板分类正常

---

#### P4.3 用户互动功能 (1天)

**任务清单**:

**P4.3.1 签到功能 (0.4天)**
- [ ] 创建签到实体
- [ ] 实现签到Service
- [ ] 实现签到奖励(连续签到额外奖励)

**P4.3.2 分享奖励 (0.3天)**
- [ ] 实现分享追踪
- [ ] 实现分享奖励发放

**P4.3.3 反馈收集 (0.3天)**
- [ ] 创建反馈实体
- [ ] 实现反馈Service和Controller

**验收标准**:
- 签到正常,奖励正常发放
- 分享奖励正常
- 反馈可正常提交

---

#### P4.4 统计分析 (0.5天)

**任务清单**:
- [ ] P4.4.1 创建MetricsService
- [ ] P4.4.2 实现数据埋点
- [ ] P4.4.3 实现统计API(用户数、创作数、收入等)
- [ ] P4.4.4 实现管理后台统计看板

**验收标准**:
- 统计数据准确
- 统计API正常

---

### P5 - 部署与运维

#### P5.1 Docker容器化 (0.8天)

**任务清单**:
- [ ] P5.1.1 编写Dockerfile(参考架构文档)
- [ ] P5.1.2 编写docker-compose.yml(参考架构文档)
- [ ] P5.1.3 配置.dockerignore
- [ ] P5.1.4 镜像构建和测试
- [ ] P5.1.5 优化镜像大小(多阶段构建)

**验收标准**:
- Docker镜像构建成功
- 容器可正常运行
- docker-compose一键启动正常

---

#### P5.2 监控告警系统 (0.8天)

**任务清单**:
- [ ] P5.2.1 集成Prometheus
  ```bash
  npm install @willsoto/nestjs-prometheus prom-client
  ```
- [ ] P5.2.2 配置Grafana看板
- [ ] P5.2.3 配置告警规则
- [ ] P5.2.4 集成钉钉/企业微信告警

**验收标准**:
- 指标正常采集
- Grafana看板正常显示
- 告警正常触发和通知

---

#### P5.3 CI/CD流水线 (0.7天)

**任务清单**:
- [ ] P5.3.1 编写GitHub Actions配置(参考架构文档)
- [ ] P5.3.2 配置自动化测试
- [ ] P5.3.3 配置自动化部署
- [ ] P5.3.4 配置自动化构建镜像

**验收标准**:
- 代码push自动触发CI
- 测试自动运行
- 镜像自动构建和推送
- 自动部署到服务器

---

#### P5.4 性能优化 (0.7天)

**任务清单**:
- [ ] P5.4.1 数据库索引优化(执行架构文档中的索引SQL)
- [ ] P5.4.2 数据库查询优化(N+1问题排查)
- [ ] P5.4.3 缓存优化(缓存命中率监控)
- [ ] P5.4.4 API性能测试(Artillery)
- [ ] P5.4.5 慢查询优化

**验收标准**:
- API响应时间P95 < 200ms
- 数据库慢查询<1%
- 缓存命中率>80%

---

## 5. 里程碑与时间表

### 里程碑概览

| 里程碑 | 目标 | 完成标志 | 预计完成时间 |
|--------|------|---------|-------------|
| M0 - 项目初始化 | 环境搭建完成 | P0完成,可启动项目 | Day 3 |
| M1 - MVP可用 | 核心功能可用 | P0+P1完成,用户可登录并生成歌词 | Day 10 |
| M2 - 核心功能完整 | 音乐生成可用 | +P2完成,用户可生成音乐 | Day 15 |
| M3 - 功能完善 | 作品管理完整 | +P3完成,用户可管理作品 | Day 19 |
| M4 - 功能增强 | 运营功能就绪 | +P4完成,推荐/素材/互动可用 | Day 24 |
| M5 - 生产就绪 | 可上线生产 | +P5完成,监控/部署就绪 | Day 27 |

### 详细时间表

```
Week 1 (Day 1-5):
- Day 1-3: P0 基础设施搭建
- Day 4-5: P1.1-P1.2 用户认证+用户管理

Week 2 (Day 6-10):
- Day 6-7: P1.3 AI歌词生成
- Day 8-10: P1.4 点数系统
→ M1里程碑: MVP可用

Week 3 (Day 11-15):
- Day 11: P2.1 Bull队列
- Day 12-13: P2.2 音乐任务
- Day 14-15: P2.3 Suno集成
→ M2里程碑: 核心功能完整

Week 4 (Day 16-19):
- Day 16-17: P3.1-P3.2 OSS+文件上传
- Day 18-19: P3.3-P3.4 作品管理+分享下载
→ M3里程碑: 功能完善

Week 5 (Day 20-24):
- Day 20-21: P4.1 热门推荐
- Day 22: P4.2 素材管理
- Day 23: P4.3 用户互动
- Day 24: P4.4 统计分析
→ M4里程碑: 功能增强

Week 6 (Day 25-27):
- Day 25: P5.1-P5.2 Docker+监控
- Day 26: P5.3 CI/CD
- Day 27: P5.4 性能优化
→ M5里程碑: 生产就绪
```

---

## 6. 风险管理

### 6.1 技术风险

| 风险项 | 影响 | 概率 | 应对策略 |
|--------|------|------|---------|
| Gemini API不稳定 | 高 | 中 | 1.实现重试机制 2.准备备用AI服务 3.降级方案 |
| Suno API调用失败 | 高 | 中 | 1.完善错误处理 2.自动退款机制 3.任务重试 |
| 数据库性能瓶颈 | 中 | 低 | 1.索引优化 2.查询优化 3.读写分离 |
| Redis故障 | 中 | 低 | 1.主从复制 2.降级到数据库 3.监控告警 |
| OSS存储成本 | 中 | 中 | 1.设置生命周期策略 2.压缩优化 3.CDN加速 |

### 6.2 业务风险

| 风险项 | 影响 | 概率 | 应对策略 |
|--------|------|------|---------|
| 用户点数滥用 | 高 | 中 | 1.频率限制 2.异常检测 3.封禁机制 |
| 生成内容审核 | 高 | 高 | 1.内容审核机制 2.关键词过滤 3.人工审核 |
| 版权问题 | 高 | 中 | 1.用户协议声明 2.生成内容加水印 3.法律咨询 |

### 6.3 项目风险

| 风险项 | 影响 | 概率 | 应对策略 |
|--------|------|------|---------|
| 进度延期 | 中 | 中 | 1.优先级管理 2.MVP优先 3.功能裁剪 |
| 人员不足 | 高 | 低 | 1.外包支持 2.降低质量标准 3.延长工期 |
| 需求变更 | 中 | 高 | 1.需求冻结机制 2.变更评审 3.迭代调整 |

---

## 7. 质量保证

### 7.1 代码质量

- **代码审查**: 关键代码必须经过审查
- **单元测试**: 核心模块覆盖率≥80%
- **集成测试**: E2E测试覆盖核心流程
- **代码规范**: ESLint + Prettier强制检查
- **圈复杂度**: 单个函数圈复杂度≤15

### 7.2 性能指标

- **API响应时间**: P95 < 200ms, P99 < 500ms
- **数据库查询**: 慢查询占比 < 1%
- **缓存命中率**: > 80%
- **系统可用性**: ≥99.5%
- **错误率**: < 0.1%

### 7.3 安全检查

- **依赖扫描**: 定期扫描依赖漏洞(npm audit)
- **SQL注入**: 100%使用参数化查询
- **XSS防护**: 所有用户输入过滤
- **CSRF防护**: 关键操作CSRF token
- **频率限制**: 所有API添加频率限制
- **敏感信息**: 环境变量管理,不硬编码

### 7.4 测试策略

**单元测试**:
- Service层业务逻辑
- 工具函数
- 数据转换

**集成测试**:
- API端点
- 数据库操作
- 外部服务集成

**性能测试**:
- 负载测试(Artillery)
- 压力测试
- 并发测试

**安全测试**:
- SQL注入测试
- XSS测试
- 权限测试

---

## 8. 附录

### 8.1 参考文档

- [后端系统架构设计文档](./BACKEND_ARCHITECTURE_DESIGN.md)
- [技术架构详细设计文档](./TECHNICAL_ARCHITECTURE.md)
- [API文档与测试规范](./API_DOCUMENTATION.md)
- [第二阶段完成总结](./PHASE2_SUMMARY.md)
- [第三阶段完成总结](./PHASE3_SUMMARY.md)

### 8.2 环境要求

**开发环境**:
- Node.js 18+
- MySQL 8.0+
- Redis 7.0+
- Git 2.30+

**生产环境**:
- 云服务器 2C4G起
- MySQL云数据库
- Redis云缓存
- 阿里云OSS
- CDN加速

### 8.3 团队协作

**Git分支策略**:
- `main`: 生产分支
- `develop`: 开发分支
- `feature/*`: 功能分支
- `hotfix/*`: 紧急修复分支

**提交规范**:
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具
```

**Code Review规范**:
- 所有代码合并前必须经过Review
- Review重点:业务逻辑、性能、安全、规范
- Review时间:24小时内完成

---

## 📋 总结

本开发计划详细拆分了AI音乐创作助手后端系统的全部开发任务,按照P0-P5五个阶段循序渐进,每个阶段都有明确的目标、任务清单和验收标准。

**关键特点**:
1. ✅ **详细拆分**: 任务拆分到0.5天粒度,每个任务都有具体的技术实现
2. ✅ **优先级管理**: P0-P5明确优先级,MVP优先,循序渐进
3. ✅ **里程碑清晰**: 5个关键里程碑,每个都有明确的完成标志
4. ✅ **风险可控**: 识别技术/业务/项目风险,并提供应对策略
5. ✅ **质量保证**: 明确的代码质量、性能、安全标准

**预估工期**: 20-27个工作日(约4-5.5周)

**下一步**:
开始执行P0阶段 - 基础设施搭建

---

**文档版本**: v1.0  
**最后更新**: 2024年  
**文档维护**: 随开发进度持续更新

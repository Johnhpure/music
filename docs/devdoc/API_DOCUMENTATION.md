# AI音乐创作助手 - API文档与测试规范

> **版本**: v1.0  
> **创建时间**: 2024年  
> **项目名称**: AI音乐创作助手  
> **阶段**: 第三阶段 - API文档与测试

---

## 📋 目录

- [1. Swagger/OpenAPI规范](#1-swaggeropenapi规范)
- [2. API测试用例](#2-api测试用例)
- [3. Mock数据定义](#3-mock数据定义)
- [4. Postman集合](#4-postman集合)

---

## 1. Swagger/OpenAPI规范

### 1.1 OpenAPI文档配置

#### 1.1.1 Nest.js中集成Swagger

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger配置
  const config = new DocumentBuilder()
    .setTitle('AI音乐创作助手 API')
    .setDescription('AI驱动的音乐创作平台后端API文档')
    .setVersion('1.0.0')
    .setContact(
      'API Support',
      'https://music.example.com',
      'support@example.com'
    )
    .addServer('http://localhost:3000', '开发环境')
    .addServer('https://api.music.example.com', '生产环境')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: '请输入JWT Token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', '用户认证相关接口')
    .addTag('User', '用户管理相关接口')
    .addTag('AI', 'AI服务相关接口')
    .addTag('Music', '音乐生成相关接口')
    .addTag('Work', '作品管理相关接口')
    .addTag('Credit', '点数系统相关接口')
    .addTag('Material', '素材管理相关接口')
    .addTag('Recommendation', '热门推荐相关接口')
    .addTag('File', '文件管理相关接口')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // 访问路径: http://localhost:3000/api-docs
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 保持认证状态
      docExpansion: 'none',        // 默认折叠所有接口
      filter: true,                // 启用搜索过滤
      showRequestDuration: true,   // 显示请求耗时
    },
    customSiteTitle: 'AI音乐创作助手 API文档',
  });

  await app.listen(3000);
  console.log(`API文档地址: http://localhost:3000/api-docs`);
}
bootstrap();
```

---

### 1.2 DTO装饰器示例

#### 1.2.1 认证相关DTO

```typescript
// dto/wechat-auth.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class WechatAuthDto {
  @ApiProperty({
    description: '微信登录临时code',
    example: '0a1b2c3d4e5f',
    required: true,
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: '用户昵称',
    example: '音乐创作者',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  nickName?: string;

  @ApiProperty({
    description: '用户头像URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({
    description: '手机号授权code',
    example: 'phone_auth_code_123',
    required: false,
  })
  @IsOptional()
  @IsString()
  phoneCode?: string;
}

// dto/auth-response.dto.ts
export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: '用户信息',
    type: 'object',
  })
  userInfo: {
    id: number;
    openid: string;
    nickName: string;
    avatarUrl: string;
    phone: string;
    hasPhone: boolean;
    creditBalance: number;
    worksCount: number;
    createdAt: string;
  };
}
```

---

#### 1.2.2 AI歌词生成DTO

```typescript
// dto/generate-lyrics.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsInt, IsOptional, MaxLength, Min, Max } from 'class-validator';

export enum MusicStyle {
  POP = 'pop',
  ROCK = 'rock',
  FOLK = 'folk',
  ELECTRONIC = 'electronic',
  RNB = 'rnb',
  HIPHOP = 'hiphop',
  CLASSICAL = 'classical',
  JAZZ = 'jazz',
}

export enum Mood {
  HAPPY = 'happy',
  SAD = 'sad',
  ROMANTIC = 'romantic',
  CALM = 'calm',
  EXCITED = 'excited',
  NOSTALGIC = 'nostalgic',
}

export class GenerateLyricsDto {
  @ApiProperty({
    description: '创作主题/提示词',
    example: '一首关于夏日海边的轻快歌曲',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  theme: string;

  @ApiProperty({
    description: '音乐风格',
    enum: MusicStyle,
    example: MusicStyle.POP,
    required: false,
  })
  @IsOptional()
  @IsEnum(MusicStyle)
  style?: MusicStyle;

  @ApiProperty({
    description: '情绪',
    enum: Mood,
    example: Mood.HAPPY,
    required: false,
  })
  @IsOptional()
  @IsEnum(Mood)
  mood?: Mood;

  @ApiProperty({
    description: '语言',
    example: 'chinese',
    default: 'chinese',
    required: false,
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    description: '生成版本数量',
    example: 2,
    minimum: 1,
    maximum: 5,
    default: 2,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  versionsCount?: number;

  @ApiProperty({
    description: '额外要求',
    example: '请创作一首完整的歌曲，包含主歌和副歌结构',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  additionalRequirements?: string;
}

// dto/lyrics-response.dto.ts
export class LyricsVersionDto {
  @ApiProperty({ description: '版本号', example: 1 })
  versionNumber: number;

  @ApiProperty({ description: '歌曲标题', example: '夏日海滩' })
  title: string;

  @ApiProperty({
    description: '歌词内容',
    example: '主歌:\n阳光洒在沙滩上...\n\n副歌:\n让我们一起摇摆...',
  })
  lyrics: string;

  @ApiProperty({ description: '字数', example: 320 })
  wordCount: number;
}

export class GenerateLyricsResponseDto {
  @ApiProperty({ description: '请求ID', example: 'lyric_20240115_abc123' })
  requestId: string;

  @ApiProperty({
    description: '生成的歌词版本',
    type: [LyricsVersionDto],
  })
  versions: LyricsVersionDto[];

  @ApiProperty({ description: '消耗点数', example: 10 })
  costCredits: number;

  @ApiProperty({ description: '剩余点数', example: 310 })
  remainingCredits: number;

  @ApiProperty({ description: '创建时间', example: '2024-01-15T10:40:00.000Z' })
  createdAt: string;
}
```

---

### 1.3 Controller装饰器示例

#### 1.3.1 认证Controller

```typescript
// auth.controller.ts
import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { WechatAuthDto, AuthResponseDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('wechat-auth')
  @ApiOperation({
    summary: '微信小程序授权登录',
    description: '使用微信临时code进行授权登录，支持获取手机号',
  })
  @ApiBody({ type: WechatAuthDto })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    type: AuthResponseDto,
    schema: {
      example: {
        code: 200,
        message: '登录成功',
        data: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          userInfo: {
            id: 1,
            openid: 'o6_bmjrPTlm6_2sgVt7hMZOPfL2M',
            nickName: '音乐创作者',
            avatarUrl: 'https://...',
            phone: '138****5678',
            hasPhone: true,
            creditBalance: 320,
            worksCount: 5,
            createdAt: '2024-01-01T00:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '参数错误',
    schema: {
      example: {
        code: 400,
        message: 'code参数不能为空',
        error: 'BAD_REQUEST',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '微信授权失败',
    schema: {
      example: {
        code: 401,
        message: '微信授权失败，请重试',
        error: 'WECHAT_AUTH_FAILED',
      },
    },
  })
  async wechatAuth(@Body() dto: WechatAuthDto) {
    return await this.authService.wechatAuth(dto);
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '检查登录状态',
    description: '验证当前Token是否有效',
  })
  @ApiResponse({
    status: 200,
    description: '已登录',
    schema: {
      example: {
        code: 200,
        message: '已登录',
        data: {
          isLoggedIn: true,
          user: {
            id: 1,
            nickName: '音乐创作者',
            creditBalance: 320,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token无效或已过期',
  })
  async checkLoginState() {
    return await this.authService.checkLoginState();
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '退出登录',
    description: '清除用户Session和Token',
  })
  @ApiResponse({
    status: 200,
    description: '退出成功',
  })
  async logout() {
    return await this.authService.logout();
  }
}
```

---

#### 1.3.2 AI服务Controller

```typescript
// ai.controller.ts
import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AIService } from './ai.service';
import { GenerateLyricsDto, GenerateLyricsResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('AI')
@Controller('api/ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('lyrics/generate')
  @ApiOperation({
    summary: '生成AI歌词',
    description: '基于用户提示词，使用Gemini API生成多个版本的歌词',
  })
  @ApiResponse({
    status: 200,
    description: '生成成功',
    type: GenerateLyricsResponseDto,
  })
  @ApiResponse({
    status: 402,
    description: '点数不足',
    schema: {
      example: {
        code: 402,
        message: '点数不足，请先充值',
        error: 'INSUFFICIENT_CREDITS',
      },
    },
  })
  @ApiResponse({
    status: 422,
    description: '业务逻辑错误',
    schema: {
      example: {
        code: 422,
        message: '提示词不能为空',
        error: 'VALIDATION_ERROR',
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'AI服务不可用',
    schema: {
      example: {
        code: 503,
        message: 'AI服务暂时不可用，请稍后重试',
        error: 'GEMINI_API_UNAVAILABLE',
      },
    },
  })
  async generateLyrics(
    @CurrentUser() user: any,
    @Body() dto: GenerateLyricsDto,
  ) {
    return await this.aiService.generateLyrics(user.id, dto);
  }

  @Get('lyrics/history')
  @ApiOperation({
    summary: '获取歌词生成历史',
    description: '分页查询用户的歌词生成历史记录',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '页码',
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: '每页数量',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    schema: {
      example: {
        code: 200,
        data: {
          items: [
            {
              requestId: 'lyric_20240115_abc123',
              theme: '夏日海滩',
              versionsCount: 2,
              createdAt: '2024-01-15T10:40:00.000Z',
            },
          ],
          total: 12,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        },
      },
    },
  })
  async getLyricsHistory(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
  ) {
    return await this.aiService.getLyricsHistory(user.id, { page, pageSize });
  }
}
```

---

### 1.4 完整的OpenAPI JSON导出

```typescript
// 导出OpenAPI JSON文件
import { writeFileSync } from 'fs';

async function generateOpenAPISpec() {
  const app = await NestFactory.create(AppModule);
  
  const config = new DocumentBuilder()
    .setTitle('AI音乐创作助手 API')
    .setVersion('1.0.0')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  
  // 导出为JSON文件
  writeFileSync('./openapi.json', JSON.stringify(document, null, 2));
  
  console.log('OpenAPI规范已导出到 openapi.json');
  
  await app.close();
}

generateOpenAPISpec();
```

---

## 2. API测试用例

### 2.1 Jest单元测试

#### 2.1.1 Auth Service测试

```typescript
// auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { WechatService } from './wechat.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userService: UserService;
  let wechatService: WechatService;

  const mockUser = {
    id: 1,
    openid: 'test_openid',
    nickName: '测试用户',
    avatarUrl: 'https://example.com/avatar.jpg',
    creditBalance: 320,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test_token'),
            verify: jest.fn().mockReturnValue({ userId: 1 }),
          },
        },
        {
          provide: UserService,
          useValue: {
            findByOpenid: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: WechatService,
          useValue: {
            getOpenidByCode: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
    wechatService = module.get<WechatService>(WechatService);
  });

  describe('wechatAuth', () => {
    it('应该成功登录已存在的用户', async () => {
      // Arrange
      const dto = {
        code: 'test_code',
        nickName: '测试用户',
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      jest.spyOn(wechatService, 'getOpenidByCode').mockResolvedValue({
        openid: 'test_openid',
        session_key: 'test_session_key',
      });

      jest.spyOn(userService, 'findByOpenid').mockResolvedValue(mockUser);

      // Act
      const result = await service.wechatAuth(dto);

      // Assert
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('userInfo');
      expect(result.userInfo.id).toBe(1);
      expect(wechatService.getOpenidByCode).toHaveBeenCalledWith('test_code');
      expect(userService.findByOpenid).toHaveBeenCalledWith('test_openid');
    });

    it('应该为新用户创建账号并登录', async () => {
      // Arrange
      const dto = {
        code: 'test_code',
        nickName: '新用户',
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      jest.spyOn(wechatService, 'getOpenidByCode').mockResolvedValue({
        openid: 'new_openid',
        session_key: 'test_session_key',
      });

      jest.spyOn(userService, 'findByOpenid').mockResolvedValue(null);
      jest.spyOn(userService, 'create').mockResolvedValue({
        id: 2,
        openid: 'new_openid',
        nickName: '新用户',
        avatarUrl: 'https://example.com/avatar.jpg',
        creditBalance: 100, // 初始赠送100点
      });

      // Act
      const result = await service.wechatAuth(dto);

      // Assert
      expect(result.userInfo.id).toBe(2);
      expect(result.userInfo.creditBalance).toBe(100);
      expect(userService.create).toHaveBeenCalledWith({
        openid: 'new_openid',
        nickName: '新用户',
        avatarUrl: 'https://example.com/avatar.jpg',
      });
    });

    it('微信授权失败时应抛出异常', async () => {
      // Arrange
      const dto = { code: 'invalid_code' };

      jest.spyOn(wechatService, 'getOpenidByCode').mockRejectedValue(
        new Error('微信授权失败'),
      );

      // Act & Assert
      await expect(service.wechatAuth(dto)).rejects.toThrow('微信授权失败');
    });
  });
});
```

---

#### 2.1.2 AI Service测试

```typescript
// ai.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AIService } from './ai.service';
import { CreditService } from '../credit/credit.service';
import { GeminiService } from './gemini.service';

describe('AIService', () => {
  let service: AIService;
  let creditService: CreditService;
  let geminiService: GeminiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        {
          provide: CreditService,
          useValue: {
            getBalance: jest.fn(),
            consume: jest.fn(),
          },
        },
        {
          provide: GeminiService,
          useValue: {
            generateLyrics: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AIService>(AIService);
    creditService = module.get<CreditService>(CreditService);
    geminiService = module.get<GeminiService>(GeminiService);
  });

  describe('generateLyrics', () => {
    it('应该成功生成歌词', async () => {
      // Arrange
      const userId = 1;
      const dto = {
        theme: '夏日海滩',
        style: 'pop',
        mood: 'happy',
        versionsCount: 2,
      };

      jest.spyOn(creditService, 'getBalance').mockResolvedValue(100);
      jest.spyOn(creditService, 'consume').mockResolvedValue({
        balanceBefore: 100,
        balanceAfter: 90,
        amount: -10,
      });
      jest.spyOn(geminiService, 'generateLyrics').mockResolvedValue({
        versions: [
          {
            versionNumber: 1,
            title: '夏日海滩',
            lyrics: '主歌:\n阳光洒在沙滩上...',
            wordCount: 320,
          },
          {
            versionNumber: 2,
            title: '海边的记忆',
            lyrics: '主歌:\n海浪轻轻拍打着礁石...',
            wordCount: 315,
          },
        ],
      });

      // Act
      const result = await service.generateLyrics(userId, dto);

      // Assert
      expect(result).toHaveProperty('requestId');
      expect(result.versions).toHaveLength(2);
      expect(result.costCredits).toBe(10);
      expect(result.remainingCredits).toBe(90);
      expect(creditService.consume).toHaveBeenCalledWith(
        userId,
        10,
        'AI歌词生成',
      );
    });

    it('点数不足时应抛出异常', async () => {
      // Arrange
      const userId = 1;
      const dto = { theme: '夏日海滩' };

      jest.spyOn(creditService, 'getBalance').mockResolvedValue(5);

      // Act & Assert
      await expect(service.generateLyrics(userId, dto)).rejects.toThrow(
        '点数不足',
      );
    });
  });
});
```

---

### 2.2 E2E集成测试

#### 2.2.1 认证流程E2E测试

```typescript
// test/auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/auth/wechat-auth (POST)', () => {
    it('应该成功登录并返回token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/wechat-auth')
        .send({
          code: 'test_code_123',
          nickName: '测试用户',
          avatarUrl: 'https://example.com/avatar.jpg',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toHaveProperty('token');
          expect(res.body.data).toHaveProperty('userInfo');
          expect(res.body.data.userInfo).toHaveProperty('id');
          expect(res.body.data.userInfo).toHaveProperty('openid');
          
          // 保存token供后续测试使用
          authToken = res.body.data.token;
        });
    });

    it('缺少code参数时应返回400错误', () => {
      return request(app.getHttpServer())
        .post('/api/auth/wechat-auth')
        .send({
          nickName: '测试用户',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.code).toBe(400);
          expect(res.body.message).toContain('code');
        });
    });
  });

  describe('/api/auth/check (GET)', () => {
    it('有效token应返回用户信息', () => {
      return request(app.getHttpServer())
        .get('/api/auth/check')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.isLoggedIn).toBe(true);
          expect(res.body.data.user).toHaveProperty('id');
        });
    });

    it('无token应返回401错误', () => {
      return request(app.getHttpServer())
        .get('/api/auth/check')
        .expect(401);
    });

    it('无效token应返回401错误', () => {
      return request(app.getHttpServer())
        .get('/api/auth/check')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });
  });
});
```

---

#### 2.2.2 AI歌词生成E2E测试

```typescript
// test/ai.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AI Lyrics Generation (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 先登录获取token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/wechat-auth')
      .send({
        code: 'test_code',
        nickName: '测试用户',
      });
    
    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/ai/lyrics/generate (POST)', () => {
    it('应该成功生成歌词', () => {
      return request(app.getHttpServer())
        .post('/api/ai/lyrics/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          theme: '一首关于夏日海边的轻快歌曲',
          style: 'pop',
          mood: 'happy',
          language: 'chinese',
          versionsCount: 2,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toHaveProperty('requestId');
          expect(res.body.data.versions).toHaveLength(2);
          expect(res.body.data.costCredits).toBe(10);
          expect(res.body.data).toHaveProperty('remainingCredits');
        });
    }, 30000); // 30秒超时

    it('theme为空时应返回422错误', () => {
      return request(app.getHttpServer())
        .post('/api/ai/lyrics/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          style: 'pop',
        })
        .expect(422);
    });

    it('未登录时应返回401错误', () => {
      return request(app.getHttpServer())
        .post('/api/ai/lyrics/generate')
        .send({
          theme: '测试主题',
        })
        .expect(401);
    });
  });

  describe('/api/ai/lyrics/history (GET)', () => {
    it('应该返回历史记录列表', () => {
      return request(app.getHttpServer())
        .get('/api/ai/lyrics/history')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, pageSize: 20 })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('items');
          expect(res.body.data).toHaveProperty('total');
          expect(res.body.data).toHaveProperty('page');
          expect(res.body.data).toHaveProperty('pageSize');
        });
    });
  });
});
```

---

### 2.3 性能测试

#### 2.3.1 使用Artillery进行负载测试

```yaml
# artillery-config.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10  # 每秒10个请求
      name: "Warm up"
    - duration: 120
      arrivalRate: 50  # 每秒50个请求
      name: "Load test"
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  # 测试登录接口
  - name: "Login Flow"
    weight: 30
    flow:
      - post:
          url: "/api/auth/wechat-auth"
          json:
            code: "test_code_{{ $randomNumber() }}"
            nickName: "测试用户{{ $randomNumber() }}"
          capture:
            - json: "$.data.token"
              as: "authToken"
      
      - get:
          url: "/api/auth/check"
          headers:
            Authorization: "Bearer {{ authToken }}"

  # 测试获取热门推荐
  - name: "Get Hot Recommendations"
    weight: 50
    flow:
      - get:
          url: "/api/hot-recommendation/list"
          qs:
            page: 1
            pageSize: 20

  # 测试AI歌词生成
  - name: "Generate Lyrics"
    weight: 20
    beforeRequest: "loginFirst"
    flow:
      - post:
          url: "/api/ai/lyrics/generate"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            theme: "测试主题{{ $randomString() }}"
            style: "pop"
            versionsCount: 2
```

运行负载测试：
```bash
# 安装Artillery
npm install -g artillery

# 运行测试
artillery run artillery-config.yml

# 生成HTML报告
artillery run --output report.json artillery-config.yml
artillery report report.json
```

---

## 3. Mock数据定义

### 3.1 Mock数据生成器

```typescript
// test/mocks/data-generator.ts
import { faker } from '@faker-js/faker/locale/zh_CN';

/**
 * Mock用户数据
 */
export class MockUserGenerator {
  static generateUser(overrides?: Partial<any>) {
    return {
      id: faker.number.int({ min: 1, max: 10000 }),
      openid: `o6_bmjrPT${faker.string.alphanumeric(20)}`,
      nickName: faker.person.fullName(),
      avatarUrl: faker.image.avatar(),
      phone: faker.phone.number('138########'),
      creditBalance: faker.number.int({ min: 0, max: 1000 }),
      worksCount: faker.number.int({ min: 0, max: 50 }),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides,
    };
  }

  static generateUsers(count: number) {
    return Array.from({ length: count }, () => this.generateUser());
  }
}

/**
 * Mock歌词数据
 */
export class MockLyricsGenerator {
  static generateLyrics(overrides?: Partial<any>) {
    return {
      requestId: `lyric_${faker.date.recent().getTime()}_${faker.string.alphanumeric(6)}`,
      theme: faker.lorem.sentence(),
      versions: [
        {
          versionNumber: 1,
          title: faker.music.songName(),
          lyrics: this.generateLyricsContent(),
          wordCount: faker.number.int({ min: 200, max: 500 }),
        },
        {
          versionNumber: 2,
          title: faker.music.songName(),
          lyrics: this.generateLyricsContent(),
          wordCount: faker.number.int({ min: 200, max: 500 }),
        },
      ],
      costCredits: 10,
      remainingCredits: faker.number.int({ min: 0, max: 1000 }),
      createdAt: faker.date.recent().toISOString(),
      ...overrides,
    };
  }

  private static generateLyricsContent() {
    return `主歌:
${faker.lorem.lines(4)}

副歌:
${faker.lorem.lines(4)}

主歌:
${faker.lorem.lines(4)}

副歌:
${faker.lorem.lines(4)}`;
  }
}

/**
 * Mock音乐任务数据
 */
export class MockMusicTaskGenerator {
  static generateMusicTask(overrides?: Partial<any>) {
    const statuses = ['pending', 'processing', 'completed', 'failed'];
    const status = faker.helpers.arrayElement(statuses);

    return {
      taskId: `music_task_${faker.date.recent().getTime()}_${faker.string.alphanumeric(6)}`,
      userId: faker.number.int({ min: 1, max: 10000 }),
      title: faker.music.songName(),
      lyrics: MockLyricsGenerator.generateLyrics().versions[0].lyrics,
      style: faker.helpers.arrayElement(['pop', 'rock', 'folk', 'electronic']),
      voiceGender: faker.helpers.arrayElement(['male', 'female', 'neutral']),
      status,
      progress: status === 'completed' ? 100 : faker.number.int({ min: 0, max: 90 }),
      audioUrl: status === 'completed' ? faker.internet.url() + '/music.mp3' : null,
      coverUrl: status === 'completed' ? faker.image.url() : null,
      duration: status === 'completed' ? `${faker.number.int({ min: 2, max: 5 })}:${faker.number.int({ min: 0, max: 59 }).toString().padStart(2, '0')}` : null,
      costCredits: 20,
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      completedAt: status === 'completed' ? faker.date.recent().toISOString() : null,
      ...overrides,
    };
  }

  static generateMusicTasks(count: number) {
    return Array.from({ length: count }, () => this.generateMusicTask());
  }
}

/**
 * Mock作品数据
 */
export class MockWorkGenerator {
  static generateWork(overrides?: Partial<any>) {
    return {
      id: faker.number.int({ min: 1, max: 10000 }),
      userId: faker.number.int({ min: 1, max: 1000 }),
      title: faker.music.songName(),
      lyrics: MockLyricsGenerator.generateLyrics().versions[0].lyrics,
      audioUrl: faker.internet.url() + '/music.mp3',
      coverUrl: faker.image.url(),
      duration: `${faker.number.int({ min: 2, max: 5 })}:${faker.number.int({ min: 0, max: 59 }).toString().padStart(2, '0')}`,
      genre: faker.helpers.arrayElement(['流行', '电子', '民谣', '摇滚']),
      style: faker.helpers.arrayElement(['pop', 'rock', 'folk', 'electronic']),
      voiceGender: faker.helpers.arrayElement(['male', 'female', 'neutral']),
      visibility: faker.helpers.arrayElement(['public', 'private']),
      playCount: faker.number.int({ min: 0, max: 10000 }),
      likeCount: faker.number.int({ min: 0, max: 1000 }),
      shareCount: faker.number.int({ min: 0, max: 500 }),
      downloadCount: faker.number.int({ min: 0, max: 300 }),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides,
    };
  }

  static generateWorks(count: number) {
    return Array.from({ length: count }, () => this.generateWork());
  }
}

/**
 * Mock热门推荐数据
 */
export class MockRecommendationGenerator {
  static generateRecommendation(overrides?: Partial<any>) {
    return {
      id: faker.number.int({ min: 1, max: 1000 }),
      title: faker.music.songName(),
      artist: faker.person.fullName(),
      genre: faker.helpers.arrayElement(['流行', '电子', '民谣', '摇滚', '古典', '爵士']),
      duration: `${faker.number.int({ min: 2, max: 5 })}:${faker.number.int({ min: 0, max: 59 }).toString().padStart(2, '0')}`,
      coverUrl: faker.image.url(),
      audioUrl: faker.internet.url() + '/music.mp3',
      tags: faker.helpers.arrayElements(['欢快', '舒缓', '励志', '浪漫', '怀旧'], 2),
      category: faker.helpers.arrayElement(['流行', '电子', '民谣', '摇滚']),
      playCount: faker.number.int({ min: 0, max: 100000 }),
      likeCount: faker.number.int({ min: 0, max: 10000 }),
      isHot: faker.datatype.boolean(),
      sortOrder: faker.number.int({ min: 1, max: 100 }),
      isActive: true,
      createdAt: faker.date.past().toISOString(),
      ...overrides,
    };
  }

  static generateRecommendations(count: number) {
    return Array.from({ length: count }, () => this.generateRecommendation());
  }
}

/**
 * Mock点数记录数据
 */
export class MockCreditLogGenerator {
  static generateCreditLog(overrides?: Partial<any>) {
    const type = faker.helpers.arrayElement(['earn', 'spend']);
    const amount = type === 'earn' 
      ? faker.number.int({ min: 5, max: 100 })
      : -faker.number.int({ min: 10, max: 50 });
    const balanceBefore = faker.number.int({ min: 0, max: 1000 });

    return {
      id: faker.number.int({ min: 1, max: 100000 }),
      userId: faker.number.int({ min: 1, max: 1000 }),
      type,
      amount,
      description: type === 'earn' ? '每日签到' : 'AI歌词生成',
      balanceBefore,
      balanceAfter: balanceBefore + amount,
      relatedId: faker.string.alphanumeric(20),
      relatedType: type === 'earn' ? 'checkin' : 'lyrics_generation',
      createdAt: faker.date.recent().toISOString(),
      ...overrides,
    };
  }

  static generateCreditLogs(count: number) {
    return Array.from({ length: count }, () => this.generateCreditLog());
  }
}
```

---

### 3.2 Mock API响应示例

```typescript
// test/mocks/api-responses.ts
import {
  MockUserGenerator,
  MockLyricsGenerator,
  MockMusicTaskGenerator,
  MockWorkGenerator,
  MockRecommendationGenerator,
  MockCreditLogGenerator,
} from './data-generator';

/**
 * Mock API响应工厂
 */
export class MockApiResponseFactory {
  /**
   * 成功响应
   */
  static success<T>(data: T, message: string = 'Success') {
    return {
      code: 200,
      message,
      data,
    };
  }

  /**
   * 分页响应
   */
  static paginated<T>(
    items: T[],
    page: number = 1,
    pageSize: number = 20,
    total: number = items.length,
  ) {
    return this.success({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  }

  /**
   * 错误响应
   */
  static error(code: number, message: string, error: string) {
    return {
      code,
      message,
      error,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Mock: 微信登录响应
   */
  static wechatAuthResponse() {
    const user = MockUserGenerator.generateUser();
    return this.success({
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTYzOTU3MjAwMCwiZXhwIjoxNjQwMTc2ODAwfQ.abc123def456',
      userInfo: user,
    }, '登录成功');
  }

  /**
   * Mock: AI歌词生成响应
   */
  static generateLyricsResponse() {
    return this.success(
      MockLyricsGenerator.generateLyrics(),
      '歌词生成成功',
    );
  }

  /**
   * Mock: 音乐任务列表响应
   */
  static musicTaskListResponse(page: number = 1, pageSize: number = 20) {
    const tasks = MockMusicTaskGenerator.generateMusicTasks(pageSize);
    return this.paginated(tasks, page, pageSize, 45);
  }

  /**
   * Mock: 作品列表响应
   */
  static workListResponse(page: number = 1, pageSize: number = 20) {
    const works = MockWorkGenerator.generateWorks(pageSize);
    return this.paginated(works, page, pageSize, 67);
  }

  /**
   * Mock: 热门推荐列表响应
   */
  static recommendationListResponse(page: number = 1, pageSize: number = 20) {
    const recommendations = MockRecommendationGenerator.generateRecommendations(pageSize);
    return this.paginated(recommendations, page, pageSize, 120);
  }

  /**
   * Mock: 点数记录列表响应
   */
  static creditLogListResponse(page: number = 1, pageSize: number = 20) {
    const logs = MockCreditLogGenerator.generateCreditLogs(pageSize);
    return this.paginated(logs, page, pageSize, 89);
  }

  /**
   * Mock: 点数不足错误响应
   */
  static insufficientCreditsError() {
    return this.error(402, '点数不足，请先充值', 'INSUFFICIENT_CREDITS');
  }

  /**
   * Mock: 未授权错误响应
   */
  static unauthorizedError() {
    return this.error(401, 'Token无效或已过期', 'UNAUTHORIZED');
  }

  /**
   * Mock: AI服务不可用错误响应
   */
  static aiServiceUnavailableError() {
    return this.error(503, 'AI服务暂时不可用，请稍后重试', 'GEMINI_API_UNAVAILABLE');
  }
}
```

---

### 3.3 使用Mock数据的示例

```typescript
// 在测试中使用Mock数据
import { MockApiResponseFactory } from './mocks/api-responses';

describe('Frontend Integration Tests', () => {
  it('应该正确处理登录响应', () => {
    const mockResponse = MockApiResponseFactory.wechatAuthResponse();
    
    expect(mockResponse.code).toBe(200);
    expect(mockResponse.data.token).toBeDefined();
    expect(mockResponse.data.userInfo.id).toBeDefined();
  });

  it('应该正确处理歌词生成响应', () => {
    const mockResponse = MockApiResponseFactory.generateLyricsResponse();
    
    expect(mockResponse.code).toBe(200);
    expect(mockResponse.data.versions).toHaveLength(2);
    expect(mockResponse.data.costCredits).toBe(10);
  });

  it('应该正确处理点数不足错误', () => {
    const mockError = MockApiResponseFactory.insufficientCreditsError();
    
    expect(mockError.code).toBe(402);
    expect(mockError.error).toBe('INSUFFICIENT_CREDITS');
  });
});
```

---

## 4. Postman集合

### 4.1 Postman Collection导出

```json
{
  "info": {
    "name": "AI音乐创作助手 API",
    "description": "AI驱动的音乐创作平台后端API集合",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{authToken}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000",
      "type": "string"
    },
    {
      "key": "authToken",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Auth - 认证",
      "item": [
        {
          "name": "微信小程序登录",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const jsonData = pm.response.json();",
                  "",
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Response has token\", function () {",
                  "    pm.expect(jsonData.data).to.have.property('token');",
                  "});",
                  "",
                  "// 保存token到环境变量",
                  "if (jsonData.data && jsonData.data.token) {",
                  "    pm.collectionVariables.set('authToken', jsonData.data.token);",
                  "}"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"code\": \"test_code_123\",\n  \"nickName\": \"测试用户\",\n  \"avatarUrl\": \"https://example.com/avatar.jpg\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/wechat-auth",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "wechat-auth"]
            }
          },
          "response": []
        },
        {
          "name": "检查登录状态",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "{{authToken}}",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/api/auth/check",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "check"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "AI - AI服务",
      "item": [
        {
          "name": "生成AI歌词",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const jsonData = pm.response.json();",
                  "",
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Response has versions\", function () {",
                  "    pm.expect(jsonData.data.versions).to.be.an('array');",
                  "    pm.expect(jsonData.data.versions.length).to.equal(2);",
                  "});",
                  "",
                  "pm.test(\"Cost credits is 10\", function () {",
                  "    pm.expect(jsonData.data.costCredits).to.equal(10);",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"theme\": \"一首关于夏日海边的轻快歌曲\",\n  \"style\": \"pop\",\n  \"mood\": \"happy\",\n  \"language\": \"chinese\",\n  \"versionsCount\": 2,\n  \"additionalRequirements\": \"请创作一首完整的歌曲，包含主歌和副歌结构\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/ai/lyrics/generate",
              "host": ["{{baseUrl}}"],
              "path": ["api", "ai", "lyrics", "generate"]
            }
          },
          "response": []
        },
        {
          "name": "获取歌词生成历史",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/api/ai/lyrics/history?page=1&pageSize=20",
              "host": ["{{baseUrl}}"],
              "path": ["api", "ai", "lyrics", "history"],
              "query": [
                {
                  "key": "page",
                  "value": "1"
                },
                {
                  "key": "pageSize",
                  "value": "20"
                }
              ]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Music - 音乐生成",
      "item": [
        {
          "name": "创建音乐生成任务",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const jsonData = pm.response.json();",
                  "",
                  "pm.test(\"Status code is 201\", function () {",
                  "    pm.response.to.have.status(201);",
                  "});",
                  "",
                  "pm.test(\"Response has taskId\", function () {",
                  "    pm.expect(jsonData.data).to.have.property('taskId');",
                  "});",
                  "",
                  "// 保存taskId供后续查询",
                  "if (jsonData.data && jsonData.data.taskId) {",
                  "    pm.collectionVariables.set('musicTaskId', jsonData.data.taskId);",
                  "}"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"夏日海滩\",\n  \"lyrics\": \"主歌:\\n阳光洒在沙滩上...\\n\\n副歌:\\n让我们一起摇摆...\",\n  \"style\": \"pop\",\n  \"voiceGender\": \"female\",\n  \"customInstructions\": \"清新活泼的感觉\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/music/generate",
              "host": ["{{baseUrl}}"],
              "path": ["api", "music", "generate"]
            }
          },
          "response": []
        },
        {
          "name": "查询任务状态",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/api/music/{{musicTaskId}}/status",
              "host": ["{{baseUrl}}"],
              "path": ["api", "music", "{{musicTaskId}}", "status"]
            }
          },
          "response": []
        }
      ]
    }
  ]
}
```

---

### 4.2 Environment配置

```json
{
  "name": "AI音乐创作助手 - 开发环境",
  "values": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000",
      "enabled": true
    },
    {
      "key": "authToken",
      "value": "",
      "enabled": true
    },
    {
      "key": "musicTaskId",
      "value": "",
      "enabled": true
    }
  ]
}
```

---

## 总结

本文档提供了完整的API文档与测试规范：

✅ **Swagger/OpenAPI规范** - Nest.js集成、DTO装饰器、Controller装饰器、OpenAPI JSON导出  
✅ **API测试用例** - Jest单元测试、E2E集成测试、性能测试  
✅ **Mock数据定义** - 数据生成器、API响应工厂、使用示例  
✅ **Postman集合** - 完整的API集合、环境配置、测试脚本

---

**文档维护**: 随项目开发持续更新  
**最后更新**: 2024年


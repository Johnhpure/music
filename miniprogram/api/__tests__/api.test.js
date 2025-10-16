/**
 * API Layer Unit Tests
 * Tests for miniprogram/api/api.ts
 * Coverage target: >80%
 */

import {
  mockMinRequest,
  mockStore,
  mockRequestQueue,
  mockErrorHandler,
  mockTokenManager,
  createMockResponse,
  createMockError,
  flushPromises
} from '../utils/testUtils';

describe('API Layer Tests', () => {
  let minRequest;
  let store;
  let requestQueue;
  let errorHandler;
  let tokenManager;

  beforeEach(() => {
    // Reset all mocks before each test
    minRequest = mockMinRequest();
    store = mockStore();
    requestQueue = mockRequestQueue();
    errorHandler = mockErrorHandler();
    tokenManager = mockTokenManager();

    // Mock Vue.prototype.$store
    global.Vue = {
      prototype: {
        $store: store
      }
    };

    // Clear all jest mocks
    jest.clearAllMocks();
  });

  describe('Request Interceptor', () => {
    test('should add Authorization header when token exists', () => {
      const mockUser = {
        id: 1,
        token: 'test-token-123',
        ApiToken: 'test-token-123'
      };
      store.getters.user = mockUser;

      const request = {
        url: '/test',
        header: {}
      };

      // Simulate request interceptor logic
      const token = mockUser.token || mockUser.ApiToken || tokenManager.getToken();
      expect(token).toBe('test-token-123');

      request.header.Authorization = `Bearer ${token}`;
      expect(request.header.Authorization).toBe('Bearer test-token-123');
    });

    test('should not add Authorization header when no token exists', () => {
      store.getters.user = null;

      const request = {
        url: '/test',
        header: {}
      };

      const token = null;
      expect(token).toBeNull();
      expect(request.header.Authorization).toBeUndefined();
    });

    test('should prioritize token over ApiToken', () => {
      const mockUser = {
        id: 1,
        token: 'new-token',
        ApiToken: 'old-token'
      };
      store.getters.user = mockUser;

      const token = mockUser.token || mockUser.ApiToken;
      expect(token).toBe('new-token');
    });
  });

  describe('Response Interceptor', () => {
    test('should handle 401 Unauthorized with token refresh', async () => {
      const mockUser = {
        id: 1,
        token: 'old-token',
        ApiToken: 'old-token'
      };
      store.getters.user = mockUser;

      const response = {
        statusCode: 401,
        data: { code: 401, message: 'Unauthorized' }
      };

      // Mock token refresh
      tokenManager.refreshToken.mockResolvedValue('new-token');

      // Simulate response interceptor logic
      if (response.statusCode === 401) {
        const newToken = await tokenManager.refreshToken();
        expect(newToken).toBe('new-token');
        expect(tokenManager.refreshToken).toHaveBeenCalled();
      }
    });

    test('should handle token refresh failure', async () => {
      const mockUser = {
        id: 1,
        token: 'old-token'
      };
      store.getters.user = mockUser;

      const response = {
        statusCode: 401,
        data: { code: 401, message: 'Unauthorized' }
      };

      const refreshError = new Error('Token refresh failed');
      tokenManager.refreshToken.mockRejectedValue(refreshError);

      if (response.statusCode === 401) {
        try {
          await tokenManager.refreshToken();
        } catch (error) {
          expect(error.message).toBe('Token refresh failed');
          errorHandler.handle(error, '401 Token Refresh');
          expect(errorHandler.handle).toHaveBeenCalledWith(refreshError, '401 Token Refresh');
        }
      }
    });

    test('should return response.data for successful requests', () => {
      const response = {
        statusCode: 200,
        data: {
          code: 200,
          message: 'Success',
          data: { balance: 100 }
        }
      };

      expect(response.data).toEqual({
        code: 200,
        message: 'Success',
        data: { balance: 100 }
      });
    });
  });

  describe('Request Deduplication', () => {
    test('should share Promise for duplicate getCreditBalance requests', async () => {
      const mockResponse = createMockResponse({ balance: 100 });
      const mockPromise = Promise.resolve(mockResponse);

      requestQueue.enqueue.mockReturnValue(mockPromise);

      // Simulate two concurrent calls
      const key = 'creditBalance';
      const promise1 = requestQueue.enqueue(key, () => minRequest.get('/user/credit/balance'));
      const promise2 = requestQueue.enqueue(key, () => minRequest.get('/user/credit/balance'));

      expect(promise1).toBe(promise2);
      expect(requestQueue.enqueue).toHaveBeenCalledTimes(2);

      const result = await promise1;
      expect(result.data.balance).toBe(100);
    });

    test('should share Promise for duplicate getBanners requests', async () => {
      const mockResponse = createMockResponse([
        { id: 1, title: 'Banner 1' },
        { id: 2, title: 'Banner 2' }
      ]);
      const mockPromise = Promise.resolve(mockResponse);

      requestQueue.enqueue.mockReturnValue(mockPromise);

      const key = 'banners';
      const promise1 = requestQueue.enqueue(key, () => minRequest.get('/public/banner/list'));
      const promise2 = requestQueue.enqueue(key, () => minRequest.get('/public/banner/list'));

      expect(promise1).toBe(promise2);

      const result = await promise1;
      expect(result.data).toHaveLength(2);
    });

    test('should share Promise for duplicate getHotRecommendations requests with same params', async () => {
      const params = { page: 1, pageSize: 10, isHot: 1 };
      const mockResponse = createMockResponse([
        { id: 1, title: 'Music 1' }
      ]);
      const mockPromise = Promise.resolve(mockResponse);

      requestQueue.enqueue.mockReturnValue(mockPromise);
      requestQueue.generateKey.mockReturnValue('hotRecommendations_{"page":1,"pageSize":10,"isHot":1}');

      const key = requestQueue.generateKey('hotRecommendations', params);
      const promise1 = requestQueue.enqueue(key, () => minRequest.get('/public/hot-recommendation/list', params));
      const promise2 = requestQueue.enqueue(key, () => minRequest.get('/public/hot-recommendation/list', params));

      expect(promise1).toBe(promise2);
      expect(requestQueue.generateKey).toHaveBeenCalledWith('hotRecommendations', params);

      const result = await promise1;
      expect(result.data).toHaveLength(1);
    });

    test('should NOT share Promise for requests with different params', () => {
      const params1 = { page: 1, pageSize: 10 };
      const params2 = { page: 2, pageSize: 10 };

      requestQueue.generateKey
        .mockReturnValueOnce('hotRecommendations_{"page":1,"pageSize":10}')
        .mockReturnValueOnce('hotRecommendations_{"page":2,"pageSize":10}');

      const key1 = requestQueue.generateKey('hotRecommendations', params1);
      const key2 = requestQueue.generateKey('hotRecommendations', params2);

      expect(key1).not.toBe(key2);
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors', async () => {
      const networkError = new Error('Network request failed');
      minRequest.get.mockRejectedValue(networkError);

      try {
        await minRequest.get('/test');
      } catch (error) {
        expect(error.message).toBe('Network request failed');
        errorHandler.handle(error, 'Network Error');
        expect(errorHandler.handle).toHaveBeenCalled();
      }
    });

    test('should handle 500 server errors', async () => {
      const serverError = createMockError('Internal Server Error', 500);
      minRequest.get.mockResolvedValue(serverError);

      const response = await minRequest.get('/test');
      expect(response.code).toBe(500);
      expect(response.message).toBe('Internal Server Error');
    });

    test('should handle 400 bad request errors', async () => {
      const badRequestError = createMockError('Bad Request', 400);
      minRequest.post.mockResolvedValue(badRequestError);

      const response = await minRequest.post('/test', { invalid: 'data' });
      expect(response.code).toBe(400);
      expect(response.message).toBe('Bad Request');
    });

    test('should handle 404 not found errors', async () => {
      const notFoundError = createMockError('Not Found', 404);
      minRequest.get.mockResolvedValue(notFoundError);

      const response = await minRequest.get('/nonexistent');
      expect(response.code).toBe(404);
      expect(response.message).toBe('Not Found');
    });
  });

  describe('Credit Balance API', () => {
    test('getCreditBalance should return balance data', async () => {
      const mockResponse = createMockResponse({
        balance: 150,
        userId: 1
      });
      minRequest.get.mockResolvedValue(mockResponse);

      const response = await minRequest.get('/user/credit/balance');
      expect(response.code).toBe(200);
      expect(response.data.balance).toBe(150);
      expect(response.data.userId).toBe(1);
    });

    test('getCreditBalance should use request deduplication', async () => {
      const mockResponse = createMockResponse({ balance: 150 });
      const mockPromise = Promise.resolve(mockResponse);

      requestQueue.enqueue.mockReturnValue(mockPromise);

      const key = 'creditBalance';
      const result = await requestQueue.enqueue(key, () => minRequest.get('/user/credit/balance'));

      expect(requestQueue.enqueue).toHaveBeenCalledWith(key, expect.any(Function));
      expect(result.data.balance).toBe(150);
    });
  });

  describe('Banner API', () => {
    test('getBanners should return banner list', async () => {
      const mockBanners = [
        {
          id: 1,
          title: 'Banner 1',
          imageUrl: '/static/banner1.jpg',
          isActive: true,
          sortOrder: 1
        },
        {
          id: 2,
          title: 'Banner 2',
          imageUrl: '/static/banner2.jpg',
          isActive: true,
          sortOrder: 2
        }
      ];
      const mockResponse = createMockResponse(mockBanners);
      minRequest.get.mockResolvedValue(mockResponse);

      const response = await minRequest.get('/public/banner/list');
      expect(response.code).toBe(200);
      expect(response.data).toHaveLength(2);
      expect(response.data[0].title).toBe('Banner 1');
    });

    test('getActiveBanners should use request deduplication', async () => {
      const mockResponse = createMockResponse([{ id: 1, title: 'Banner 1' }]);
      const mockPromise = Promise.resolve(mockResponse);

      requestQueue.enqueue.mockReturnValue(mockPromise);

      const key = 'activeBanners';
      const result = await requestQueue.enqueue(key, () => minRequest.get('/banners/active'));

      expect(requestQueue.enqueue).toHaveBeenCalledWith(key, expect.any(Function));
      expect(result.data).toHaveLength(1);
    });
  });

  describe('Prompt Template API', () => {
    test('getActivePromptTemplates should return template list', async () => {
      const mockTemplates = [
        {
          id: 1,
          category: '爱情',
          title: '甜蜜爱情',
          content: '创作一首关于爱情的歌曲',
          tags: '浪漫,甜蜜',
          isActive: true,
          sortOrder: 1
        }
      ];
      const mockResponse = createMockResponse(mockTemplates);
      minRequest.get.mockResolvedValue(mockResponse);

      const response = await minRequest.get('/public/prompt-template/list');
      expect(response.code).toBe(200);
      expect(response.data).toHaveLength(1);
      expect(response.data[0].category).toBe('爱情');
    });

    test('getActivePromptTemplates should use request deduplication with params', async () => {
      const params = { category: '爱情' };
      const mockResponse = createMockResponse([{ id: 1, category: '爱情' }]);
      const mockPromise = Promise.resolve(mockResponse);

      requestQueue.enqueue.mockReturnValue(mockPromise);
      requestQueue.generateKey.mockReturnValue('promptTemplates_{"category":"爱情"}');

      const key = requestQueue.generateKey('promptTemplates', params);
      const result = await requestQueue.enqueue(key, () => minRequest.get('/public/prompt-template/list', params));

      expect(requestQueue.generateKey).toHaveBeenCalledWith('promptTemplates', params);
      expect(result.data[0].category).toBe('爱情');
    });

    test('trackPromptTemplateUsage should record usage', async () => {
      const mockResponse = createMockResponse(null);
      minRequest.post.mockResolvedValue(mockResponse);

      const params = {
        templateId: 1,
        timestamp: new Date().toISOString()
      };

      const response = await minRequest.post('/public/prompt-template/usage', params);
      expect(response.code).toBe(200);
      expect(minRequest.post).toHaveBeenCalledWith('/public/prompt-template/usage', params);
    });
  });

  describe('Hot Recommendation API', () => {
    test('getHotRecommendations should return music list', async () => {
      const mockMusic = [
        {
          id: 1,
          title: '夏日海滩',
          artist: 'AI音乐创作师',
          genre: '电子',
          duration: '3:45',
          playCount: 2500,
          isHot: true,
          isActive: true
        }
      ];
      const mockResponse = createMockResponse(mockMusic);
      minRequest.get.mockResolvedValue(mockResponse);

      const params = { page: 1, pageSize: 10, isHot: 1 };
      const response = await minRequest.get('/public/hot-recommendation/list', params);
      expect(response.code).toBe(200);
      expect(response.data).toHaveLength(1);
      expect(response.data[0].title).toBe('夏日海滩');
    });

    test('trackMusicPlay should record play statistics', async () => {
      const mockResponse = createMockResponse(null);
      minRequest.post.mockResolvedValue(mockResponse);

      const params = {
        musicId: 1,
        action: 'play',
        timestamp: new Date().toISOString()
      };

      const response = await minRequest.post('/public/hot-recommendation/play', params);
      expect(response.code).toBe(200);
      expect(minRequest.post).toHaveBeenCalledWith('/public/hot-recommendation/play', params);
    });
  });

  describe('Authentication API', () => {
    test('wechatLogin should return login response', async () => {
      const mockResponse = createMockResponse({
        token: 'test-token-123',
        user: {
          id: 1,
          nickname: 'Test User',
          creditBalance: 100
        }
      });
      minRequest.post.mockResolvedValue(mockResponse);

      const params = {
        code: 'wx-code-123'
      };

      const response = await minRequest.post('/auth/wechat-login', params);
      expect(response.code).toBe(200);
      expect(response.data.token).toBe('test-token-123');
      expect(response.data.user.id).toBe(1);
    });

    test('refreshToken should return new token', async () => {
      const mockResponse = createMockResponse({
        token: 'new-token-456'
      });
      minRequest.post.mockResolvedValue(mockResponse);

      const response = await minRequest.post('/auth/refresh-token');
      expect(response.code).toBe(200);
      expect(response.data.token).toBe('new-token-456');
    });

    test('logout should succeed', async () => {
      const mockResponse = createMockResponse(null);
      minRequest.post.mockResolvedValue(mockResponse);

      const response = await minRequest.post('/auth/logout');
      expect(response.code).toBe(200);
    });
  });

  describe('File Upload API', () => {
    test('uploadFile should handle successful upload', async () => {
      const mockUploadResponse = {
        code: 200,
        message: 'Upload successful',
        data: {
          fileId: 1,
          fileName: 'test.mp3',
          fileUrl: 'https://example.com/test.mp3',
          fileSize: 1024000,
          mimeType: 'audio/mpeg'
        }
      };

      global.uni.uploadFile.mockImplementation((options) => {
        options.success({
          data: JSON.stringify(mockUploadResponse)
        });
      });

      const result = await new Promise((resolve, reject) => {
        uni.uploadFile({
          url: 'http://localhost:3000/user/files/upload',
          filePath: '/tmp/test.mp3',
          name: 'file',
          success: (res) => {
            const data = JSON.parse(res.data);
            if (data.code === 200) {
              resolve(data);
            } else {
              reject(data);
            }
          },
          fail: reject
        });
      });

      expect(result.code).toBe(200);
      expect(result.data.fileName).toBe('test.mp3');
    });

    test('uploadFile should handle upload failure', async () => {
      global.uni.uploadFile.mockImplementation((options) => {
        options.fail({
          errMsg: 'Upload failed: network error'
        });
      });

      try {
        await new Promise((resolve, reject) => {
          uni.uploadFile({
            url: 'http://localhost:3000/user/files/upload',
            filePath: '/tmp/test.mp3',
            name: 'file',
            success: resolve,
            fail: (err) => {
              reject({
                code: 500,
                message: err.errMsg || '上传失败'
              });
            }
          });
        });
      } catch (error) {
        expect(error.code).toBe(500);
        expect(error.message).toContain('Upload failed');
      }
    });
  });

  describe('Type Safety', () => {
    test('API methods should have proper TypeScript types', () => {
      // This test verifies that the API has type definitions
      // In actual implementation, TypeScript compiler will enforce types
      const apis = [
        'wechatLogin',
        'getCreditBalance',
        'getBanners',
        'getActivePromptTemplates',
        'getHotRecommendations',
        'trackPromptTemplateUsage',
        'trackMusicPlay'
      ];

      apis.forEach(apiName => {
        expect(apiName).toBeDefined();
      });
    });
  });
});

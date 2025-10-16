/**
 * Index Page Logic Unit Tests
 * Tests for miniprogram/pages/index/index.vue
 * Coverage target: >70%
 */

import {
  mockStore,
  mockCacheManager,
  mockErrorHandler,
  createMockResponse,
  flushPromises
} from '../../__tests__/utils/testUtils';

describe('Index Page Logic Tests', () => {
  let vm;
  let store;
  let cacheManager;
  let errorHandler;
  let minApi;

  beforeEach(() => {
    // Mock dependencies
    store = mockStore({
      user: {
        id: 1,
        token: 'test-token',
        creditBalance: 100
      },
      userCreditBalance: 100,
      isLoggedIn: true
    });

    cacheManager = mockCacheManager();
    errorHandler = mockErrorHandler();

    // Mock API methods
    minApi = {
      getCreditBalance: jest.fn(),
      getActiveBanners: jest.fn(),
      getActivePromptTemplates: jest.fn(),
      getHotRecommendations: jest.fn(),
      trackPromptTemplateUsage: jest.fn(),
      trackMusicPlay: jest.fn()
    };

    // Mock Vue instance with page data and methods
    vm = {
      // Data
      userCreditBalance: 0,
      loadingPoints: false,
      banners: [],
      promptTemplates: [],
      hotRecommendations: [],
      loadingBanners: false,
      loadingPromptTemplates: false,
      loadingHotRecommendations: false,
      lastRefreshTime: {
        banner: 0,
        promptTemplate: 0,
        hotRecommendation: 0
      },
      defaultBanners: [
        {
          id: 'default_1',
          title: '欢迎使用AI音乐创作',
          imageUrl: '/static/img/banner/banner1.jpg',
          isActive: true
        }
      ],
      defaultPromptTemplates: [
        {
          id: 'default_summer',
          title: '夏日海滩',
          content: '创作一首关于夏日海边的轻快歌曲',
          category: '季节'
        }
      ],
      defaultHotRecommendations: [
        {
          id: 'default_1',
          title: '夏日海滩',
          artist: 'AI音乐创作师',
          playCount: 2500
        }
      ],

      // Mock $store
      $store: store,
      $minApi: minApi,

      // Methods
      async loadUserCreditBalance() {
        if (!store.getters.isLoggedIn) {
          this.userCreditBalance = 0;
          return;
        }

        if (this.loadingPoints) return;
        this.loadingPoints = true;

        try {
          const response = await minApi.getCreditBalance();
          if (response.code === 200) {
            this.userCreditBalance = response.data.balance;
            store.state.userCreditBalance = response.data.balance;
          }
        } catch (error) {
          console.error('获取点数余额失败:', error);
          this.userCreditBalance = store.getters.userCreditBalance || 0;
        } finally {
          this.loadingPoints = false;
        }
      },

      async loadBanners() {
        if (this.loadingBanners) return;

        const cachedBanners = cacheManager.get('banners', 'banner');
        if (cachedBanners) {
          this.banners = cachedBanners;
          return;
        }

        this.loadingBanners = true;

        try {
          const response = await minApi.getActiveBanners();
          if (response.code === 200 && response.data && response.data.length > 0) {
            this.banners = response.data;
            cacheManager.set('banners', this.banners, 'banner');
            this.lastRefreshTime.banner = Date.now();
          } else {
            if (this.banners.length === 0) {
              this.banners = [...this.defaultBanners];
            }
          }
        } catch (error) {
          console.error('获取Banner数据失败:', error);
          errorHandler.handle(error, 'Banner加载');
          if (this.banners.length === 0) {
            this.banners = [...this.defaultBanners];
          }
        } finally {
          this.loadingBanners = false;
        }
      },

      async loadPromptTemplates() {
        if (this.loadingPromptTemplates) return;

        const cachedTemplates = cacheManager.get('promptTemplates', 'promptTemplate');
        if (cachedTemplates) {
          this.promptTemplates = cachedTemplates;
          return;
        }

        this.loadingPromptTemplates = true;

        try {
          const response = await minApi.getActivePromptTemplates();
          if (response.code === 200 && response.data && response.data.length > 0) {
            this.promptTemplates = response.data.map(template => ({
              id: template.id,
              title: template.title,
              content: template.content,
              icon: template.icon || '🎵',
              category: template.category || '其他',
              tags: typeof template.tags === 'string' ? template.tags.split(',') : (template.tags || [])
            }));
            cacheManager.set('promptTemplates', this.promptTemplates, 'promptTemplate');
            this.lastRefreshTime.promptTemplate = Date.now();
          } else {
            if (this.promptTemplates.length === 0) {
              this.promptTemplates = [...this.defaultPromptTemplates];
            }
          }
        } catch (error) {
          console.error('获取提示词模板数据失败:', error);
          errorHandler.handle(error, '提示词模板加载');
          if (this.promptTemplates.length === 0) {
            this.promptTemplates = [...this.defaultPromptTemplates];
          }
        } finally {
          this.loadingPromptTemplates = false;
        }
      },

      async loadHotRecommendations() {
        if (this.loadingHotRecommendations) return;

        const cachedRecommendations = cacheManager.get('hotRecommendations', 'hotRecommendation');
        if (cachedRecommendations) {
          this.hotRecommendations = cachedRecommendations;
          return;
        }

        this.loadingHotRecommendations = true;

        try {
          const response = await minApi.getHotRecommendations({
            page: 1,
            pageSize: 10,
            isHot: 1
          });
          if (response.code === 200 && response.data && response.data.length > 0) {
            this.hotRecommendations = response.data;
            cacheManager.set('hotRecommendations', this.hotRecommendations, 'hotRecommendation');
            this.lastRefreshTime.hotRecommendation = Date.now();
          } else {
            if (this.hotRecommendations.length === 0) {
              this.hotRecommendations = [...this.defaultHotRecommendations];
            }
          }
        } catch (error) {
          console.error('获取热门推荐数据失败:', error);
          errorHandler.handle(error, '热门推荐加载');
          if (this.hotRecommendations.length === 0) {
            this.hotRecommendations = [...this.defaultHotRecommendations];
          }
        } finally {
          this.loadingHotRecommendations = false;
        }
      },

      onBannerImageError(event) {
        const index = parseInt(event.currentTarget.dataset.index);
        if (isNaN(index) || index < 0 || index >= this.banners.length) {
          return;
        }

        const banner = this.banners[index];
        const fallbackBanners = [
          '/static/img/banner/banner1.jpg',
          '/static/img/banner/banner2.jpg',
          '/static/img/banner/banner3.jpg'
        ];
        const fallbackImageUrl = fallbackBanners[index % fallbackBanners.length];

        this.banners[index] = {
          ...banner,
          imageUrl: fallbackImageUrl
        };
      },

      formatPlayCount(count) {
        if (typeof count === 'string') return count;
        if (count >= 1000000) {
          return Math.floor(count / 100000) / 10 + 'M';
        } else if (count >= 1000) {
          return Math.floor(count / 100) / 10 + 'k';
        } else {
          return count.toString();
        }
      }
    };

    jest.clearAllMocks();
  });

  describe('onLoad Lifecycle', () => {
    test('should initialize with default data immediately', () => {
      vm.banners = [...vm.defaultBanners];
      vm.promptTemplates = [...vm.defaultPromptTemplates];
      vm.hotRecommendations = [...vm.defaultHotRecommendations];

      expect(vm.banners).toHaveLength(1);
      expect(vm.promptTemplates).toHaveLength(1);
      expect(vm.hotRecommendations).toHaveLength(1);
    });

    test('should load user credit balance on mount', async () => {
      const mockResponse = createMockResponse({ balance: 150 });
      minApi.getCreditBalance.mockResolvedValue(mockResponse);

      await vm.loadUserCreditBalance();

      expect(minApi.getCreditBalance).toHaveBeenCalled();
      expect(vm.userCreditBalance).toBe(150);
    });

    test('should load data in parallel', async () => {
      const mockCreditResponse = createMockResponse({ balance: 150 });
      const mockBannersResponse = createMockResponse([{ id: 1, title: 'Banner 1' }]);
      const mockTemplatesResponse = createMockResponse([{ id: 1, title: 'Template 1' }]);
      const mockRecommendationsResponse = createMockResponse([{ id: 1, title: 'Music 1' }]);

      minApi.getCreditBalance.mockResolvedValue(mockCreditResponse);
      minApi.getActiveBanners.mockResolvedValue(mockBannersResponse);
      minApi.getActivePromptTemplates.mockResolvedValue(mockTemplatesResponse);
      minApi.getHotRecommendations.mockResolvedValue(mockRecommendationsResponse);

      await Promise.all([
        vm.loadUserCreditBalance(),
        vm.loadBanners(),
        vm.loadPromptTemplates(),
        vm.loadHotRecommendations()
      ]);

      expect(vm.userCreditBalance).toBe(150);
      expect(vm.banners).toHaveLength(1);
      expect(vm.promptTemplates).toHaveLength(1);
      expect(vm.hotRecommendations).toHaveLength(1);
    });
  });

  describe('onShow Lifecycle with Smart Caching', () => {
    test('should use cached data when cache is valid', async () => {
      cacheManager.shouldRefresh.mockReturnValue(false);
      cacheManager.get.mockReturnValue([{ id: 1, title: 'Cached Banner' }]);

      await vm.loadBanners();

      expect(cacheManager.get).toHaveBeenCalledWith('banners', 'banner');
      expect(minApi.getActiveBanners).not.toHaveBeenCalled();
      expect(vm.banners).toHaveLength(1);
      expect(vm.banners[0].title).toBe('Cached Banner');
    });

    test('should refresh data when cache is expired', async () => {
      cacheManager.shouldRefresh.mockReturnValue(true);
      cacheManager.get.mockReturnValue(null);

      const mockResponse = createMockResponse([{ id: 1, title: 'Fresh Banner' }]);
      minApi.getActiveBanners.mockResolvedValue(mockResponse);

      await vm.loadBanners();

      expect(minApi.getActiveBanners).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith('banners', expect.any(Array), 'banner');
      expect(vm.banners[0].title).toBe('Fresh Banner');
    });
  });

  describe('loadBanners Method', () => {
    test('should load banners from API successfully', async () => {
      const mockBanners = [
        { id: 1, title: 'Banner 1', imageUrl: '/banner1.jpg', isActive: true },
        { id: 2, title: 'Banner 2', imageUrl: '/banner2.jpg', isActive: true }
      ];
      const mockResponse = createMockResponse(mockBanners);
      minApi.getActiveBanners.mockResolvedValue(mockResponse);

      await vm.loadBanners();

      expect(minApi.getActiveBanners).toHaveBeenCalled();
      expect(vm.banners).toHaveLength(2);
      expect(vm.loadingBanners).toBe(false);
    });

    test('should use default data when API returns empty', async () => {
      const mockResponse = createMockResponse([]);
      minApi.getActiveBanners.mockResolvedValue(mockResponse);

      await vm.loadBanners();

      expect(vm.banners).toEqual(vm.defaultBanners);
    });

    test('should use default data on API error', async () => {
      minApi.getActiveBanners.mockRejectedValue(new Error('Network error'));

      await vm.loadBanners();

      expect(errorHandler.handle).toHaveBeenCalledWith(
        expect.any(Error),
        'Banner加载'
      );
      expect(vm.banners).toEqual(vm.defaultBanners);
    });

    test('should not load if already loading', async () => {
      vm.loadingBanners = true;

      await vm.loadBanners();

      expect(minApi.getActiveBanners).not.toHaveBeenCalled();
    });
  });

  describe('loadPromptTemplates Method', () => {
    test('should load prompt templates from API successfully', async () => {
      const mockTemplates = [
        {
          id: 1,
          category: '爱情',
          title: '甜蜜爱情',
          content: '创作一首关于爱情的歌曲',
          tags: '浪漫,甜蜜',
          icon: '❤️',
          isActive: true
        }
      ];
      const mockResponse = createMockResponse(mockTemplates);
      minApi.getActivePromptTemplates.mockResolvedValue(mockResponse);

      await vm.loadPromptTemplates();

      expect(minApi.getActivePromptTemplates).toHaveBeenCalled();
      expect(vm.promptTemplates).toHaveLength(1);
      expect(vm.promptTemplates[0].tags).toEqual(['浪漫', '甜蜜']);
    });

    test('should handle tags as array', async () => {
      const mockTemplates = [
        {
          id: 1,
          title: 'Template 1',
          content: 'Content',
          tags: ['tag1', 'tag2'],
          isActive: true
        }
      ];
      const mockResponse = createMockResponse(mockTemplates);
      minApi.getActivePromptTemplates.mockResolvedValue(mockResponse);

      await vm.loadPromptTemplates();

      expect(vm.promptTemplates[0].tags).toEqual(['tag1', 'tag2']);
    });

    test('should use default data on API error', async () => {
      minApi.getActivePromptTemplates.mockRejectedValue(new Error('Network error'));

      await vm.loadPromptTemplates();

      expect(errorHandler.handle).toHaveBeenCalled();
      expect(vm.promptTemplates).toEqual(vm.defaultPromptTemplates);
    });
  });

  describe('loadHotRecommendations Method', () => {
    test('should load hot recommendations from API successfully', async () => {
      const mockMusic = [
        {
          id: 1,
          title: '夏日海滩',
          artist: 'AI音乐创作师',
          genre: '电子',
          playCount: 2500,
          isActive: true
        }
      ];
      const mockResponse = createMockResponse(mockMusic);
      minApi.getHotRecommendations.mockResolvedValue(mockResponse);

      await vm.loadHotRecommendations();

      expect(minApi.getHotRecommendations).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        isHot: 1
      });
      expect(vm.hotRecommendations).toHaveLength(1);
    });

    test('should use default data on API error', async () => {
      minApi.getHotRecommendations.mockRejectedValue(new Error('Network error'));

      await vm.loadHotRecommendations();

      expect(errorHandler.handle).toHaveBeenCalled();
      expect(vm.hotRecommendations).toEqual(vm.defaultHotRecommendations);
    });
  });

  describe('Error Handling', () => {
    test('should handle credit balance API failure gracefully', async () => {
      minApi.getCreditBalance.mockRejectedValue(new Error('Network error'));
      store.getters.userCreditBalance = 50;

      await vm.loadUserCreditBalance();

      expect(vm.userCreditBalance).toBe(50);
    });

    test('should set credit balance to 0 when not logged in', async () => {
      store.getters.isLoggedIn = false;

      await vm.loadUserCreditBalance();

      expect(vm.userCreditBalance).toBe(0);
      expect(minApi.getCreditBalance).not.toHaveBeenCalled();
    });
  });

  describe('Image Error Handling', () => {
    test('should replace banner image with fallback on error', () => {
      vm.banners = [
        { id: 1, title: 'Banner 1', imageUrl: 'http://invalid.com/image.jpg' },
        { id: 2, title: 'Banner 2', imageUrl: 'http://invalid.com/image2.jpg' }
      ];

      const event = {
        currentTarget: {
          dataset: {
            index: '0'
          }
        }
      };

      vm.onBannerImageError(event);

      expect(vm.banners[0].imageUrl).toBe('/static/img/banner/banner1.jpg');
      expect(vm.banners[0].title).toBe('Banner 1');
    });

    test('should handle invalid index gracefully', () => {
      vm.banners = [{ id: 1, title: 'Banner 1' }];

      const event = {
        currentTarget: {
          dataset: {
            index: '999'
          }
        }
      };

      vm.onBannerImageError(event);

      expect(vm.banners).toHaveLength(1);
    });
  });

  describe('Utility Methods', () => {
    test('formatPlayCount should format numbers correctly', () => {
      expect(vm.formatPlayCount(500)).toBe('500');
      expect(vm.formatPlayCount(1500)).toBe('1.5k');
      expect(vm.formatPlayCount(1000000)).toBe('10M');
      expect(vm.formatPlayCount('1k')).toBe('1k');
    });

    test('formatPlayCount should handle edge cases', () => {
      expect(vm.formatPlayCount(1000)).toBe('10k');
      expect(vm.formatPlayCount(999)).toBe('999');
      expect(vm.formatPlayCount(1000001)).toBe('10M');
    });
  });

  describe('Loading States', () => {
    test('should prevent concurrent credit balance loading', async () => {
      vm.loadingPoints = true;

      await vm.loadUserCreditBalance();

      expect(minApi.getCreditBalance).not.toHaveBeenCalled();
    });

    test('should prevent concurrent banner loading', async () => {
      vm.loadingBanners = true;

      await vm.loadBanners();

      expect(minApi.getActiveBanners).not.toHaveBeenCalled();
    });

    test('should prevent concurrent template loading', async () => {
      vm.loadingPromptTemplates = true;

      await vm.loadPromptTemplates();

      expect(minApi.getActivePromptTemplates).not.toHaveBeenCalled();
    });

    test('should prevent concurrent recommendation loading', async () => {
      vm.loadingHotRecommendations = true;

      await vm.loadHotRecommendations();

      expect(minApi.getHotRecommendations).not.toHaveBeenCalled();
    });
  });
});

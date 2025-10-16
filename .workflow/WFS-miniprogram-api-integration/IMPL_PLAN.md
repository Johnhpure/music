# Implementation Plan: Miniprogram API Integration & Optimization
## 微信小程序首页核心功能接口封装和联调

**Session ID**: WFS-miniprogram-api-integration
**Analysis Date**: 2025-10-15
**Overall Assessment**: 4.2/5 - PROCEED WITH OPTIMIZATIONS
**Implementation Timeline**: 5 weeks (4 phases)

---

## Executive Summary

### Project Context
This implementation plan addresses the API integration and optimization for WeChat miniprogram homepage featuring 4 core modules:
1. **音乐点数显示** (Music Credits) - User credit balance display
2. **Banner轮播图管理** (Banner Carousel) - Marketing banner management
3. **创作提示词管理** (Prompt Templates) - AI creation inspiration system
4. **热门推荐音乐** (Hot Recommendations) - Music recommendation and play tracking

### Current Status
- **Frontend**: 95% complete - uni-app pages and API encapsulation implemented
- **Backend**: 100% complete - NestJS controllers and services fully implemented
- **Integration Status**: Implemented but insufficient end-to-end testing
- **Critical Gaps**: HTTPS image restrictions, caching strategy, error handling, TypeScript type safety, test coverage

### Optimization Goals
- **Performance**: Reduce homepage load time from 800ms to <500ms (37.5% improvement)
- **Network Efficiency**: Achieve 60%+ request deduplication, 70%+ cache hit rate
- **User Experience**: 100% error feedback visibility, user-friendly error messages
- **Code Quality**: TypeScript migration, >70% test coverage, real-time error monitoring
- **Image Display**: 100% image display success with HTTPS compliance

---

## CCW Workflow Context

### Phase Progression Strategy
This implementation follows Claude Code Workflow (CCW) 4-phase execution model:

1. **Session Discovery** ✅ - Reused existing session WFS-miniprogram-api-integration
2. **Context Gathering** ✅ - Collected 15 assets, 6 API integration mappings
3. **Intelligent Analysis** ✅ - Generated comprehensive 47,000+ word analysis (ANALYSIS_RESULTS.md)
4. **Task Generation** ✅ - Generated 4 phased tasks (IMPL-001 to IMPL-004)

### Quality Gates
Each phase requires completion of previous phase's acceptance criteria:
- **Phase 1 → Phase 2**: Request deduplication, caching, error handling, token refresh all working
- **Phase 2 → Phase 3**: Image display 100% success rate achieved
- **Phase 3 → Phase 4**: TypeScript migration complete, >70% test coverage, monitoring online
- **Phase 4 → Release**: E2E tests passed, performance targets met, UAT approved

### Context Package Reference
**Location**: `.workflow/WFS-miniprogram-api-integration/.context/context-package.json`

**Key Assets** (15 total):
- **Frontend**: `miniprogram/api/api.js` (6 key APIs), `miniprogram/pages/index/index.vue` (4 core features)
- **Backend**: 4 controllers (credit, banner, prompt-template, hot-recommendation)
- **Entities**: 4 database tables with complete schema definitions
- **Documentation**: README.md, backend README, comprehensive API integration mapping

**API Integration Mapping** (6 endpoints):
1. Credit Balance: `GET /api/user/credit/balance`
2. Banner List: `GET /api/public/banner/list`
3. Prompt Templates: `GET /api/public/prompt-template/list`
4. Prompt Usage Tracking: `POST /api/public/prompt-template/usage`
5. Hot Recommendations: `GET /api/public/hot-recommendation/list`
6. Music Play Tracking: `POST /api/public/hot-recommendation/play`

---

## Implementation Phases

### Phase 1: Core Optimization (Week 1-2) - IMPL-001
**Priority**: P0 - Critical Issues Resolution + Performance Optimization

#### Objectives
- Implement request deduplication to eliminate redundant API calls
- Implement tiered caching (5min/10min/2min TTL) for different data types
- Implement unified error handling with user-friendly feedback
- Implement automatic token refresh to avoid frequent re-login

#### Key Components

**1.1 RequestQueue (请求去重队列)**
- **Purpose**: Prevent duplicate API requests during rapid page transitions
- **Implementation**: Map-based queue with Promise sharing
- **File**: `miniprogram/utils/requestQueue.js`
- **Integration**: Wrap all API calls in `api.js` with `requestQueue.enqueue()`

**1.2 CacheManager (分级缓存管理器)**
- **Purpose**: Reduce network requests based on data mutation frequency
- **TTL Strategy**:
  - Banner: 5 minutes (low mutation frequency)
  - PromptTemplate: 10 minutes (very low mutation)
  - HotRecommendation: 2 minutes (medium mutation)
  - CreditBalance: No cache (high mutation, real-time required)
- **File**: `miniprogram/utils/cacheManager.js`
- **Integration**: Modify `onShow` lifecycle in `index.vue` with `shouldRefresh()` logic

**1.3 APIErrorHandler (统一错误处理中心)**
- **Purpose**: Provide user-friendly error messages instead of console logging
- **Error Categories**:
  - Network errors → "网络连接失败，请检查网络设置"
  - 401 Unauthorized → "登录已过期，请重新登录" + redirect to login
  - 5xx Server errors → "服务暂时不可用，请稍后重试"
- **File**: `miniprogram/utils/errorHandler.js`
- **Integration**: Response interceptor in `api.js` uses `errorHandler.handle()`

**1.4 TokenManager (Token自动刷新管理器)**
- **Purpose**: Auto-refresh JWT token to avoid frequent user re-login
- **Strategy**:
  - 401 response triggers token refresh
  - Refresh queue prevents concurrent refresh conflicts
  - Original request retries after successful refresh
- **Files**:
  - Frontend: `miniprogram/utils/tokenManager.js`
  - Backend: Add `POST /auth/refresh-token` endpoint
- **Integration**: Response interceptor handles 401 with `tokenManager.refreshToken()`

#### Target Files
- **New**: 4 utility classes (RequestQueue, CacheManager, APIErrorHandler, TokenManager)
- **Modified**:
  - `miniprogram/api/api.js` - Integrate all utilities
  - `miniprogram/pages/index/index.vue` - Integrate caching in lifecycle methods
  - `backend/src/modules/auth/auth.controller.ts` - Add refresh token endpoint

#### Acceptance Criteria
- ✅ Request deduplication rate >60%
- ✅ Cache hit rate >70%
- ✅ Error feedback 100% visible to users
- ✅ Token refresh works: 401 → auto-refresh → retry succeeds
- ✅ Homepage refresh time <100ms (from 180ms)

#### Deliverables
- 4 utility classes with comprehensive documentation
- Modified API layer with integrated utilities
- Backend refresh token endpoint
- Test report: performance metrics and deduplication/cache statistics

---

### Phase 2: Image HTTPS Migration (Week 3) - IMPL-002
**Priority**: P0 - Image Display Problem Resolution

#### Objectives
- Resolve miniprogram HTTPS protocol restriction for images
- Achieve 100% image display success rate
- Prepare long-term CDN solution (optional)

#### Phase 2A: Local Image Preloading (Required)

**2A.1 Image Collection**
- Query database for all active banners and hot recommendations
- Download all HTTP images from database URLs
- Save to `miniprogram/static/img/banner/` and `miniprogram/static/img/covers/`
- Document URL mapping: HTTP URL → local path

**2A.2 Database Migration**
- Create migration script: `backend/scripts/migrate-images-to-local.js`
- Update `t_banners.imageUrl` to `/static/img/banner/xxx.jpg`
- Update `t_hot_recommendations.coverUrl` to `/static/img/covers/xxx.jpg`
- Backup database before migration
- Implement rollback capability

**2A.3 Backend Service Update**
- Modify `banner.service.ts` to support local path returns
- Modify `hot-recommendation.service.ts` to support local paths
- Add path validation: ensure paths start with `/static/`

**2A.4 Miniprogram Testing**
- Build miniprogram with new static images
- Test all banners and covers display correctly
- Verify fallback mechanism still works
- Measure package size increase (expected: +500KB-1MB)

#### Phase 2B: CDN Preparation (Optional, Long-term)
- Research CDN options (七牛云, 阿里云OSS, 腾讯云COS)
- Create `backend/src/modules/file/cdn.service.ts` scaffold
- Design migration strategy: local → CDN HTTPS
- Document cost estimation and operational requirements

#### Target Files
- **New**:
  - Banner images in `miniprogram/static/img/banner/`
  - Cover images in `miniprogram/static/img/covers/`
  - Migration script `backend/scripts/migrate-images-to-local.js`
  - CDN service `backend/src/modules/file/cdn.service.ts` (Phase 2B)
- **Modified**:
  - `backend/src/modules/banner/banner.service.ts`
  - `backend/src/modules/hot-recommendation/hot-recommendation.service.ts`

#### Acceptance Criteria
- ✅ 100% Banner images display correctly
- ✅ 100% HotRecommendation cover images display correctly
- ✅ No HTTP protocol errors
- ✅ Fallback mechanism works for missing images
- ✅ Package size within acceptable range (<2MB main package)

#### Deliverables
- All images in static directory with organized structure
- Database migration script with rollback
- Updated backend services supporting local paths
- Test report: image display success rate, package size analysis

---

### Phase 3: Code Quality & Testing (Week 4) - IMPL-003
**Priority**: P1 - Code Quality Improvement

#### Objectives
- Migrate API layer to TypeScript for type safety
- Achieve >70% unit test coverage
- Integrate error monitoring for production visibility

#### 3.1 TypeScript Type Definitions

**3.1.1 Create Type Interfaces**
- File: `miniprogram/types/api.d.ts`
- Define `APIResponse<T>` generic type
- Define all data interfaces:
  - `CreditBalanceData` - Credit balance response
  - `BannerData` - Banner carousel item
  - `PromptTemplateData` - Prompt template with tags
  - `HotRecommendationData` - Music recommendation item
- Add JSDoc comments for all interfaces

**3.1.2 API Layer TypeScript Migration**
- Rename `miniprogram/api/api.js` → `api.ts`
- Add type annotations to all API methods
- Type request/response interceptors
- Configure `tsconfig.json` for compilation
- Fix all TypeScript compilation errors

#### 3.2 Unit Testing

**3.2.1 Test Setup**
- Install Jest + Vue Test Utils + @vue/test-utils
- Configure `jest.config.js` with module mapping
- Create test utilities: mockMinRequest, mockStore, mockRouter
- Setup coverage reporting

**3.2.2 API Layer Tests**
- File: `miniprogram/api/__tests__/api.test.js`
- Test request deduplication: same calls share Promise
- Test caching: cache hit prevents API call
- Test error handling: network, 401, 5xx responses
- Test token refresh: 401 triggers refresh, retry succeeds
- Target: >80% coverage for `api.ts`

**3.2.3 Page Logic Tests**
- File: `miniprogram/pages/index/__tests__/index.test.js`
- Test `onLoad` lifecycle: parallel loading, default data
- Test `onShow` lifecycle: smart caching with TTL
- Test load methods: loadBanners, loadPromptTemplates, etc.
- Test error fallback: default data on API failure
- Test image error: onBannerImageError fallback
- Target: >70% coverage for `index.vue`

#### 3.3 Error Monitoring Integration

**3.3.1 Sentry Setup**
- File: `miniprogram/utils/monitor.js`
- Initialize Sentry SDK
- Configure DSN and environment (dev/prod)
- Add breadcrumbs for API calls and user interactions

**3.3.2 Error Reporting Integration**
- Modify `errorHandler.js`: Add `Sentry.captureException()`
- Configure sampling rate and filters
- Test error reporting: verify Sentry receives errors

#### Target Files
- **New**:
  - `miniprogram/types/api.d.ts` - Type definitions
  - `miniprogram/api/__tests__/api.test.js` - API tests
  - `miniprogram/pages/index/__tests__/index.test.js` - Page tests
  - `miniprogram/utils/monitor.js` - Sentry integration
  - `miniprogram/jest.config.js` - Test configuration
  - `miniprogram/tsconfig.json` - TypeScript configuration
- **Modified**:
  - `miniprogram/api/api.js` → `api.ts` - TypeScript migration
  - `miniprogram/utils/errorHandler.js` - Sentry integration

#### Acceptance Criteria
- ✅ TypeScript compilation: 0 errors
- ✅ Unit test coverage: >70% overall
- ✅ All tests passing: 0 failures
- ✅ Error monitoring: Sentry receives test errors
- ✅ IDE provides autocomplete and type checking

#### Deliverables
- Complete TypeScript type definitions
- Migrated API layer with type annotations
- Unit test suite with >70% coverage
- Jest coverage report (HTML + terminal)
- Sentry error monitoring dashboard configured
- Test documentation

---

### Phase 4: E2E Testing & Release (Week 5) - IMPL-004
**Priority**: P0 - Integration Testing and Production Deployment

#### Objectives
- E2E testing on real devices (iOS + Android)
- Performance verification: meet all targets
- User acceptance testing
- Production deployment and monitoring

#### 4.1 E2E Test Planning
- Define test scenarios for 4 core features (happy path + error scenarios)
- Prepare test data: mock users, images, templates, recommendations
- Setup test devices: iOS (iPhone 12+), Android (mainstream models)
- Document test procedures and expected results

#### 4.2 Core Feature E2E Testing

**Credit Balance Testing**
- Login state: Display real balance
- Logout state: Display "--"
- Click navigation: Navigate to points page
- Network error: Display error message, fallback to default

**Banner Carousel Testing**
- Auto-rotation: Every 5 seconds
- Click navigation: Internal pages (uni.navigateTo), external links (copy to clipboard)
- Image display: 100% success rate
- Offline mode: Display default banners

**Prompt Templates Testing**
- Horizontal scroll: Smooth scrolling
- Click navigation: Navigate to AI creation with parameters
- Usage tracking: Silent background tracking
- Offline mode: Display default templates

**Hot Recommendations Testing**
- List display: Pagination support
- Click navigation: Navigate to detail page
- Play tracking: Background tracking
- Cover images: 100% display success
- Offline mode: Display default recommendations

#### 4.3 Error Scenario Testing
- Network failure: Error Toast displays "网络连接失败，请检查网络设置"
- 401 unauthorized: Auto-refresh triggers, original request retries
- 5xx server error: Error Toast displays "服务暂时不可用，请稍后重试"
- Image load failure: Fallback to local images
- Verify: No white screen or crash in any error scenario

#### 4.4 Performance Verification
- **Homepage initial load**: Target <500ms (P0 threshold <600ms)
- **Homepage refresh (onShow)**: Target <100ms (P0 threshold <150ms)
- **Request deduplication rate**: Target >60% (P0 threshold >40%)
- **Cache hit rate**: Target >70% (P0 threshold >50%)
- **Image load success rate**: Target >95% (P0 threshold >85%)
- **Tools**: Chrome DevTools + uni-app performance panel

#### 4.5 User Acceptance Testing (UAT)
- Recruit 5-10 internal users
- Provide test account and test version
- Collect feedback: UI/UX, performance, error handling, features
- Prioritize: P0 blockers fix before release, P1 for next iteration
- Iterate based on feedback

#### 4.6 Production Deployment Preparation
- Update `miniprogram/config/index.js`: Production HTTPS baseUrl
- Update backend `.env`: Production database, Redis, JWT secret
- Verify CORS: Whitelist production domain only
- Configure CDN (if Phase 2B implemented)
- Backup production database
- Prepare rollback plan

#### 4.7 Production Release
- Deploy backend to production server
- Run database migrations
- Upload miniprogram to WeChat platform
- Submit for WeChat review
- After approval: Incremental release (10% → 50% → 100%)
- Monitor production logs and Sentry
- Verify performance metrics in production

#### Target Files
- **New**:
  - `docs/E2E_TEST_REPORT.md` - Test results
  - `docs/PERFORMANCE_REPORT.md` - Performance metrics
  - `docs/UAT_FEEDBACK.md` - User feedback
  - `docs/DEPLOYMENT_CHECKLIST.md` - Deployment steps
- **Modified**:
  - `miniprogram/config/index.js` - Production baseUrl
  - `backend/.env` - Production configuration
  - `README.md` - Deployment documentation

#### Acceptance Criteria
- ✅ E2E tests: All 4 core features work on iOS + Android
- ✅ Error handling: All scenarios have user-friendly messages
- ✅ Performance: All targets met (load <500ms, cache >70%, dedup >60%)
- ✅ UAT: >80% user satisfaction, all P0 issues resolved
- ✅ Production: Miniprogram passes WeChat review, released to 100%
- ✅ Monitoring: No critical errors in 24h post-release

#### Deliverables
- E2E test report with screenshots/video
- Performance verification report
- UAT feedback summary
- Production deployment checklist
- Released miniprogram version
- Post-release monitoring report (24h, 7d)

---

## Technical Specifications

### Performance Targets

| Metric | Baseline | Target | P0 Threshold | Improvement |
|--------|----------|--------|--------------|-------------|
| Homepage initial load | 800ms | 500ms | 600ms | 37.5% ↓ |
| Homepage refresh (onShow) | 180ms | 100ms | 150ms | 44.4% ↓ |
| Request deduplication rate | 0% | 60%+ | 40%+ | +60% |
| Cache hit rate | 0% | 70%+ | 50%+ | +70% |
| Image load success rate | 70% | 95%+ | 85%+ | 35.7% ↑ |
| Error user awareness | 0% | 100% | 80%+ | +100% |

### Code Quality Targets

| Standard | Current | Target | Validation |
|----------|---------|--------|------------|
| TypeScript coverage | 0% | 80% | TSConfig strict mode |
| Unit test coverage | 0% | 70% | Jest coverage report |
| ESLint pass rate | N/A | 100% | CI/CD gate |
| Code review pass | N/A | 100% | PR approval required |

### Security Standards

| Standard | Compliance | Validation |
|----------|-----------|------------|
| HTTPS enforcement | ✅ Required | Production baseUrl HTTPS |
| Token encryption | ⚠️ To implement | Encrypted localStorage |
| Rate limiting | ⚠️ To implement | @nestjs/throttler |
| Input validation | ⚠️ To enhance | class-validator DTOs |

---

## Risk Assessment & Mitigation

### Phase 1 Risks

**Risk 1: Token Refresh Concurrency Conflict**
- **Impact**: Multiple 401 responses trigger multiple token refreshes simultaneously
- **Mitigation**: Implement refresh queue in TokenManager, use `refreshing` flag to serialize refreshes
- **Code**: Refresh queue pattern with Promise resolution for waiting requests

**Risk 2: Request Queue Memory Leak**
- **Impact**: Pending requests not cleaned up, causing memory growth
- **Mitigation**: Implement cleanup() method, remove expired Promises after 60s timeout
- **Code**: Track timestamps, periodic cleanup in finally() block

**Risk 3: Cache Staleness**
- **Impact**: User sees outdated data from cache after changes on other devices
- **Mitigation**:
  - Provide manual pull-to-refresh for users
  - Implement version number mechanism in API responses
  - Force cache clear after critical operations (e.g., modify banner)

### Phase 2 Risks

**Risk 4: Package Size Limit Exceeded**
- **Impact**: WeChat miniprogram limit: 2MB main package, 20MB total
- **Mitigation**:
  - Compress images before adding to static directory
  - Use image optimization tools (e.g., tinypng, imagemin)
  - Consider subpackage strategy if main package >1.5MB

**Risk 5: Database Migration Failure**
- **Impact**: Production data corruption or image path inconsistency
- **Mitigation**:
  - Test migration script on staging environment first
  - Backup production database before migration
  - Implement rollback script with original URL restoration
  - Document migration procedure step-by-step

### Phase 3 Risks

**Risk 6: TypeScript Compilation Issues**
- **Impact**: uni-app build system may not support TypeScript seamlessly
- **Mitigation**:
  - Verify uni-app TypeScript support before migration
  - Configure proper tsconfig.json with module resolution
  - Test incremental migration: migrate one file at a time

**Risk 7: Test Flakiness**
- **Impact**: Intermittent test failures due to timing issues
- **Mitigation**:
  - Use proper async/await and waitFor utilities
  - Mock all external dependencies (API calls, timers)
  - Set reasonable timeouts for async operations

### Phase 4 Risks

**Risk 8: WeChat Review Rejection**
- **Impact**: Delayed production release
- **Mitigation**:
  - Prepare compliance documentation in advance
  - Review WeChat miniprogram guidelines thoroughly
  - Respond quickly to reviewer questions
  - Have backup plan for quick fixes if minor issues found

**Risk 9: Production Performance Regression**
- **Impact**: Performance targets not met in production environment
- **Mitigation**:
  - Monitor key metrics in real-time: load time, error rate
  - Use incremental rollout strategy (10% → 50% → 100%)
  - Rollback criteria: load time >800ms OR error rate >5%
  - Have hotfix process ready: can release urgent fix within 2 hours

---

## Success Metrics

### Immediate Success Indicators (Week 1-2)
- ✅ Request deduplication functional: Network panel shows shared Promises
- ✅ Caching working: API calls reduced by 60-70% on repeated visits
- ✅ Error messages visible: Users see Toast notifications on errors
- ✅ Token refresh working: 401 responses automatically handled

### Mid-term Success Indicators (Week 3-4)
- ✅ Images display 100%: No HTTP protocol errors
- ✅ TypeScript compilation clean: 0 errors
- ✅ Test coverage >70%: Jest report validates
- ✅ Sentry receiving errors: Monitoring dashboard active

### Final Success Indicators (Week 5)
- ✅ E2E tests passed: All features work on iOS + Android
- ✅ Performance targets met: Load <500ms, cache >70%, dedup >60%
- ✅ UAT approved: >80% user satisfaction
- ✅ Production released: 100% rollout successful
- ✅ Stable monitoring: <1% error rate in 7 days post-release

---

## Post-Release Monitoring Plan

### Day 1-7: Intensive Monitoring
- **Sentry Dashboard**: Check every 4 hours for critical errors
- **Performance Metrics**: Daily review of load times and cache hit rates
- **User Feedback**: Monitor WeChat reviews and support tickets
- **Error Budget**: Allow <1% error rate, trigger investigation if >1%

### Week 2-4: Routine Monitoring
- **Weekly Review**: Performance metrics, error trends, user satisfaction
- **Optimization Opportunities**: Identify further improvements based on real usage data
- **Feedback Integration**: Prioritize P1 enhancements for next iteration

### Long-term (Month 2+)
- **Quarterly Review**: Comprehensive performance and quality assessment
- **Feature Planning**: Use analytics to inform next feature development
- **Technical Debt**: Scheduled refactoring and optimization sprints

---

## Appendix: Reference Documentation

### Analysis Context
- **ANALYSIS_RESULTS.md**: Comprehensive 47,000+ word technical analysis
- **context-package.json**: 15 assets, 6 API integration mappings
- **workflow-session.json**: Session metadata and configuration

### Code References
- **Frontend API**: `miniprogram/api/api.js:8-627`
- **Frontend Page**: `miniprogram/pages/index/index.vue:1-1000`
- **Backend Controllers**: 4 modules (credit, banner, prompt-template, hot-recommendation)
- **Database Entities**: 4 tables with complete schema

### External Resources
- [uni-app Performance Guide](https://uniapp.dcloud.net.cn/tutorial/performance.html)
- [WeChat Miniprogram Image Optimization](https://developers.weixin.qq.com/miniprogram/dev/framework/performance/tips/start_optimizeA.html)
- [NestJS Caching Strategy](https://docs.nestjs.com/techniques/caching)
- [JWT Token Refresh Best Practices](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/)

---

**End of Implementation Plan**

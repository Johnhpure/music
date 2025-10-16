# E2E Testing Plan & Report Template

## Project: Miniprogram API Integration - Phase 4

**Test Date**: TBD (Execute after Phase 1-3 completion)
**Test Environment**: WeChat Miniprogram (Development/Test Version)
**Test Devices**: iOS (iPhone 12+), Android (Mainstream Models)
**Testers**: QA Team + 5-10 Internal Users

---

## 1. Test Objective

Validate end-to-end functionality of 4 core features on the miniprogram homepage:
1. **Credit Balance** - Display user credit balance in real-time
2. **Banner Carousel** - Auto-rotate banner images with click navigation
3. **Prompt Templates** - Horizontal scroll prompt cards with AI creation integration
4. **Hot Recommendations** - Music recommendation list with play tracking

### Success Criteria
- ✅ All features work correctly on iOS and Android devices
- ✅ Error scenarios display user-friendly messages (no crashes)
- ✅ Offline mode shows default data with graceful degradation
- ✅ Images display correctly (100% success rate)
- ✅ Cache and request deduplication work as designed

---

## 2. Test Environment Setup

### 2.1 Backend Configuration
- **Environment**: Development/Staging
- **Base URL**: `https://dev-api.example.com` (replace with actual URL)
- **Database**: Populated with test data (see Section 2.3)
- **Authentication**: Test user accounts prepared

### 2.2 Miniprogram Configuration
```javascript
// miniprogram/config/index.js
export default {
  baseUrl: 'https://dev-api.example.com/api', // Test environment
  timeout: 30000,
  enableCache: true,
  enableDeduplication: true
}
```

### 2.3 Test Data Preparation

#### Test User Accounts
| User ID | Username | Password | Credit Balance | Purpose |
|---------|----------|----------|----------------|---------|
| 1001 | test_user_1 | Test123! | 100 | Logged-in state testing |
| 1002 | test_user_2 | Test123! | 0 | Zero balance testing |
| 1003 | test_user_3 | Test123! | 10000 | Large balance display |

#### Banner Test Data (3 banners)
```sql
-- Active banners with local images
INSERT INTO t_banners (id, title, description, image_url, link_url, sort_order, is_active) VALUES
(1, '欢迎使用AI音乐创作', '轻松创作属于你的音乐', '/static/img/banner/banner1.jpg', '', 1, 1),
(2, 'AI辅助音乐创作', '用AI技术让创作更简单', '/static/img/banner/banner2.jpg', '/pages/creation/ai', 2, 1),
(3, '分享你的创作', '与朋友一起享受音乐乐趣', '/static/img/banner/banner3.jpg', 'https://example.com', 3, 1);
```

#### Prompt Template Test Data (5 templates)
```sql
-- Active prompt templates
INSERT INTO t_prompt_templates (id, title, content, icon, category, tags, sort_order, is_active) VALUES
(1, '夏日海滩', '创作一首关于夏日海边的轻快歌曲，描绘阳光、沙滩和欢乐时光', '☀️', '季节', '欢快,夏日', 1, 1),
(2, '甜蜜爱情', '创作一首关于初次相遇的爱情歌曲，描述心动和美好的感觉', '❤️', '情感', '浪漫,甜蜜', 2, 1),
(3, '城市夜景', '创作一首关于都市夜生活的歌曲，描绘城市的霓虹和节奏', '🏙️', '生活', '都市,流行', 3, 1),
(4, '自然风光', '创作一首描绘自然风光的民谣，表达对大自然的热爱', '🍃', '自然', '民谣,舒缓', 4, 1),
(5, '梦境漫游', '创作一首梦幻风格的歌曲，描绘奇妙的梦境和幻想', '🌙', '幻想', '梦幻,电子', 5, 1);
```

#### Hot Recommendation Test Data (8 recommendations)
```sql
-- Hot music recommendations
INSERT INTO t_hot_recommendations (id, title, artist, genre, duration, cover_url, play_count, tags, category, is_hot, sort_order, is_active) VALUES
(1, '夏日海滩', 'AI音乐创作师', '电子', '3:45', '/static/img/covers/cover1.jpg', 2500, '夏日,欢快', '流行', 1, 1, 1),
(2, '电子节拍', 'AI音乐创作师', '电子', '4:12', '/static/img/covers/cover2.jpg', 1800, '电子,节奏', '电子', 1, 2, 1),
(3, '城市夜景', 'AI音乐创作师', '流行', '3:28', '/static/img/covers/cover3.jpg', 1600, '都市,流行', '流行', 1, 3, 1),
(4, '秋日回忆', 'AI音乐创作师', '民谣', '3:55', '/static/img/covers/cover4.jpg', 1500, '温暖,民谣', '民谣', 1, 4, 1),
(5, '山间小路', 'AI音乐创作师', '轻音乐', '4:30', '/static/img/covers/cover5.jpg', 1300, '轻音乐,舒缓', '轻音乐', 1, 5, 1);
```

### 2.4 Test Device Setup

#### iOS Test Devices
- **Device Model**: iPhone 12 or later
- **iOS Version**: 14.0+
- **WeChat Version**: Latest stable version
- **Network**: WiFi + 4G switching

#### Android Test Devices
- **Device Models**:
  - Huawei P40 (EMUI 11)
  - Xiaomi Mi 11 (MIUI 12)
  - OPPO Reno 6 (ColorOS 11)
- **Android Version**: 10.0+
- **WeChat Version**: Latest stable version
- **Network**: WiFi + 4G switching

---

## 3. E2E Test Cases

### 3.1 Feature 1: Credit Balance Display

#### Test Case 1.1: Logged-in User - Display Real Balance
**Prerequisites**: User logged in with test_user_1 (balance: 100)

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Open miniprogram homepage | Credit balance displays "100点" | ⬜ | Screenshot required |
| 2 | Click credit balance button | Navigate to `/pages/user/points` | ⬜ | Page transition smooth |
| 3 | Return to homepage (onShow) | Balance refreshes to latest value | ⬜ | Cache bypassed for balance |
| 4 | Verify API call | Network log shows GET `/user/credit/balance` | ⬜ | Request not deduplicated |

**Evidence**:
- [ ] Screenshot: Credit balance display
- [ ] Video: Click navigation flow
- [ ] Network log: API request/response

---

#### Test Case 1.2: Logged-out User - Display Placeholder
**Prerequisites**: User not logged in (logout or fresh install)

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Open miniprogram homepage | Credit balance displays "--点" | ⬜ | Placeholder for logout state |
| 2 | Click credit balance button | Navigate to `/pages/user/points` | ⬜ | May redirect to login page |
| 3 | Verify no API call | Network log shows NO call to `/user/credit/balance` | ⬜ | No unnecessary API call |

**Evidence**:
- [ ] Screenshot: Placeholder display

---

#### Test Case 1.3: Network Error - Display Current/Cached Balance
**Prerequisites**: User logged in, disconnect network

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Disconnect network (airplane mode) | N/A | ⬜ | Prepare network failure |
| 2 | Open miniprogram homepage | Credit balance displays last known value or "--点" | ⬜ | Fallback to cached value |
| 3 | Observe Toast message | Toast shows "网络连接失败,请检查网络设置" | ⬜ | User-friendly error message |
| 4 | Reconnect network | N/A | ⬜ | Restore network |
| 5 | Pull to refresh (onShow) | Credit balance updates to real value | ⬜ | Auto-refresh on reconnect |

**Evidence**:
- [ ] Screenshot: Error Toast message
- [ ] Video: Offline behavior and recovery

---

### 3.2 Feature 2: Banner Carousel

#### Test Case 2.1: Banner Auto-Rotation (5s Interval)
**Prerequisites**: Homepage loaded with 3 active banners

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Open miniprogram homepage | First banner displays immediately | ⬜ | No delay |
| 2 | Wait 5 seconds | Banner auto-rotates to second banner | ⬜ | Timing: ~5s |
| 3 | Wait 5 seconds | Banner auto-rotates to third banner | ⬜ | Timing: ~5s |
| 4 | Wait 5 seconds | Banner auto-rotates back to first banner (circular) | ⬜ | Infinite loop |
| 5 | Verify indicator dots | Indicator shows current position (1/2/3) | ⬜ | Visual feedback |

**Evidence**:
- [ ] Video: 20s recording showing auto-rotation
- [ ] Screenshot: Indicator dots

---

#### Test Case 2.2: Banner Click Navigation - Internal Page
**Prerequisites**: Banner 2 has `linkUrl: '/pages/creation/ai'`

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Click Banner 2 | Navigate to `/pages/creation/ai` page | ⬜ | Page transition animation |
| 2 | Verify URL | Page URL is `/pages/creation/ai` | ⬜ | Correct routing |
| 3 | Return to homepage | Banner carousel state preserved | ⬜ | No reset to first banner |

**Evidence**:
- [ ] Video: Click navigation flow

---

#### Test Case 2.3: Banner Click Navigation - External Link
**Prerequisites**: Banner 3 has `linkUrl: 'https://example.com'`

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Click Banner 3 | URL copied to clipboard | ⬜ | WeChat limitation |
| 2 | Observe Toast message | Toast shows "链接已复制" | ⬜ | User feedback |
| 3 | Verify clipboard | Paste clipboard shows `https://example.com` | ⬜ | Correct URL |

**Evidence**:
- [ ] Screenshot: Toast message

---

#### Test Case 2.4: Banner Image Display (100% Success Rate)
**Prerequisites**: All banners use local images (`/static/img/banner/`)

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Open miniprogram homepage | All 3 banner images display correctly | ⬜ | No blank/broken images |
| 2 | Inspect image paths | All paths start with `/static/img/banner/` | ⬜ | Local images only |
| 3 | Test image loading speed | All images load within 500ms | ⬜ | No HTTP protocol errors |
| 4 | Verify image error handling | Fallback mechanism tested (see 2.5) | ⬜ | Error handler exists |

**Evidence**:
- [ ] Screenshot: All banners displayed
- [ ] Network log: No HTTP image requests

---

#### Test Case 2.5: Banner Image Error Fallback
**Prerequisites**: Manually simulate image error (delete image file temporarily)

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Delete `banner1.jpg` temporarily | N/A | ⬜ | Simulate image error |
| 2 | Open miniprogram homepage | Banner 1 triggers error event | ⬜ | Image load fails |
| 3 | Observe fallback behavior | Banner 1 displays fallback image from pool | ⬜ | `banner1.jpg` / `banner2.jpg` / `banner3.jpg` |
| 4 | Verify console log | Log shows "Banner图片加载失败" | ⬜ | Error logged |
| 5 | Restore `banner1.jpg` | N/A | ⬜ | Cleanup |

**Evidence**:
- [ ] Screenshot: Fallback image displayed
- [ ] Console log: Error message

---

#### Test Case 2.6: Banner Cache Behavior (TTL: 5min)
**Prerequisites**: Homepage loaded once, banner cache populated

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Open miniprogram homepage | Banners load from API (cache miss) | ⬜ | First load |
| 2 | Note timestamp `T1` | N/A | ⬜ | Record cache set time |
| 3 | Navigate away and return (onShow) at `T1 + 2min` | Banners load from cache (no API call) | ⬜ | Cache hit (within 5min) |
| 4 | Verify network log | NO API call to `/public/banner/list` | ⬜ | Cache used |
| 5 | Navigate away and return (onShow) at `T1 + 6min` | Banners load from API (cache expired) | ⬜ | Cache miss (>5min) |
| 6 | Verify network log | API call to `/public/banner/list` | ⬜ | Cache refresh |

**Evidence**:
- [ ] Network log: Cache hit vs cache miss
- [ ] Console log: CacheManager debug output

---

### 3.3 Feature 3: Prompt Templates

#### Test Case 3.1: Horizontal Scroll and Display
**Prerequisites**: Homepage loaded with 5 active prompt templates

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Open miniprogram homepage | All 5 prompt templates display horizontally | ⬜ | Scrollable list |
| 2 | Scroll left to right | Smooth scrolling animation | ⬜ | No lag |
| 3 | Verify all templates visible | All 5 templates accessible via scroll | ⬜ | No hidden items |
| 4 | Verify template content | Title, icon, description, tags display correctly | ⬜ | Complete data |

**Evidence**:
- [ ] Screenshot: Prompt template list
- [ ] Video: Horizontal scrolling

---

#### Test Case 3.2: Click Template - Navigate with Parameters
**Prerequisites**: Click "夏日海滩" template

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Click "夏日海滩" template | Navigate to `/pages/creation/ai` | ⬜ | Page transition |
| 2 | Verify URL parameters | `prompt=创作一首关于夏日海边的轻快歌曲...` | ⬜ | Prompt content passed |
| 3 | Verify URL parameters | `promptId=1` | ⬜ | Template ID passed |
| 4 | Verify URL parameters | `promptTitle=夏日海滩` | ⬜ | Template title passed |
| 5 | Verify AI creation page | Pre-filled prompt textarea with template content | ⬜ | Parameter integration |

**Evidence**:
- [ ] Screenshot: AI creation page with pre-filled prompt
- [ ] URL: Full URL with parameters

---

#### Test Case 3.3: Usage Tracking (Silent Tracking)
**Prerequisites**: Click any prompt template

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Click "城市夜景" template | Navigate to AI creation page | ⬜ | User action |
| 2 | Verify network log | POST `/public/prompt-template/usage` sent | ⬜ | Silent tracking |
| 3 | Verify request payload | `{ templateId: 3, timestamp: "..." }` | ⬜ | Correct data |
| 4 | Verify NO user feedback | NO Toast/Modal shown for tracking | ⬜ | Silent operation |
| 5 | Verify tracking failure | If API fails, NO error shown to user | ⬜ | Non-blocking |

**Evidence**:
- [ ] Network log: Usage tracking API call

---

#### Test Case 3.4: Cache Behavior (TTL: 10min)
**Prerequisites**: Homepage loaded once, prompt template cache populated

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Open miniprogram homepage | Templates load from API (cache miss) | ⬜ | First load |
| 2 | Note timestamp `T1` | N/A | ⬜ | Record cache set time |
| 3 | Navigate away and return (onShow) at `T1 + 5min` | Templates load from cache (no API call) | ⬜ | Cache hit (within 10min) |
| 4 | Verify network log | NO API call to `/public/prompt-template/list` | ⬜ | Cache used |
| 5 | Navigate away and return (onShow) at `T1 + 11min` | Templates load from API (cache expired) | ⬜ | Cache miss (>10min) |
| 6 | Verify network log | API call to `/public/prompt-template/list` | ⬜ | Cache refresh |

**Evidence**:
- [ ] Network log: Cache hit vs cache miss

---

#### Test Case 3.5: Error Handling - Fallback to Default Data
**Prerequisites**: Backend API `/public/prompt-template/list` returns error

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Simulate API error (disconnect backend) | N/A | ⬜ | Prepare error scenario |
| 2 | Open miniprogram homepage | Toast shows "提示词模板加载失败..." | ⬜ | User-friendly error |
| 3 | Verify fallback data | 5 default templates display | ⬜ | Graceful degradation |
| 4 | Verify default template IDs | IDs start with `default_` prefix | ⬜ | Default data identifiable |
| 5 | Restore backend API | N/A | ⬜ | Cleanup |

**Evidence**:
- [ ] Screenshot: Error Toast + Default templates

---

### 3.4 Feature 4: Hot Recommendations

#### Test Case 4.1: List Display with Pagination
**Prerequisites**: Backend has 8 hot recommendations

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Open miniprogram homepage | First 5 recommendations display | ⬜ | Page 1, pageSize=10 |
| 2 | Verify API request params | `{ page: 1, pageSize: 10, isHot: 1 }` | ⬜ | Correct pagination |
| 3 | Scroll down to bottom | All 8 recommendations visible | ⬜ | No pagination UI (all in page 1) |
| 4 | Verify recommendation content | Title, artist, genre, duration, cover, playCount, tags | ⬜ | Complete data |
| 5 | Verify "热门" badge | Badge displays on all items (isHot=1) | ⬜ | Visual indicator |

**Evidence**:
- [ ] Screenshot: Recommendation list
- [ ] Network log: API request with pagination params

---

#### Test Case 4.2: Click Recommendation - Navigate to Detail
**Prerequisites**: Click "夏日海滩" recommendation

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Click "夏日海滩" music item | Navigate to `/pages/user/work-detail` | ⬜ | Page transition |
| 2 | Verify URL parameters | `id=1`, `title=夏日海滩`, `artist=AI音乐创作师` | ⬜ | Complete params |
| 3 | Verify detail page | Music detail displays correctly | ⬜ | Parameter integration |
| 4 | Verify click tracking | POST `/public/hot-recommendation/track` sent (action: click) | ⬜ | Silent tracking |

**Evidence**:
- [ ] Screenshot: Music detail page
- [ ] Network log: Click tracking API call

---

#### Test Case 4.3: Play Button - Play Tracking
**Prerequisites**: Click play button on "电子节拍" recommendation

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Click play button (🎵 icon) | Toast shows "播放 电子节拍" | ⬜ | Placeholder behavior |
| 2 | Verify play tracking | POST `/public/hot-recommendation/track` sent (action: play) | ⬜ | Silent tracking |
| 3 | Verify request payload | `{ musicId: 2, action: 'play', timestamp: "..." }` | ⬜ | Correct data |
| 4 | Verify NO navigation | Stay on homepage (play button doesn't navigate) | ⬜ | Correct behavior |
| 5 | Verify tracking failure | If API fails, NO error shown to user | ⬜ | Non-blocking |

**Evidence**:
- [ ] Screenshot: Play button Toast
- [ ] Network log: Play tracking API call

---

#### Test Case 4.4: Cover Image Display (100% Success Rate)
**Prerequisites**: All recommendations use local images (`/static/img/covers/`)

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Open miniprogram homepage | All 8 cover images display correctly | ⬜ | No blank/broken images |
| 2 | Inspect image paths | All paths start with `/static/img/covers/` | ⬜ | Local images only |
| 3 | Test image loading speed | All images load within 500ms | ⬜ | No HTTP protocol errors |
| 4 | Verify image error handling | Fallback mechanism tested (see 4.5) | ⬜ | Error handler exists |

**Evidence**:
- [ ] Screenshot: All covers displayed

---

#### Test Case 4.5: Cover Image Error Fallback
**Prerequisites**: Manually simulate image error (delete image file temporarily)

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Delete `cover1.jpg` temporarily | N/A | ⬜ | Simulate image error |
| 2 | Open miniprogram homepage | "夏日海滩" cover triggers error event | ⬜ | Image load fails |
| 3 | Observe fallback behavior | Cover displays default image `/static/img/covers/default.jpg` | ⬜ | Fallback image |
| 4 | Verify console log | Log shows "音乐封面图片加载失败" | ⬜ | Error logged |
| 5 | Restore `cover1.jpg` | N/A | ⬜ | Cleanup |

**Evidence**:
- [ ] Screenshot: Default cover displayed
- [ ] Console log: Error message

---

#### Test Case 4.6: Cache Behavior (TTL: 2min)
**Prerequisites**: Homepage loaded once, recommendation cache populated

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Open miniprogram homepage | Recommendations load from API (cache miss) | ⬜ | First load |
| 2 | Note timestamp `T1` | N/A | ⬜ | Record cache set time |
| 3 | Navigate away and return (onShow) at `T1 + 1min` | Recommendations load from cache (no API call) | ⬜ | Cache hit (within 2min) |
| 4 | Verify network log | NO API call to `/public/hot-recommendation/list` | ⬜ | Cache used |
| 5 | Navigate away and return (onShow) at `T1 + 3min` | Recommendations load from API (cache expired) | ⬜ | Cache miss (>2min) |
| 6 | Verify network log | API call to `/public/hot-recommendation/list` | ⬜ | Cache refresh |

**Evidence**:
- [ ] Network log: Cache hit vs cache miss

---

#### Test Case 4.7: Play Count Display Formatting
**Prerequisites**: Recommendations have various playCount values

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Verify playCount < 1000 | Displays as "500" | ⬜ | No formatting |
| 2 | Verify playCount >= 1000 | Displays as "2.5k" (2500 → 2.5k) | ⬜ | k formatting |
| 3 | Verify playCount >= 1,000,000 | Displays as "1.5M" (1500000 → 1.5M) | ⬜ | M formatting |
| 4 | Verify rounding | 1850 → "1.8k" (not "1.85k") | ⬜ | 1 decimal place |

**Evidence**:
- [ ] Screenshot: Play count display examples

---

## 4. Error Scenario Testing

### 4.1 Network Failure Scenarios

#### Test Case 4.1.1: Disconnect Network - Offline Mode
**Prerequisites**: Homepage loaded once, all caches populated

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Enable airplane mode | Network disconnected | ⬜ | Simulate offline |
| 2 | Open miniprogram homepage | All data loads from cache | ⬜ | Graceful degradation |
| 3 | Verify credit balance | Displays cached value or "--点" | ⬜ | No crash |
| 4 | Verify banners | Cached banners display | ⬜ | No blank screen |
| 5 | Verify prompt templates | Cached templates display | ⬜ | No blank screen |
| 6 | Verify hot recommendations | Cached recommendations display | ⬜ | No blank screen |
| 7 | Observe Toast (optional) | Toast shows "网络连接失败,请检查网络设置" | ⬜ | User feedback |
| 8 | Disable airplane mode | Network reconnected | ⬜ | Restore network |

**Evidence**:
- [ ] Screenshot: Offline mode with cached data
- [ ] Video: Graceful degradation behavior

---

#### Test Case 4.1.2: Slow Network (3G) - Loading Performance
**Prerequisites**: Slow network simulation (3G speed)

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Enable 3G speed simulation | Network slow | ⬜ | Chrome DevTools / Network throttling |
| 2 | Open miniprogram homepage | Loading states show for all features | ⬜ | Visual feedback |
| 3 | Verify credit balance | Loads within 3s (acceptable) | ⬜ | Timeout: 30s |
| 4 | Verify banners | Loads within 5s (acceptable) | ⬜ | Timeout: 30s |
| 5 | Verify prompt templates | Loads within 5s (acceptable) | ⬜ | Timeout: 30s |
| 6 | Verify hot recommendations | Loads within 5s (acceptable) | ⬜ | Timeout: 30s |
| 7 | Verify NO crashes | All features load eventually | ⬜ | No timeout errors |

**Evidence**:
- [ ] Video: Slow network loading behavior

---

### 4.2 Authentication Error Scenarios

#### Test Case 4.2.1: 401 Unauthorized - Token Expiry
**Prerequisites**: User logged in, token expired manually

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Manually expire token (set expiry to past) | Token expired | ⬜ | Simulate 401 |
| 2 | Open miniprogram homepage | Credit balance API returns 401 | ⬜ | API call fails |
| 3 | Observe token refresh | Automatic token refresh triggered | ⬜ | Response interceptor |
| 4 | Verify new token stored | New token in Vuex and local storage | ⬜ | Token refresh success |
| 5 | Verify next API call | Next API call uses new token | ⬜ | Auto-retry (or next request) |
| 6 | Verify NO error Toast | NO Toast shown to user | ⬜ | Silent refresh |
| 7 | Verify credit balance | Balance updates after token refresh | ⬜ | Eventual consistency |

**Evidence**:
- [ ] Network log: 401 response + token refresh + retry
- [ ] Console log: Token refresh logs

**Known Limitation**: Original request may fail (user retries once), but next request succeeds with new token.

---

#### Test Case 4.2.2: 401 Unauthorized - Token Refresh Fails
**Prerequisites**: User logged in, token expired, refresh token also expired

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Manually expire both tokens | Tokens expired | ⬜ | Simulate 401 + refresh failure |
| 2 | Open miniprogram homepage | Credit balance API returns 401 | ⬜ | API call fails |
| 3 | Observe token refresh | Token refresh returns 401 | ⬜ | Refresh fails |
| 4 | Observe Toast | Toast shows "登录已过期,请重新登录" | ⬜ | User-friendly error |
| 5 | Observe navigation | Navigate to `/pages/login/index` | ⬜ | Redirect to login |
| 6 | Verify Vuex state | User logged out in Vuex | ⬜ | State cleanup |
| 7 | Verify local storage | Token removed from local storage | ⬜ | Storage cleanup |

**Evidence**:
- [ ] Screenshot: Toast message
- [ ] Video: Redirect to login page

---

### 4.3 Server Error Scenarios

#### Test Case 4.3.1: 500 Internal Server Error
**Prerequisites**: Backend API `/public/banner/list` returns 500 error

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Simulate 500 error (disconnect backend or inject error) | N/A | ⬜ | Prepare error scenario |
| 2 | Open miniprogram homepage | Banner API returns 500 | ⬜ | API call fails |
| 3 | Observe Toast | Toast shows "服务暂时不可用,请稍后重试" | ⬜ | User-friendly error |
| 4 | Verify fallback data | Default banners display | ⬜ | Graceful degradation |
| 5 | Verify NO crash | Homepage continues to work | ⬜ | No white screen |
| 6 | Restore backend API | N/A | ⬜ | Cleanup |

**Evidence**:
- [ ] Screenshot: Error Toast + Default banners

---

#### Test Case 4.3.2: 503 Service Unavailable
**Prerequisites**: Backend API `/public/hot-recommendation/list` returns 503 error

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Simulate 503 error (backend overload) | N/A | ⬜ | Prepare error scenario |
| 2 | Open miniprogram homepage | Recommendation API returns 503 | ⬜ | API call fails |
| 3 | Observe Toast | Toast shows "服务暂时不可用,请稍后重试" | ⬜ | User-friendly error |
| 4 | Verify fallback data | Default recommendations display | ⬜ | Graceful degradation |
| 5 | Verify NO crash | Homepage continues to work | ⬜ | No white screen |
| 6 | Restore backend API | N/A | ⬜ | Cleanup |

**Evidence**:
- [ ] Screenshot: Error Toast + Default recommendations

---

### 4.4 Image Loading Error Scenarios

#### Test Case 4.4.1: Banner Image 404 Not Found
**Prerequisites**: Banner imageUrl points to non-existent local file

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Modify banner imageUrl to invalid path | `/static/img/banner/invalid.jpg` | ⬜ | Simulate 404 |
| 2 | Open miniprogram homepage | Banner image fails to load | ⬜ | Image error event |
| 3 | Observe fallback behavior | Banner displays fallback image from pool | ⬜ | Fallback mechanism |
| 4 | Verify console log | Log shows "Banner图片加载失败" | ⬜ | Error logged |
| 5 | Verify NO blank image | Fallback image displays instead | ⬜ | No white box |
| 6 | Restore banner imageUrl | N/A | ⬜ | Cleanup |

**Evidence**:
- [ ] Screenshot: Fallback banner image

---

#### Test Case 4.4.2: Music Cover 404 Not Found
**Prerequisites**: Recommendation coverUrl points to non-existent local file

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|--------|-------|
| 1 | Modify cover coverUrl to invalid path | `/static/img/covers/invalid.jpg` | ⬜ | Simulate 404 |
| 2 | Open miniprogram homepage | Cover image fails to load | ⬜ | Image error event |
| 3 | Observe fallback behavior | Cover displays default image `/static/img/covers/default.jpg` | ⬜ | Fallback mechanism |
| 4 | Verify console log | Log shows "音乐封面图片加载失败" | ⬜ | Error logged |
| 5 | Verify NO blank image | Default cover displays instead | ⬜ | No white box |
| 6 | Restore cover coverUrl | N/A | ⬜ | Cleanup |

**Evidence**:
- [ ] Screenshot: Default cover image

---

## 5. Cross-Platform Testing

### 5.1 iOS Platform Tests

#### Test Case 5.1.1: iPhone 12 - All Features
**Device**: iPhone 12, iOS 14.8, WeChat 8.0.30

| Feature | Status | Notes |
|---------|--------|-------|
| Credit Balance Display | ⬜ | |
| Banner Auto-Rotation | ⬜ | |
| Banner Click Navigation | ⬜ | |
| Prompt Template Scroll | ⬜ | |
| Prompt Template Click | ⬜ | |
| Hot Recommendation List | ⬜ | |
| Music Cover Display | ⬜ | |
| Play Button Tracking | ⬜ | |
| Error Handling | ⬜ | |
| Cache Behavior | ⬜ | |

**Evidence**:
- [ ] Video: Full feature walkthrough on iOS

---

#### Test Case 5.1.2: iPhone 13 Pro - Performance Test
**Device**: iPhone 13 Pro, iOS 15.5, WeChat 8.0.30

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Homepage Initial Load | <500ms | ⬜ ms | ⬜ |
| Homepage Refresh (onShow) | <100ms | ⬜ ms | ⬜ |
| Banner Image Load | <300ms | ⬜ ms | ⬜ |
| Recommendation List Load | <400ms | ⬜ ms | ⬜ |
| Cache Hit Rate | >70% | ⬜% | ⬜ |
| Request Deduplication Rate | >60% | ⬜% | ⬜ |

**Evidence**:
- [ ] Performance report: Chrome DevTools timeline

---

### 5.2 Android Platform Tests

#### Test Case 5.2.1: Huawei P40 - All Features
**Device**: Huawei P40, Android 11 (EMUI 11), WeChat 8.0.28

| Feature | Status | Notes |
|---------|--------|-------|
| Credit Balance Display | ⬜ | |
| Banner Auto-Rotation | ⬜ | |
| Banner Click Navigation | ⬜ | |
| Prompt Template Scroll | ⬜ | |
| Prompt Template Click | ⬜ | |
| Hot Recommendation List | ⬜ | |
| Music Cover Display | ⬜ | |
| Play Button Tracking | ⬜ | |
| Error Handling | ⬜ | |
| Cache Behavior | ⬜ | |

**Evidence**:
- [ ] Video: Full feature walkthrough on Android

---

#### Test Case 5.2.2: Xiaomi Mi 11 - Performance Test
**Device**: Xiaomi Mi 11, Android 11 (MIUI 12), WeChat 8.0.28

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Homepage Initial Load | <500ms | ⬜ ms | ⬜ |
| Homepage Refresh (onShow) | <100ms | ⬜ ms | ⬜ |
| Banner Image Load | <300ms | ⬜ ms | ⬜ |
| Recommendation List Load | <400ms | ⬜ ms | ⬜ |
| Cache Hit Rate | >70% | ⬜% | ⬜ |
| Request Deduplication Rate | >60% | ⬜% | ⬜ |

**Evidence**:
- [ ] Performance report: Chrome DevTools timeline

---

#### Test Case 5.2.3: OPPO Reno 6 - All Features
**Device**: OPPO Reno 6, Android 11 (ColorOS 11), WeChat 8.0.28

| Feature | Status | Notes |
|---------|--------|-------|
| Credit Balance Display | ⬜ | |
| Banner Auto-Rotation | ⬜ | |
| Banner Click Navigation | ⬜ | |
| Prompt Template Scroll | ⬜ | |
| Prompt Template Click | ⬜ | |
| Hot Recommendation List | ⬜ | |
| Music Cover Display | ⬜ | |
| Play Button Tracking | ⬜ | |
| Error Handling | ⬜ | |
| Cache Behavior | ⬜ | |

**Evidence**:
- [ ] Video: Full feature walkthrough on OPPO

---

## 6. Performance Verification

### 6.1 Load Time Metrics

#### Measurement Procedure
1. Clear miniprogram cache (restart app)
2. Open WeChat DevTools and enable performance monitoring
3. Navigate to homepage
4. Record timing metrics from DevTools Performance panel

#### Results Table

| Metric | Target | iOS (iPhone 13) | Android (Mi 11) | Status |
|--------|--------|----------------|-----------------|--------|
| **Homepage Initial Load** | <500ms (P0: <600ms) | ⬜ ms | ⬜ ms | ⬜ |
| **Homepage Refresh (onShow)** | <100ms (P0: <150ms) | ⬜ ms | ⬜ ms | ⬜ |
| **Credit Balance API** | <200ms | ⬜ ms | ⬜ ms | ⬜ |
| **Banner API** | <300ms | ⬜ ms | ⬜ ms | ⬜ |
| **Prompt Template API** | <300ms | ⬜ ms | ⬜ ms | ⬜ |
| **Hot Recommendation API** | <400ms | ⬜ ms | ⬜ ms | ⬜ |
| **Banner Image Load (All)** | <500ms | ⬜ ms | ⬜ ms | ⬜ |
| **Cover Image Load (All)** | <500ms | ⬜ ms | ⬜ ms | ⬜ |

**Evidence**:
- [ ] Performance timeline screenshots (iOS + Android)
- [ ] Network waterfall charts

---

### 6.2 Cache Performance Metrics

#### Measurement Procedure
1. First visit: Populate all caches
2. Second visit (within TTL): Measure cache hit rate
3. Third visit (after TTL expiry): Measure cache miss rate

#### Results Table

| Data Type | TTL | Cache Hit Rate (Target) | Actual Hit Rate | Status |
|-----------|-----|------------------------|----------------|--------|
| Credit Balance | 0 (no cache) | 0% | ⬜% | ⬜ |
| Banner | 5min | >70% | ⬜% | ⬜ |
| Prompt Template | 10min | >90% | ⬜% | ⬜ |
| Hot Recommendation | 2min | >60% | ⬜% | ⬜ |
| **Overall Cache Hit Rate** | - | >70% (P0: >50%) | ⬜% | ⬜ |

**Evidence**:
- [ ] CacheManager debug logs
- [ ] Network log: API call frequency

---

### 6.3 Request Deduplication Metrics

#### Measurement Procedure
1. Rapidly switch between tabs 3 times (homepage ↔ creation page)
2. Count total API calls vs deduplicated calls
3. Calculate deduplication rate: (1 - actual_calls / expected_calls) × 100%

#### Results Table

| Scenario | Expected Calls | Actual Calls | Deduplication Rate | Status |
|----------|---------------|--------------|-------------------|--------|
| Rapid Tab Switch (3x) | 12 (4 APIs × 3 switches) | ⬜ | ⬜% | ⬜ |
| onLoad + onShow Concurrent | 4 (4 APIs) | ⬜ | ⬜% | ⬜ |
| Pull-to-Refresh During Pending | 4 (4 APIs) | ⬜ | ⬜% | ⬜ |
| **Overall Deduplication Rate** | - | - | ⬜% (Target: >60%, P0: >40%) | ⬜ |

**Evidence**:
- [ ] RequestQueue debug logs
- [ ] Network log: Deduplication evidence

---

### 6.4 Image Load Success Rate

#### Measurement Procedure
1. Open homepage 10 times (clear cache each time)
2. Count successful image loads vs total image loads
3. Calculate success rate: (successful_loads / total_loads) × 100%

#### Results Table

| Image Type | Total Loads | Successful Loads | Success Rate | Status |
|------------|------------|------------------|-------------|--------|
| Banner Images | 30 (3 × 10) | ⬜ | ⬜% | ⬜ |
| Cover Images | 80 (8 × 10) | ⬜ | ⬜% | ⬜ |
| **Overall Image Load Success Rate** | 110 | ⬜ | ⬜% (Target: >95%, P0: >85%) | ⬜ |

**Evidence**:
- [ ] Console logs: Image error events
- [ ] Screenshots: Image display success

---

## 7. Test Execution Summary

### 7.1 Test Statistics

| Category | Total Cases | Passed | Failed | Blocked | Pass Rate |
|----------|------------|--------|--------|---------|-----------|
| Credit Balance | 3 | ⬜ | ⬜ | ⬜ | ⬜% |
| Banner Carousel | 6 | ⬜ | ⬜ | ⬜ | ⬜% |
| Prompt Templates | 5 | ⬜ | ⬜ | ⬜ | ⬜% |
| Hot Recommendations | 7 | ⬜ | ⬜ | ⬜ | ⬜% |
| Error Scenarios | 6 | ⬜ | ⬜ | ⬜ | ⬜% |
| Cross-Platform | 5 | ⬜ | ⬜ | ⬜ | ⬜% |
| Performance | 4 | ⬜ | ⬜ | ⬜ | ⬜% |
| **Total** | **36** | ⬜ | ⬜ | ⬜ | ⬜% |

### 7.2 Critical Issues Found

| Issue ID | Severity | Description | Steps to Reproduce | Status |
|----------|----------|-------------|-------------------|--------|
| (Example) E2E-001 | P0 | Banner auto-rotation stops after 3 cycles | 1. Open homepage<br>2. Wait 20s<br>3. Observe rotation stops | ⬜ Fixed / ⬜ Open |

### 7.3 Acceptance Criteria Validation

| Criteria | Target | Actual | Status | Notes |
|----------|--------|--------|--------|-------|
| ✅ All features work on iOS + Android | 100% | ⬜% | ⬜ | |
| ✅ Error messages user-friendly, no crashes | 100% | ⬜% | ⬜ | |
| ✅ Homepage load time | <500ms (P0: <600ms) | ⬜ ms | ⬜ | |
| ✅ Cache hit rate | >70% (P0: >50%) | ⬜% | ⬜ | |
| ✅ Request deduplication rate | >60% (P0: >40%) | ⬜% | ⬜ | |
| ✅ Image load success rate | >95% (P0: >85%) | ⬜% | ⬜ | |

### 7.4 Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | ____________ | ____________ | ____/____/____ |
| Product Owner | ____________ | ____________ | ____/____/____ |
| Tech Lead | ____________ | ____________ | ____/____/____ |

---

## 8. Test Evidence Archive

All test evidence (screenshots, videos, logs) should be stored in:
- **Path**: `/docs/evidence/e2e-testing/`
- **Structure**:
  ```
  /docs/evidence/e2e-testing/
  ├── screenshots/
  │   ├── credit-balance/
  │   ├── banner-carousel/
  │   ├── prompt-templates/
  │   └── hot-recommendations/
  ├── videos/
  │   ├── ios-full-walkthrough.mp4
  │   └── android-full-walkthrough.mp4
  ├── network-logs/
  │   ├── cache-hit-example.har
  │   └── deduplication-example.har
  └── performance-reports/
      ├── ios-performance.json
      └── android-performance.json
  ```

---

## 9. Next Steps

After E2E testing completion:
1. ✅ Fix all P0 issues (critical blockers)
2. ✅ Document P1 issues for next iteration
3. ✅ Proceed to User Acceptance Testing (UAT) - see `UAT_FEEDBACK.md`
4. ✅ Prepare production deployment - see `DEPLOYMENT_CHECKLIST.md`
5. ✅ Submit miniprogram to WeChat for review
6. ✅ Monitor production release - see `PERFORMANCE_REPORT.md` (post-release)

---

**Document Version**: 1.0
**Last Updated**: 2025-10-15
**Author**: QA Team

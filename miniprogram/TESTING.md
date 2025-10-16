# Testing and Monitoring Documentation

## Table of Contents
1. [Running Tests](#running-tests)
2. [Writing New Tests](#writing-new-tests)
3. [Test Coverage](#test-coverage)
4. [Error Monitoring](#error-monitoring)
5. [Troubleshooting](#troubleshooting)

---

## Running Tests

### Install Dependencies
```bash
cd miniprogram
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test Suites
```bash
# API layer tests only
npm run test:api

# Page logic tests only
npm run test:pages
```

---

## Writing New Tests

### Test File Structure
- Place tests in `__tests__` directory next to the code being tested
- Name test files with `.test.js` or `.spec.js` extension
- Follow the pattern: `<module-name>.test.js`

### Example Test Structure
```javascript
import { mockMinRequest, createMockResponse } from '../utils/testUtils';

describe('Module Name', () => {
  let minRequest;

  beforeEach(() => {
    minRequest = mockMinRequest();
    jest.clearAllMocks();
  });

  describe('Feature Name', () => {
    test('should do something', async () => {
      // Arrange
      const mockResponse = createMockResponse({ data: 'test' });
      minRequest.get.mockResolvedValue(mockResponse);

      // Act
      const result = await minRequest.get('/test');

      // Assert
      expect(result.code).toBe(200);
      expect(result.data.data).toBe('test');
    });
  });
});
```

### Best Practices
1. **Use descriptive test names**: `test('should load banners from API successfully', ...)`
2. **Follow AAA pattern**: Arrange, Act, Assert
3. **Mock external dependencies**: Use test utilities to mock APIs, store, etc.
4. **Test error cases**: Don't just test happy paths
5. **Keep tests isolated**: Each test should be independent
6. **Use async/await**: Handle promises properly with async/await

### Available Test Utilities

#### mockMinRequest()
Mock the MinRequest API client
```javascript
const minRequest = mockMinRequest();
minRequest.get.mockResolvedValue(mockResponse);
```

#### mockStore(initialState)
Mock Vuex store
```javascript
const store = mockStore({
  user: { id: 1, token: 'test' },
  isLoggedIn: true
});
```

#### mockCacheManager()
Mock cache manager
```javascript
const cacheManager = mockCacheManager();
cacheManager.get.mockReturnValue(cachedData);
```

#### createMockResponse(data, code, message)
Create API response
```javascript
const response = createMockResponse({ balance: 100 });
```

#### flushPromises()
Wait for all promises to resolve
```javascript
await flushPromises();
```

---

## Test Coverage

### Coverage Thresholds
- **Overall**: 70% coverage (branches, functions, lines, statements)
- **API Layer**: 80% coverage minimum
- **Page Logic**: 70% coverage minimum

### Viewing Coverage Reports

#### Terminal Output
```bash
npm run test:coverage
```

#### HTML Report
After running coverage, open:
```
miniprogram/coverage/lcov-report/index.html
```

### Coverage Metrics
- **Statements**: Percentage of code statements executed
- **Branches**: Percentage of conditional branches tested
- **Functions**: Percentage of functions called
- **Lines**: Percentage of code lines executed

### Improving Coverage
1. Identify uncovered code: Check HTML report
2. Add tests for uncovered paths: Focus on error cases and edge cases
3. Test all branches: Ensure if/else and switch cases are tested
4. Test async code: Use proper async/await patterns

---

## Error Monitoring

### Sentry Integration

#### Configuration
Edit `miniprogram/utils/monitor.js`:
```javascript
const SENTRY_CONFIG = {
  dsn: 'YOUR_SENTRY_DSN_HERE', // Replace with your Sentry DSN
  environment: process.env.NODE_ENV || 'development',
  release: process.env.APP_VERSION || '1.0.0',
  sampleRate: 0.2, // 20% sampling in production
  debug: false
};
```

#### Initialize Monitoring
In `app.js` onLaunch:
```javascript
import errorMonitor from './utils/monitor';

App({
  onLaunch() {
    // Initialize error monitoring
    errorMonitor.init();

    // Set user context when user logs in
    const user = this.$store.getters.user;
    if (user) {
      errorMonitor.setUser(user);
    }
  }
});
```

#### Set User Context
When user logs in:
```javascript
import errorMonitor from '@/utils/monitor';

// After successful login
errorMonitor.setUser({
  id: user.id,
  username: user.username,
  email: user.email,
  creditBalance: user.creditBalance
});

// On logout
errorMonitor.clearUser();
```

#### Track Events
```javascript
import errorMonitor from '@/utils/monitor';

// Track API calls
errorMonitor.trackAPICall('/api/music/create', 'POST', 200, 350);

// Track user interactions
errorMonitor.trackInteraction('button_click', { buttonId: 'create_music' });

// Track page navigation
errorMonitor.trackNavigation('/pages/index', '/pages/creation');

// Capture custom messages
errorMonitor.captureMessage('User completed tutorial', 'info');
```

#### Error Capture
Errors are automatically captured through the errorHandler integration.

Manual error capture:
```javascript
import errorMonitor from '@/utils/monitor';

try {
  // Code that might throw
} catch (error) {
  errorMonitor.captureException(error, {
    customContext: 'Additional info'
  });
}
```

#### Testing Error Monitoring
```javascript
import errorMonitor from '@/utils/monitor';

// Send test error to Sentry
errorMonitor.testErrorReporting();
```

### Viewing Errors in Sentry
1. Log in to Sentry dashboard
2. Navigate to your project
3. View issues, breadcrumbs, and context
4. Set up alerts for critical errors

### Local Error Logs
View locally stored errors (for debugging):
```javascript
import errorMonitor from '@/utils/monitor';

// Get all error logs
const logs = errorMonitor.getErrorLogs();
console.log('Error logs:', logs);

// Clear error logs
errorMonitor.clearErrorLogs();
```

---

## Troubleshooting

### Common Issues

#### Tests Not Running
**Problem**: `npm test` fails with module not found
**Solution**: Ensure all dependencies are installed
```bash
cd miniprogram
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors
**Problem**: Type errors in test files
**Solution**: Check `tsconfig.json` and ensure types are properly imported
```javascript
import type { APIResponse } from '@/types/api.d';
```

#### Mock Not Working
**Problem**: Mock functions not being called
**Solution**: Clear mocks before each test
```javascript
beforeEach(() => {
  jest.clearAllMocks();
});
```

#### Coverage Too Low
**Problem**: Coverage below threshold
**Solution**:
1. Run coverage report to see uncovered lines
2. Add tests for error cases and edge cases
3. Test all conditional branches

#### Async Test Failures
**Problem**: Tests failing due to timing issues
**Solution**: Use `async/await` properly
```javascript
test('async test', async () => {
  const result = await someAsyncFunction();
  expect(result).toBeDefined();
});
```

### Debugging Tests

#### Run Single Test
```bash
npm test -- --testNamePattern="should load banners"
```

#### Run Single File
```bash
npm test -- api/__tests__/api.test.js
```

#### Enable Verbose Output
```bash
npm test -- --verbose
```

#### Debug with Node Inspector
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '14'
      - run: cd miniprogram && npm install
      - run: cd miniprogram && npm test
      - run: cd miniprogram && npm run test:coverage
      - uses: codecov/codecov-action@v2
        with:
          directory: ./miniprogram/coverage
```

---

## Additional Resources
- [Jest Documentation](https://jestjs.io/)
- [Vue Test Utils](https://vue-test-utils.vuejs.org/)
- [Sentry Documentation](https://docs.sentry.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

**Last Updated**: 2025-01-15
**Maintained By**: Development Team

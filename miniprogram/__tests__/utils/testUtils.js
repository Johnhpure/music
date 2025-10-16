/**
 * Test Utilities
 * Helper functions and mocks for unit testing
 */

/**
 * Mock MinRequest for API testing
 */
export function mockMinRequest() {
  return {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: jest.fn(),
      response: jest.fn()
    },
    setConfig: jest.fn()
  };
}

/**
 * Mock Vuex Store
 */
export function mockStore(initialState = {}) {
  const defaultState = {
    user: null,
    userCreditBalance: 0,
    isLoggedIn: false,
    ...initialState
  };

  return {
    state: defaultState,
    getters: {
      user: defaultState.user,
      userCreditBalance: defaultState.userCreditBalance,
      isLoggedIn: defaultState.isLoggedIn
    },
    commit: jest.fn((mutation, payload) => {
      if (mutation === 'login') {
        defaultState.user = payload;
        defaultState.isLoggedIn = true;
      } else if (mutation === 'logout') {
        defaultState.user = null;
        defaultState.isLoggedIn = false;
      }
    }),
    dispatch: jest.fn()
  };
}

/**
 * Mock Router
 */
export function mockRouter() {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    go: jest.fn(),
    back: jest.fn()
  };
}

/**
 * Create mock API response
 */
export function createMockResponse(data, code = 200, message = 'Success') {
  return {
    code,
    message,
    data
  };
}

/**
 * Create mock API error response
 */
export function createMockError(message, code = 500) {
  return {
    code,
    message,
    data: null
  };
}

/**
 * Wait for async operations
 */
export function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

/**
 * Mock request queue
 */
export function mockRequestQueue() {
  const queue = new Map();

  return {
    enqueue: jest.fn((key, requestFn) => {
      if (queue.has(key)) {
        return queue.get(key);
      }
      const promise = requestFn();
      queue.set(key, promise);
      promise.finally(() => queue.delete(key));
      return promise;
    }),
    generateKey: jest.fn((prefix, params) => {
      return `${prefix}_${JSON.stringify(params || {})}`;
    }),
    clear: jest.fn(() => {
      queue.clear();
    })
  };
}

/**
 * Mock error handler
 */
export function mockErrorHandler() {
  return {
    handle: jest.fn((error, context) => {
      console.error(`Error in ${context}:`, error);
    }),
    report: jest.fn()
  };
}

/**
 * Mock token manager
 */
export function mockTokenManager() {
  return {
    getToken: jest.fn(() => 'mock-token'),
    setToken: jest.fn(),
    refreshToken: jest.fn(() => Promise.resolve('new-mock-token')),
    clearToken: jest.fn()
  };
}

/**
 * Mock cache manager
 */
export function mockCacheManager() {
  const cache = new Map();

  return {
    get: jest.fn((key, type) => {
      return cache.get(`${type}_${key}`);
    }),
    set: jest.fn((key, value, type) => {
      cache.set(`${type}_${key}`, value);
    }),
    shouldRefresh: jest.fn(() => true),
    clear: jest.fn(() => {
      cache.clear();
    })
  };
}

/**
 * Create Vue component wrapper for testing
 */
export function createWrapper(component, options = {}) {
  const Vue = require('vue').default;
  const defaultOptions = {
    store: mockStore(),
    mocks: {
      $minApi: {},
      $router: mockRouter(),
      $route: { path: '/', query: {} }
    },
    ...options
  };

  return new Vue({
    ...component,
    ...defaultOptions
  });
}

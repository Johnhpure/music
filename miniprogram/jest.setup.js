/**
 * Jest Setup File
 * Configures the test environment and provides global mocks
 */

// Mock uni-app global APIs
global.uni = {
  // Navigation
  navigateTo: jest.fn((options) => {
    if (options.success) options.success();
  }),
  redirectTo: jest.fn((options) => {
    if (options.success) options.success();
  }),
  switchTab: jest.fn((options) => {
    if (options.success) options.success();
  }),
  navigateBack: jest.fn((options) => {
    if (options.success) options.success();
  }),

  // Network
  request: jest.fn(),
  uploadFile: jest.fn(),
  downloadFile: jest.fn(),

  // Storage
  getStorageSync: jest.fn(() => null),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  clearStorageSync: jest.fn(),
  getStorage: jest.fn((options) => {
    if (options.success) options.success({ data: null });
  }),
  setStorage: jest.fn((options) => {
    if (options.success) options.success();
  }),
  removeStorage: jest.fn((options) => {
    if (options.success) options.success();
  }),
  clearStorage: jest.fn((options) => {
    if (options.success) options.success();
  }),

  // UI
  showToast: jest.fn((options) => {
    if (options.success) options.success();
  }),
  showModal: jest.fn((options) => {
    if (options.success) options.success({ confirm: true });
  }),
  showLoading: jest.fn(),
  hideLoading: jest.fn(),

  // Clipboard
  setClipboardData: jest.fn((options) => {
    if (options.success) options.success();
  }),

  // System info
  getSystemInfoSync: jest.fn(() => ({
    platform: 'devtools',
    system: 'iOS 10.0.1',
    version: '7.0.4',
    SDKVersion: '2.10.0',
    windowWidth: 375,
    windowHeight: 667
  }))
};

// Mock wx (WeChat) global APIs
global.wx = global.uni;

// Mock getApp
global.getApp = jest.fn(() => ({
  globalData: {}
}));

// Mock getCurrentPages
global.getCurrentPages = jest.fn(() => []);

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn()
};

/**
 * TokenManager - Token Lifecycle Management and Auto-Refresh
 * Purpose: Auto-refresh JWT token to avoid frequent user re-login
 * Strategy: 401 response triggers token refresh, queue prevents concurrent refresh conflicts
 */
class TokenManager {
  constructor() {
    this.refreshing = false;           // Flag to prevent concurrent refreshes
    this.refreshQueue = [];             // Queue for waiting requests
    this.tokenKey = 'token';           // Storage key for token
    this.tokenExpiryKey = 'token_expiry'; // Storage key for expiry timestamp
  }

  /**
   * Get current token from storage
   * @returns {string|null} - JWT token or null
   */
  getToken() {
    try {
      return uni.getStorageSync(this.tokenKey) || null;
    } catch (e) {
      console.error('❌ Failed to get token:', e);
      return null;
    }
  }

  /**
   * Set token in storage
   * @param {string} token - JWT token
   * @param {number} expiresIn - Token expiry time in seconds (optional)
   */
  setToken(token, expiresIn = null) {
    try {
      uni.setStorageSync(this.tokenKey, token);

      // Calculate and store expiry timestamp if provided
      if (expiresIn) {
        const expiryTimestamp = Date.now() + (expiresIn * 1000);
        uni.setStorageSync(this.tokenExpiryKey, expiryTimestamp);
        console.log(`💾 Token stored with expiry: ${new Date(expiryTimestamp).toLocaleString()}`);
      } else {
        console.log('💾 Token stored without expiry info');
      }
    } catch (e) {
      console.error('❌ Failed to set token:', e);
    }
  }

  /**
   * Clear token from storage
   */
  clearToken() {
    try {
      uni.removeStorageSync(this.tokenKey);
      uni.removeStorageSync(this.tokenExpiryKey);
      console.log('🗑️ Token cleared');
    } catch (e) {
      console.error('❌ Failed to clear token:', e);
    }
  }

  /**
   * Check if token is expired or about to expire
   * @returns {boolean} - True if token needs refresh
   */
  needsRefresh() {
    try {
      const expiryTimestamp = uni.getStorageSync(this.tokenExpiryKey);

      if (!expiryTimestamp) {
        // No expiry info, assume token is valid
        return false;
      }

      const now = Date.now();
      const timeUntilExpiry = expiryTimestamp - now;

      // Refresh if less than 10% of token lifetime remaining
      // Assume default token lifetime is 7 days (604800000ms)
      const refreshThreshold = 604800000 * 0.1; // 10% of 7 days

      const needsRefresh = timeUntilExpiry < refreshThreshold;

      if (needsRefresh) {
        console.log(`⏰ Token needs refresh (expires in ${Math.round(timeUntilExpiry / 1000 / 60)} minutes)`);
      }

      return needsRefresh;
    } catch (e) {
      console.error('❌ Failed to check token expiry:', e);
      return false;
    }
  }

  /**
   * Refresh token (with concurrency protection)
   * @param {object} api - API client instance
   * @returns {Promise<string>} - New token
   */
  async refreshToken(api) {
    // If already refreshing, wait for existing refresh to complete
    if (this.refreshing) {
      console.log('⏳ Token refresh already in progress, queuing request...');
      return new Promise((resolve, reject) => {
        this.refreshQueue.push({ resolve, reject });
      });
    }

    this.refreshing = true;
    console.log('🔄 Starting token refresh...');

    try {
      // Call refresh token API with proper error handling
      if (!api || !api.refreshToken) {
        throw new Error('Invalid API reference for token refresh');
      }
      const response = await api.refreshToken();

      if (response.code === 200 && response.data && response.data.token) {
        const newToken = response.data.token;
        const expiresIn = response.data.expiresIn || null;

        // Store new token
        this.setToken(newToken, expiresIn);

        console.log('✅ Token refreshed successfully');

        // Resolve all queued requests with new token
        this.refreshQueue.forEach(({ resolve }) => resolve(newToken));
        this.refreshQueue = [];

        return newToken;
      } else {
        throw new Error('Invalid refresh token response');
      }
    } catch (error) {
      console.error('❌ Token refresh failed:', error);

      // Reject all queued requests
      this.refreshQueue.forEach(({ reject }) => reject(error));
      this.refreshQueue = [];

      // Clear invalid token
      this.clearToken();

      throw error;
    } finally {
      this.refreshing = false;
    }
  }

  /**
   * Handle 401 response with automatic token refresh and request retry
   * @param {function} retryRequest - The original request function to retry
   * @param {object} api - API client instance
   * @returns {Promise<any>} - Result of retried request
   */
  async handle401(retryRequest, api) {
    console.log('🔐 Handling 401 unauthorized response...');

    try {
      // Refresh token
      const newToken = await this.refreshToken(api);

      console.log('🔄 Retrying original request with new token...');

      // Retry original request with new token
      const result = await retryRequest();

      console.log('✅ Request retry successful');
      return result;
    } catch (error) {
      console.error('❌ 401 handling failed:', error);

      // Redirect to login page
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/login/login'
        });
      }, 1500);

      throw error;
    }
  }

  /**
   * Get refresh queue status (for debugging)
   * @returns {object} - Queue status
   */
  getStatus() {
    return {
      refreshing: this.refreshing,
      queueLength: this.refreshQueue.length,
      hasToken: !!this.getToken(),
      needsRefresh: this.needsRefresh()
    };
  }
}

// Export singleton instance
const tokenManager = new TokenManager();
export default tokenManager;

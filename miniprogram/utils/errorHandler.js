/**
 * APIErrorHandler - Unified Error Handling Center
 * Purpose: Provide user-friendly error messages instead of console logging
 * Strategy: Categorize errors and show appropriate UI feedback
 * Integrated with Sentry for real-time error monitoring
 */
import errorMonitor from './monitor'

class APIErrorHandler {
  constructor() {
    // User-friendly error messages (Chinese)
    this.errorMessages = {
      network: '网络连接失败,请检查网络设置',
      unauthorized: '登录已过期,请重新登录',
      serverError: '服务暂时不可用,请稍后重试',
      timeout: '请求超时,请重试',
      unknown: '操作失败,请重试'
    };

    // Error reporting enabled flag
    this.reportingEnabled = true;

    // Sentry monitoring integration
    this.monitor = errorMonitor;
  }

  /**
   * Handle API errors with user-friendly feedback
   * @param {object} error - Error object from API call
   * @param {string} context - Context description (e.g., 'loadBanners')
   * @returns {object} - Processed error information
   */
  handle(error, context = 'API调用') {
    console.error(`❌ Error in ${context}:`, error);

    // Network error detection
    if (this.isNetworkError(error)) {
      this.showToast(this.errorMessages.network);
      this.reportError('network_error', context, error);
      return { type: 'network', handled: true };
    }

    // 401 Unauthorized
    if (error.statusCode === 401 || error.status === 401) {
      this.showToast(this.errorMessages.unauthorized);
      this.redirectToLogin();
      this.reportError('unauthorized', context, error);
      return { type: 'unauthorized', handled: true };
    }

    // 5xx Server errors
    if (this.isServerError(error)) {
      this.showToast(this.errorMessages.serverError);
      this.reportError('server_error', context, error);
      return { type: 'server', handled: true };
    }

    // Timeout error
    if (this.isTimeoutError(error)) {
      this.showToast(this.errorMessages.timeout);
      this.reportError('timeout_error', context, error);
      return { type: 'timeout', handled: true };
    }

    // Unknown error
    this.showToast(this.errorMessages.unknown);
    this.reportError('unknown_error', context, error);
    return { type: 'unknown', handled: true };
  }

  /**
   * Detect network errors
   * @param {object} error - Error object
   * @returns {boolean} - True if network error
   */
  isNetworkError(error) {
    if (!error) return false;

    // UniApp network error patterns
    return (
      error.errMsg && (
        error.errMsg.includes('network') ||
        error.errMsg.includes('timeout') ||
        error.errMsg.includes('fail')
      )
    ) || error.code === 'NETWORK_ERROR';
  }

  /**
   * Detect server errors (5xx)
   * @param {object} error - Error object
   * @returns {boolean} - True if server error
   */
  isServerError(error) {
    if (!error) return false;
    const statusCode = error.statusCode || error.status || 0;
    return statusCode >= 500 && statusCode < 600;
  }

  /**
   * Detect timeout errors
   * @param {object} error - Error object
   * @returns {boolean} - True if timeout error
   */
  isTimeoutError(error) {
    if (!error) return false;
    return (
      error.errMsg && error.errMsg.includes('timeout')
    ) || error.code === 'TIMEOUT';
  }

  /**
   * Show user-friendly Toast message
   * @param {string} message - Message to display
   */
  showToast(message) {
    try {
      uni.showToast({
        title: message,
        icon: 'none',
        duration: 3000
      });
    } catch (e) {
      console.error('❌ Failed to show toast:', e);
    }
  }

  /**
   * Redirect to login page (for 401 errors)
   */
  redirectToLogin() {
    try {
      // Delay to allow toast to show
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/login/login'
        });
      }, 1500);
    } catch (e) {
      console.error('❌ Failed to redirect to login:', e);
    }
  }

  /**
   * Report error to monitoring platform (Sentry integration)
   * @param {string} type - Error type
   * @param {string} context - Error context
   * @param {object} error - Error details
   */
  reportError(type, context, error) {
    if (!this.reportingEnabled) {
      return;
    }

    // Error reporting payload
    const errorReport = {
      type,
      context,
      timestamp: new Date().toISOString(),
      error: {
        message: error.errMsg || error.message || 'Unknown error',
        statusCode: error.statusCode || error.status,
        data: error.data
      }
    };

    console.log('📊 Error Report:', errorReport);

    // Integrate with Sentry
    try {
      // Create Error object if not already an Error
      const errorObj = error instanceof Error
        ? error
        : new Error(error.errMsg || error.message || 'Unknown error');

      // Add additional context
      const sentryContext = {
        errorType: type,
        context,
        statusCode: error.statusCode || error.status,
        errorData: error.data
      };

      // Capture exception with Sentry
      this.monitor.captureException(errorObj, sentryContext);
    } catch (sentryError) {
      console.error('Failed to report error to Sentry:', sentryError);
    }

    // Store locally for debugging
    this.storeLocalErrorLog(errorReport);
  }

  /**
   * Store error log locally (for debugging)
   * @param {object} errorReport - Error report object
   */
  storeLocalErrorLog(errorReport) {
    try {
      const logs = uni.getStorageSync('error_logs') || [];
      logs.push(errorReport);

      // Keep only last 50 errors
      if (logs.length > 50) {
        logs.shift();
      }

      uni.setStorageSync('error_logs', logs);
    } catch (e) {
      console.error('❌ Failed to store error log:', e);
    }
  }

  /**
   * Get stored error logs (for debugging)
   * @returns {array} - Array of error logs
   */
  getErrorLogs() {
    try {
      return uni.getStorageSync('error_logs') || [];
    } catch (e) {
      console.error('❌ Failed to get error logs:', e);
      return [];
    }
  }

  /**
   * Clear stored error logs
   */
  clearErrorLogs() {
    try {
      uni.removeStorageSync('error_logs');
      console.log('✅ Error logs cleared');
    } catch (e) {
      console.error('❌ Failed to clear error logs:', e);
    }
  }

  /**
   * Enable/disable error reporting
   * @param {boolean} enabled - True to enable, false to disable
   */
  setReportingEnabled(enabled) {
    this.reportingEnabled = enabled;
    console.log(`📊 Error reporting ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Export singleton instance
const errorHandler = new APIErrorHandler();
export default errorHandler;

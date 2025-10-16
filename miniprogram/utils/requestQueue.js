/**
 * RequestQueue - Request Deduplication Queue
 * Purpose: Prevent duplicate API requests during rapid page transitions
 * Strategy: Map-based queue with Promise sharing
 */
class RequestQueue {
  constructor() {
    this.pending = new Map(); // Key: request URL, Value: { promise, timestamp }
    this.cleanupInterval = 60000; // Cleanup expired promises every 60 seconds
    this.startCleanupTimer();
  }

  /**
   * Enqueue a request with deduplication
   * @param {string} key - Unique identifier for the request (typically URL + params)
   * @param {function} requestFn - The actual request function to execute
   * @returns {Promise} - Shared promise for duplicate requests
   */
  async enqueue(key, requestFn) {
    // Request deduplication: Same key shares Promise result
    if (this.pending.has(key)) {
      const cached = this.pending.get(key);
      console.log(`🔄 Request deduplication: Reusing existing promise for key: ${key}`);
      return cached.promise;
    }

    console.log(`📤 New request: ${key}`);

    const promise = requestFn()
      .finally(() => {
        // Cleanup: Remove from queue after completion
        this.pending.delete(key);
        console.log(`✅ Request completed and removed from queue: ${key}`);
      });

    // Store promise with timestamp
    this.pending.set(key, {
      promise,
      timestamp: Date.now()
    });

    return promise;
  }

  /**
   * Generate unique cache key from base key and params
   * @param {string} baseKey - Base key (e.g., 'banner', 'promptTemplate')
   * @param {object} params - Request parameters
   * @returns {string} - Composite key
   */
  generateKey(baseKey, params = {}) {
    if (!params || Object.keys(params).length === 0) {
      return baseKey;
    }
    const paramStr = JSON.stringify(params);
    return `${baseKey}_${paramStr}`;
  }

  /**
   * Cleanup expired promises (memory leak prevention)
   * Remove promises older than 60 seconds
   */
  cleanup() {
    const now = Date.now();
    const expired = [];

    for (const [key, { timestamp }] of this.pending) {
      if (now - timestamp > this.cleanupInterval) {
        expired.push(key);
      }
    }

    if (expired.length > 0) {
      console.log(`🗑️ Cleaning up ${expired.length} expired requests`);
      expired.forEach(key => this.pending.delete(key));
    }
  }

  /**
   * Start periodic cleanup timer
   */
  startCleanupTimer() {
    // Cleanup every 60 seconds
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), this.cleanupInterval);
    }
  }

  /**
   * Clear all pending requests (for testing or manual cleanup)
   */
  clear() {
    console.log(`🗑️ Clearing all ${this.pending.size} pending requests`);
    this.pending.clear();
  }

  /**
   * Get queue status (for debugging)
   */
  getStatus() {
    return {
      pendingCount: this.pending.size,
      pendingKeys: Array.from(this.pending.keys())
    };
  }
}

// Export singleton instance
const requestQueue = new RequestQueue();
export default requestQueue;

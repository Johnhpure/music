/**
 * CacheManager - Tiered Caching Manager
 * Purpose: Reduce network requests based on data mutation frequency
 * Strategy: Different TTL for different data types
 */
class CacheManager {
  constructor() {
    this.cache = new Map();

    // TTL configuration (in milliseconds)
    this.ttl = {
      banner: 5 * 60 * 1000,           // 5 minutes (low mutation frequency)
      promptTemplate: 10 * 60 * 1000,  // 10 minutes (very low mutation)
      hotRecommendation: 2 * 60 * 1000,// 2 minutes (medium mutation)
      creditBalance: 0                  // No cache (high mutation, real-time required)
    };
  }

  /**
   * Generate cache key from URL and params
   * @param {string} key - Base key (e.g., 'banner', 'promptTemplate')
   * @param {object} params - Request parameters
   * @returns {string} - Composite cache key
   */
  generateKey(key, params = {}) {
    if (!params || Object.keys(params).length === 0) {
      return key;
    }
    const paramStr = JSON.stringify(params);
    return `${key}_${paramStr}`;
  }

  /**
   * Get cached data if not expired
   * @param {string} key - Cache key
   * @param {string} type - Data type (banner, promptTemplate, hotRecommendation)
   * @returns {any|null} - Cached data or null if expired/not found
   */
  get(key, type) {
    const cached = this.cache.get(key);

    if (!cached) {
      console.log(`❌ Cache miss: ${key}`);
      return null;
    }

    const age = Date.now() - cached.timestamp;
    const ttl = this.ttl[type] || 0;

    if (ttl === 0 || age > ttl) {
      // Cache expired
      this.cache.delete(key);
      console.log(`⏰ Cache expired: ${key} (age: ${Math.round(age / 1000)}s, TTL: ${Math.round(ttl / 1000)}s)`);
      return null;
    }

    console.log(`✅ Cache hit: ${key} (age: ${Math.round(age / 1000)}s / ${Math.round(ttl / 1000)}s)`);
    return cached.data;
  }

  /**
   * Set cache data with timestamp
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {string} type - Data type for TTL lookup
   */
  set(key, data, type) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      type
    });

    console.log(`💾 Cache stored: ${key} (type: ${type}, TTL: ${Math.round(this.ttl[type] / 1000)}s)`);
  }

  /**
   * Check if cache should be refreshed
   * @param {string} key - Cache key
   * @param {string} type - Data type
   * @returns {boolean} - True if data needs refresh
   */
  shouldRefresh(key, type) {
    const cached = this.cache.get(key);

    if (!cached) {
      return true; // No cache, needs refresh
    }

    const age = Date.now() - cached.timestamp;
    const ttl = this.ttl[type] || 0;

    const needsRefresh = ttl === 0 || age > ttl;

    if (needsRefresh) {
      console.log(`🔄 Should refresh: ${key} (age: ${Math.round(age / 1000)}s > TTL: ${Math.round(ttl / 1000)}s)`);
    } else {
      console.log(`⏭️ Skip refresh: ${key} (age: ${Math.round(age / 1000)}s < TTL: ${Math.round(ttl / 1000)}s)`);
    }

    return needsRefresh;
  }

  /**
   * Clear specific cache entry
   * @param {string} key - Cache key to clear
   */
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`🗑️ Cache deleted: ${key}`);
    }
  }

  /**
   * Clear all cache of a specific type
   * @param {string} type - Data type to clear
   */
  clearType(type) {
    const keysToDelete = [];

    for (const [key, value] of this.cache) {
      if (value.type === type) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`🗑️ Cleared ${keysToDelete.length} cache entries of type: ${type}`);
  }

  /**
   * Clear all cache (for manual pull-to-refresh)
   */
  clearAll() {
    const count = this.cache.size;
    this.cache.clear();
    console.log(`🗑️ Cleared all cache (${count} entries)`);
  }

  /**
   * Get cache statistics (for debugging)
   */
  getStats() {
    const stats = {
      totalEntries: this.cache.size,
      byType: {}
    };

    for (const [key, value] of this.cache) {
      const type = value.type;
      if (!stats.byType[type]) {
        stats.byType[type] = 0;
      }
      stats.byType[type]++;
    }

    return stats;
  }
}

// Export singleton instance
const cacheManager = new CacheManager();
export default cacheManager;

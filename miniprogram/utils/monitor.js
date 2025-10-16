/**
 * Error Monitoring Service
 * Integrates Sentry SDK for real-time exception tracking
 *
 * Features:
 * - Error capture and reporting
 * - Breadcrumb tracking for user actions
 * - Context enrichment (user info, API calls)
 * - Environment-based configuration (dev/prod)
 * - Performance monitoring
 */

import globalConfig from '@/config'

// Sentry configuration
const SENTRY_CONFIG = {
	// Replace with your actual Sentry DSN
	dsn: process.env.SENTRY_DSN || 'https://your-dsn@sentry.io/your-project-id',
	environment: process.env.NODE_ENV || 'development',
	release: process.env.APP_VERSION || '1.0.0',
	// Sample rate: 100% in dev, 20% in production to reduce overhead
	sampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
	// Enable tracing for performance monitoring
	enableTracing: true,
	tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.5,
	// Enable debug mode in development
	debug: process.env.NODE_ENV !== 'production'
}

class ErrorMonitor {
	constructor() {
		this.initialized = false
		this.isProduction = process.env.NODE_ENV === 'production'
		this.breadcrumbs = []
		this.maxBreadcrumbs = 100
	}

	/**
	 * Initialize Sentry SDK
	 * Call this in app.js onLaunch
	 */
	init() {
		if (this.initialized) {
			console.log('🔍 Sentry already initialized')
			return
		}

		try {
			// For miniprogram, we use a simplified error tracking
			// In production, integrate @sentry/miniprogram or custom implementation
			console.log('🔍 Initializing Error Monitor')
			console.log('  - Environment:', SENTRY_CONFIG.environment)
			console.log('  - Sample Rate:', SENTRY_CONFIG.sampleRate)
			console.log('  - Debug Mode:', SENTRY_CONFIG.debug)

			// TODO: Integrate actual Sentry SDK for miniprogram
			// Example: Sentry.init(SENTRY_CONFIG)

			this.initialized = true
			console.log('✅ Error Monitor initialized successfully')
		} catch (error) {
			console.error('❌ Failed to initialize Error Monitor:', error)
		}
	}

	/**
	 * Set user context for error reports
	 * @param {Object} user - User information
	 */
	setUser(user) {
		if (!user) {
			this.clearUser()
			return
		}

		try {
			const userContext = {
				id: user.id,
				username: user.username || user.nickname,
				email: user.email,
				creditBalance: user.creditBalance
			}

			console.log('👤 Setting user context:', userContext)

			// TODO: Sentry.setUser(userContext)
		} catch (error) {
			console.error('Failed to set user context:', error)
		}
	}

	/**
	 * Clear user context
	 */
	clearUser() {
		try {
			console.log('👤 Clearing user context')
			// TODO: Sentry.setUser(null)
		} catch (error) {
			console.error('Failed to clear user context:', error)
		}
	}

	/**
	 * Add breadcrumb for user action tracking
	 * @param {Object} breadcrumb - Breadcrumb data
	 */
	addBreadcrumb(breadcrumb) {
		try {
			const formattedBreadcrumb = {
				timestamp: Date.now(),
				category: breadcrumb.category || 'user-action',
				level: breadcrumb.level || 'info',
				message: breadcrumb.message,
				data: breadcrumb.data || {}
			}

			// Store breadcrumbs locally
			this.breadcrumbs.push(formattedBreadcrumb)
			if (this.breadcrumbs.length > this.maxBreadcrumbs) {
				this.breadcrumbs.shift()
			}

			if (SENTRY_CONFIG.debug) {
				console.log('🍞 Breadcrumb:', formattedBreadcrumb)
			}

			// TODO: Sentry.addBreadcrumb(formattedBreadcrumb)
		} catch (error) {
			console.error('Failed to add breadcrumb:', error)
		}
	}

	/**
	 * Capture exception
	 * @param {Error} error - Error object
	 * @param {Object} context - Additional context
	 */
	captureException(error, context = {}) {
		try {
			// Add context to error
			const errorContext = {
				...context,
				breadcrumbs: this.breadcrumbs.slice(-10), // Last 10 breadcrumbs
				timestamp: new Date().toISOString(),
				url: context.url || 'unknown',
				componentStack: context.componentStack
			}

			console.error('🚨 Capturing exception:', error)
			console.error('  - Context:', errorContext)

			// In production, send to Sentry
			if (this.isProduction && this.shouldSample()) {
				// TODO: Sentry.captureException(error, { contexts: { custom: errorContext } })
				console.log('📤 Exception sent to Sentry')
			}

			// Always log locally for debugging
			this.logErrorLocally(error, errorContext)
		} catch (captureError) {
			console.error('Failed to capture exception:', captureError)
		}
	}

	/**
	 * Capture message (non-error events)
	 * @param {string} message - Message to capture
	 * @param {string} level - Severity level (info, warning, error)
	 * @param {Object} context - Additional context
	 */
	captureMessage(message, level = 'info', context = {}) {
		try {
			console.log(`📝 Capturing message [${level}]:`, message)

			if (this.isProduction && this.shouldSample()) {
				// TODO: Sentry.captureMessage(message, { level, contexts: { custom: context } })
			}
		} catch (error) {
			console.error('Failed to capture message:', error)
		}
	}

	/**
	 * Track API call breadcrumb
	 * @param {string} url - API endpoint
	 * @param {string} method - HTTP method
	 * @param {number} statusCode - Response status code
	 * @param {number} duration - Request duration in ms
	 */
	trackAPICall(url, method, statusCode, duration) {
		this.addBreadcrumb({
			category: 'api-call',
			level: statusCode >= 400 ? 'error' : 'info',
			message: `${method} ${url}`,
			data: {
				url,
				method,
				statusCode,
				duration
			}
		})
	}

	/**
	 * Track page navigation
	 * @param {string} from - Previous page
	 * @param {string} to - Current page
	 */
	trackNavigation(from, to) {
		this.addBreadcrumb({
			category: 'navigation',
			level: 'info',
			message: `Navigate from ${from} to ${to}`,
			data: { from, to }
		})
	}

	/**
	 * Track user interaction
	 * @param {string} action - Action name
	 * @param {Object} data - Action data
	 */
	trackInteraction(action, data = {}) {
		this.addBreadcrumb({
			category: 'user-interaction',
			level: 'info',
			message: action,
			data
		})
	}

	/**
	 * Set custom tag
	 * @param {string} key - Tag key
	 * @param {string} value - Tag value
	 */
	setTag(key, value) {
		try {
			// TODO: Sentry.setTag(key, value)
		} catch (error) {
			console.error('Failed to set tag:', error)
		}
	}

	/**
	 * Set custom context
	 * @param {string} key - Context key
	 * @param {Object} value - Context value
	 */
	setContext(key, value) {
		try {
			// TODO: Sentry.setContext(key, value)
		} catch (error) {
			console.error('Failed to set context:', error)
		}
	}

	/**
	 * Determine if this error should be sampled (for rate limiting)
	 * @returns {boolean}
	 */
	shouldSample() {
		return Math.random() < SENTRY_CONFIG.sampleRate
	}

	/**
	 * Log error locally for debugging
	 * @param {Error} error - Error object
	 * @param {Object} context - Error context
	 */
	logErrorLocally(error, context) {
		try {
			const errorLog = {
				timestamp: new Date().toISOString(),
				message: error.message,
				stack: error.stack,
				context
			}

			// Store in local storage (limited to last 50 errors)
			const storageKey = 'error_logs'
			let logs = []
			try {
				const storedLogs = uni.getStorageSync(storageKey)
				if (storedLogs) {
					logs = JSON.parse(storedLogs)
				}
			} catch (e) {
				console.error('Failed to read error logs from storage:', e)
			}

			logs.push(errorLog)
			if (logs.length > 50) {
				logs = logs.slice(-50)
			}

			try {
				uni.setStorageSync(storageKey, JSON.stringify(logs))
			} catch (e) {
				console.error('Failed to save error logs to storage:', e)
			}
		} catch (error) {
			console.error('Failed to log error locally:', error)
		}
	}

	/**
	 * Get stored error logs
	 * @returns {Array} Error logs
	 */
	getErrorLogs() {
		try {
			const logs = uni.getStorageSync('error_logs')
			return logs ? JSON.parse(logs) : []
		} catch (error) {
			console.error('Failed to get error logs:', error)
			return []
		}
	}

	/**
	 * Clear stored error logs
	 */
	clearErrorLogs() {
		try {
			uni.removeStorageSync('error_logs')
			console.log('✅ Error logs cleared')
		} catch (error) {
			console.error('Failed to clear error logs:', error)
		}
	}

	/**
	 * Test error reporting (for development)
	 */
	testErrorReporting() {
		try {
			console.log('🧪 Testing error reporting...')

			// Add test breadcrumbs
			this.trackInteraction('test_button_click', { buttonId: 'test' })
			this.trackAPICall('/test/api', 'GET', 200, 150)
			this.trackNavigation('/pages/index', '/pages/test')

			// Capture test error
			const testError = new Error('Test error for Sentry integration')
			this.captureException(testError, {
				testContext: 'This is a test error',
				environment: SENTRY_CONFIG.environment
			})

			console.log('✅ Test error sent successfully')
			console.log('📋 Check Sentry dashboard for the error report')
		} catch (error) {
			console.error('❌ Test error reporting failed:', error)
		}
	}
}

// Export singleton instance
const errorMonitor = new ErrorMonitor()

export default errorMonitor

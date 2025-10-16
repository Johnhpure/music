/**
 * 本地开发环境配置
 * 仅本机访问
 */

/**
 * ip地址或域名
 */
const ipAddress = 'http://localhost:3000/api'

/**
 * 文件访问地址
 */
const fileAddr = 'http://localhost:3000/fileUpload/'

/**
 * api前缀
 */
const apiPrefix = '/api'

/**
 * 针对不同平台的baseUrl
 */
const getBaseUrl = () => {
	// #ifdef H5
	return apiPrefix
	// #endif
	// #ifndef H5
	return ipAddress
	// #endif
}

export default {
	/**
	 * 针对不同平台的baseUrl
	 */
	baseUrl: getBaseUrl(),
	fileAddr
}

/**
 * 局域网开发环境配置
 * Ubuntu IP: 192.168.1.118
 * 用于在局域网内其他设备上编译和调试微信小程序
 */

/**
 * ip地址或域名
 */
const ipAddress = 'http://192.168.1.118:3000/api'

/**
 * 文件访问地址
 */
const fileAddr = 'http://192.168.1.118:3000/fileUpload/'

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

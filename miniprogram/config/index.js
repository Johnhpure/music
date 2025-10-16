/**
 * AI音乐平台后端地址
 */
// 开发环境 - 本地局域网
const devApiAddress = 'http://192.168.1.118:3000'
// 备用地址
const localhostApiAddress = 'http://localhost:8080'
// 生产环境  
const prodApiAddress = 'http://your-production-domain.com'

// 当前使用的地址
const ipAddress = devApiAddress

// 文件访问地址
const fileAddr = `${ipAddress}/file/`
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
	return ipAddress + apiPrefix
	// #endif
}
export default {
	/**
	 * 针对不同平台的baseUrl
	 */
	baseUrl: getBaseUrl(),
	
	/**
	 * 文件访问地址
	 */
	fileAddr: fileAddr,
	
	/**
	 * 开发环境API地址
	 */
	devApiAddress: devApiAddress,
	
	/**
	 * 生产环境API地址
	 */
	prodApiAddress: prodApiAddress
}

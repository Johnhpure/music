/**
 * ip地址或域名
 */
const ipAddress = 'http://localhost:3000/api'
// const ipAddress = 'http://8.141.1.164:8012/api'
// 文件访问地址
const fileAddr = 'http://localhost:3000/fileUpload/'
// const fileAddr = 'http://8.141.1.164:8012/fileUpload/'
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

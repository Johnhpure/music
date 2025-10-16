/**
 * 微信小程序授权登录工具类 - 2024升级版
 * 基于微信官方最新文档实现：
 * 1. 支持新的手机号快速验证组件 (open-type="getPhoneNumber")
 * 2. 支持用户基本信息获取 (wx.getUserProfile)
 * 3. 完全兼容旧版本API
 * 4. 支持真实接口调用和开发模式模拟
 */

export default class WeChatAuthNew {
  
  /**
   * 检查用户是否已登录
   * @returns {Boolean} 是否已登录
   */
  static isLoggedIn() {
    try {
      const userInfo = uni.getStorageSync('userInfo')
      const token = uni.getStorageSync('token')
      const isLoggedIn = !!(userInfo && token)
      
      console.log('🔍 登录状态检查:', {
        hasUserInfo: !!userInfo,
        hasToken: !!token,
        isLoggedIn: isLoggedIn,
        userInfo: userInfo ? { 
          nickname: userInfo.nickname, 
          userId: userInfo.userId,
          hasPhone: !!userInfo.phone 
        } : null
      })
      
      return isLoggedIn
    } catch (e) {
      console.error('检查登录状态失败:', e)
      return false
    }
  }

  /**
   * 获取用户信息
   * @returns {Object|null} 用户信息
   */
  static getUserInfo() {
    try {
      return uni.getStorageSync('userInfo')
    } catch (e) {
      return null
    }
  }

  /**
   * 微信授权登录主流程 - 新版本
   * @param {Object} options 配置选项
   * @param {Boolean} options.needUserInfo 是否需要获取用户基本信息 (头像、昵称)
   * @param {Boolean} options.needPhone 是否需要获取手机号
   * @param {String} options.phoneCode 手机号授权code (如果已获取)
   * @param {String} options.desc 获取用户信息的描述
   * @returns {Promise} 登录结果
   */
  static async login(options = {}) {
    const { 
      needUserInfo = true, 
      needPhone = false, 
      phoneCode = null,
      desc = '用于完善用户资料和提供个性化服务' 
    } = options
    
    try {
      console.log('🔐 开始微信登录流程...', {
        needUserInfo,
        needPhone,
        hasPhoneCode: !!phoneCode
      })

      // 第一步：调用 wx.login 获取 code
      const loginCode = await this.getWxLoginCode()
      console.log('✅ 获取登录code成功:', loginCode)

      // 第二步：获取用户基本信息 (如果需要)
      let userProfile = null
      if (needUserInfo) {
        try {
          userProfile = await this.getUserProfile(desc)
          console.log('✅ 获取用户基本信息成功:', userProfile.userInfo.nickName)
        } catch (e) {
          console.log('⚠️ 用户取消授权或获取用户信息失败，仅使用code登录', e.message)
        }
      }

      // 第三步：获取手机号 (如果需要且未提供phoneCode)
      let phoneAuthCode = phoneCode
      if (needPhone && !phoneAuthCode) {
        try {
          phoneAuthCode = await this.getPhoneNumber()
          console.log('✅ 获取手机号授权成功')
        } catch (e) {
          console.log('⚠️ 获取手机号失败，继续登录流程', e.message)
        }
      }

      // 第四步：调用后端接口
      console.log('🌐 调用后端登录接口...')
      const loginResult = await this.callBackendAuth({
        code: loginCode,
        phoneCode: phoneAuthCode,
        nickName: userProfile?.userInfo?.nickName,
        avatarUrl: userProfile?.userInfo?.avatarUrl,
        gender: userProfile?.userInfo?.gender,
        country: userProfile?.userInfo?.country,
        province: userProfile?.userInfo?.province,
        city: userProfile?.userInfo?.city,
        language: userProfile?.userInfo?.language,
      })
      console.log('✅ 后端接口调用成功')

      // 第五步：保存登录信息到本地
      this.saveLoginInfo(loginResult)
      
      console.log('🎉 微信登录完成!', {
        isNewUser: loginResult.userInfo.isNewUser,
        hasPhone: loginResult.userInfo.hasPhone
      })
      
      return {
        success: true,
        userInfo: loginResult.userInfo,
        token: loginResult.token,
        isNewUser: loginResult.userInfo.isNewUser,
        hasPhone: loginResult.userInfo.hasPhone,
        message: loginResult.userInfo.isNewUser ? '注册并登录成功' : '登录成功'
      }

    } catch (error) {
      console.error('❌ 微信登录失败:', error)
      return {
        success: false,
        error: error.message || '登录失败',
        message: '登录失败，请重试'
      }
    }
  }

  /**
   * 调用 wx.login 获取临时登录凭证 code
   * @returns {Promise<String>} 登录code
   */
  static getWxLoginCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            resolve(res.code)
          } else {
            reject(new Error('获取登录code失败: ' + res.errMsg))
          }
        },
        fail: (err) => {
          reject(new Error('wx.login调用失败: ' + err.errMsg))
        }
      })
    })
  }

  /**
   * 调用 wx.getUserProfile 获取用户基本信息
   * @param {String} desc 获取用户信息的描述
   * @returns {Promise<Object>} 用户信息
   */
  static getUserProfile(desc = '用于完善用户资料和提供个性化服务') {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: desc,
        success: (res) => {
          resolve(res)
        },
        fail: (err) => {
          reject(new Error('用户拒绝授权或获取用户信息失败: ' + err.errMsg))
        }
      })
    })
  }

  /**
   * 获取手机号授权 (需要用户点击按钮触发)
   * 注意: 这个方法只是展示逻辑，实际需要在button组件的bindgetphonenumber事件中调用
   * @returns {Promise<String>} 手机号授权code
   */
  static getPhoneNumber() {
    return new Promise((resolve, reject) => {
      // 实际上这个方法不能直接调用，需要通过button组件触发
      // 这里提供一个占位实现
      reject(new Error('手机号授权需要通过button组件的open-type="getPhoneNumber"触发'))
    })
  }

  /**
   * 处理手机号授权回调 (由button组件的bindgetphonenumber事件调用)
   * @param {Object} event 微信回调事件对象
   * @returns {Object} 处理结果
   */
  static handlePhoneNumberAuth(event) {
    console.log('📱 处理手机号授权回调:', event.detail)
    
    if (event.detail.errMsg === 'getPhoneNumber:ok' && event.detail.code) {
      return {
        success: true,
        code: event.detail.code,
        message: '手机号授权成功'
      }
    } else if (event.detail.errno === 1400001) {
      return {
        success: false,
        error: 'quota_exceeded',
        message: '该功能使用次数已达当前小程序上限，暂时无法使用'
      }
    } else {
      return {
        success: false,
        error: event.detail.errMsg || 'unknown_error',
        message: '手机号授权失败'
      }
    }
  }

  /**
   * 调用后端新的授权接口
   * @param {Object} params 授权参数
   * @returns {Promise<Object>} 登录结果
   */
  static async callBackendAuth(params) {
    try {
      // 通过当前页面实例获取$minApi
      const pages = getCurrentPages()
      let minApi = null
      
      if (pages.length > 0) {
        const currentPage = pages[pages.length - 1]
        minApi = currentPage.$vm?.$minApi || currentPage.$minApi
      }
      
      // 如果还是获取不到，使用uni.request直接调用
      if (!minApi) {
        console.log('使用uni.request直接调用授权接口')
        return await this.callBackendAuthDirect(params)
      }

      // 使用封装的API接口 (需要在api.js中添加新接口)
      const response = await minApi.wechatAuth ? 
        minApi.wechatAuth(params) : 
        minApi.wechatLogin(params) // 降级到旧接口

      if (response.code !== 200) {
        throw new Error(response.message || '登录接口返回错误')
      }

      // 转换后端返回的数据结构
      const backendData = response.data
      return {
        userInfo: {
          userId: backendData.userId,
          username: backendData.username,
          nickname: backendData.nickname,
          avatar: backendData.avatar,
          phone: backendData.phone,
          creditBalance: backendData.creditBalance,
          isNewUser: backendData.isNewUser,
          hasPhone: backendData.hasPhone,
        },
        token: backendData.token,
        expiresIn: backendData.expiresIn
      }

    } catch (error) {
      console.error('后端授权接口调用失败:', error)
      
      // 开发模式下自动降级到模拟数据
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 开发模式：使用模拟数据')
        return this.getMockAuthData(params)
      }
      
      throw error
    }
  }

  /**
   * 直接调用后端授权接口（备用方法）
   * @param {Object} params 授权参数
   * @returns {Promise<Object>} 登录结果
   */
  static async callBackendAuthDirect(params) {
    try {
      const response = await uni.request({
        url: 'http://192.168.1.118:3000/api/auth/wechat-auth', // 新的授权接口
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: params,
        timeout: 10000 // 10秒超时
      })

      const [error, res] = response
      if (error) {
        console.error('网络请求失败:', error.errMsg)
        
        // 开发模式下返回模拟数据
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 开发模式：网络失败，使用模拟数据')
          return this.getMockAuthData(params)
        }
        
        throw new Error('网络请求失败: ' + error.errMsg)
      }

      if (res.statusCode !== 200) {
        throw new Error('服务器响应错误: ' + res.statusCode)
      }

      if (res.data.code !== 200) {
        throw new Error(res.data.message || '登录接口返回错误')
      }

      // 转换后端返回的数据结构
      const backendData = res.data.data
      return {
        userInfo: {
          userId: backendData.userId,
          username: backendData.username,
          nickname: backendData.nickname,
          avatar: backendData.avatar,
          phone: backendData.phone,
          creditBalance: backendData.creditBalance,
          isNewUser: backendData.isNewUser,
          hasPhone: backendData.hasPhone,
        },
        token: backendData.token,
        expiresIn: backendData.expiresIn
      }

    } catch (error) {
      console.error('直接授权接口调用失败:', error)
      
      // 开发模式下的兜底处理
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 开发模式：接口失败，使用模拟数据')
        return this.getMockAuthData(params)
      }
      
      throw error
    }
  }

  /**
   * 获取模拟授权数据（开发模式使用）
   * @param {Object} params 授权参数
   * @returns {Object} 模拟登录结果
   */
  static getMockAuthData(params) {
    const mockUser = {
      userId: 'mock_user_' + Date.now(),
      username: 'wx_user_' + Date.now(),
      nickname: params.nickName || '音乐创作者',
      avatar: params.avatarUrl || '/static/img/profile.svg',
      phone: params.phoneCode ? '13800138000' : null, // 如果有phoneCode就模拟手机号
      creditBalance: 50,
      isNewUser: true,
      hasPhone: !!params.phoneCode,
    }

    return {
      userInfo: mockUser,
      token: 'mock_jwt_token_' + Date.now(),
      expiresIn: 604800
    }
  }

  /**
   * 保存登录信息到本地存储
   * @param {Object} loginResult 登录结果
   */
  static saveLoginInfo(loginResult) {
    try {
      // 保存用户信息
      uni.setStorageSync('userInfo', loginResult.userInfo)
      
      // 保存 token
      uni.setStorageSync('token', loginResult.token)
      
      // 保存登录时间
      uni.setStorageSync('loginTime', Date.now())
      
      // 更新 Vuex 状态
      this.updateVuexState(loginResult)
      
    } catch (error) {
      console.error('保存登录信息失败:', error)
    }
  }

  /**
   * 更新 Vuex 用户状态
   * @param {Object} loginResult 登录结果
   */
  static updateVuexState(loginResult) {
    try {
      // 获取 Vue 实例和 store
      const pages = getCurrentPages()
      if (pages.length > 0) {
        const currentPage = pages[pages.length - 1]
        // 尝试多种方式获取store
        const store = currentPage.$vm?.$store || currentPage.$store || uni.$store || getApp().$store
        
        if (store) {
          store.commit('login', {
            ...loginResult.userInfo,
            token: loginResult.token,
            // 兼容现有代码结构
            ApiToken: loginResult.token
          })
          console.log('✅ Vuex状态更新成功')
        } else {
          console.warn('⚠️ 无法获取store，跳过Vuex状态更新')
        }
      }
    } catch (error) {
      console.error('更新Vuex状态失败:', error)
    }
  }

  /**
   * 显示微信授权弹窗
   * @param {Object} options 配置选项
   * @returns {Promise} 登录结果
   */
  static showAuthModal(options = {}) {
    const {
      title = '微信授权登录',
      content = '需要获取您的微信信息和手机号来完善账户资料，是否同意授权？',
      needUserInfo = true,
      needPhone = true,
    } = options

    return new Promise((resolve, reject) => {
      uni.showModal({
        title: title,
        content: content,
        confirmText: '授权登录',
        cancelText: '暂不授权',
        success: async (res) => {
          if (res.confirm) {
            try {
              const loginResult = await this.login({ 
                needUserInfo,
                needPhone,
                desc: '用于完善用户资料和提供个性化服务'
              })
              
              if (loginResult.success) {
                const message = loginResult.hasPhone ? 
                  '授权登录成功' : 
                  '登录成功，可稍后绑定手机号'
                
                uni.showToast({
                  title: message,
                  icon: 'success',
                  duration: 2000
                })
                resolve(loginResult)
              } else {
                throw new Error(loginResult.message)
              }
            } catch (error) {
              const errorMsg = error.message || '授权失败'
              uni.showToast({
                title: errorMsg,
                icon: 'none',
                duration: 2000
              })
              reject(error)
            }
          } else {
            reject(new Error('用户取消授权'))
          }
        }
      })
    })
  }

  /**
   * 创作功能授权检查
   * @param {String} creationType 创作类型
   * @returns {Promise<Boolean>} 是否已授权
   */
  static async checkCreationAuth(creationType = 'create') {
    if (this.isLoggedIn()) {
      return true
    }

    try {
      await this.showAuthModal({
        title: '登录后开始创作',
        content: '音乐创作功能需要登录后使用，我们将获取您的基本信息来提供个性化服务',
        needUserInfo: true,
        needPhone: false, // 创作功能暂不强制要求手机号
      })
      return true
    } catch (error) {
      console.log('用户取消创作授权')
      return false
    }
  }

  /**
   * 购买功能授权检查 (需要手机号)
   * @returns {Promise<Boolean>} 是否已授权
   */
  static async checkPurchaseAuth() {
    const userInfo = this.getUserInfo()
    
    if (this.isLoggedIn() && userInfo?.phone) {
      return true
    }

    try {
      await this.showAuthModal({
        title: '手机号验证',
        content: '购买点数需要验证手机号确保账户安全，请授权获取您的微信绑定手机号',
        needUserInfo: !this.isLoggedIn(),
        needPhone: true,
      })
      return true
    } catch (error) {
      console.log('用户取消购买授权')
      return false
    }
  }

  /**
   * 退出登录
   */
  static logout() {
    try {
      // 清除本地存储
      uni.removeStorageSync('userInfo')
      uni.removeStorageSync('token')
      uni.removeStorageSync('loginTime')
      
      // 清除 Vuex 状态
      const pages = getCurrentPages()
      if (pages.length > 0) {
        const currentPage = pages[pages.length - 1]
        const store = currentPage.$vm?.$store || currentPage.$store || uni.$store || getApp().$store
        
        if (store) {
          store.commit('logout')
        }
      }
      
      console.log('✅ 退出登录成功')
      
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  }

  // 为了兼容，保留旧版本方法
  static async checkCreationLogin(creationType) {
    return await this.checkCreationAuth(creationType)
  }

  static async checkProfileLogin() {
    return this.isLoggedIn() || await this.checkCreationAuth('profile')
  }

  static async checkPurchaseLogin() {
    return await this.checkPurchaseAuth()
  }
}
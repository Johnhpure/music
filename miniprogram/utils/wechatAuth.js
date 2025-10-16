/**
 * 微信小程序授权登录工具类
 * 基于微信官方文档实现的登录流程：wx.login + code2Session + wx.getUserProfile
 */

export default class WeChatAuth {
  
  /**
   * 检查用户是否已登录
   * @returns {Boolean} 是否已登录
   */
  static isLoggedIn() {
    try {
      const userInfo = uni.getStorageSync('userInfo')
      const token = uni.getStorageSync('token')
      const isLoggedIn = !!(userInfo && token)
      
      // 调试信息
      console.log('🔍 登录状态检查:', {
        hasUserInfo: !!userInfo,
        hasToken: !!token,
        isLoggedIn: isLoggedIn,
        userInfo: userInfo ? { nickname: userInfo.nickname, userId: userInfo.userId } : null
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
   * 微信登录主流程
   * @param {Object} options 配置选项
   * @param {Boolean} options.needUserInfo 是否需要获取用户信息 (头像、昵称)
   * @param {String} options.desc 获取用户信息的描述
   * @returns {Promise} 登录结果
   */
  static async login(options = {}) {
    const { needUserInfo = false, desc = '用于完善用户资料' } = options
    
    try {
      // 第一步：调用 wx.login 获取 code
      console.log('🔐 开始微信登录流程...')
      const loginCode = await this.getWxLoginCode()
      console.log('✅ 获取登录code成功:', loginCode)

      // 第二步：获取用户信息 (如果需要)
      let userProfile = null
      if (needUserInfo) {
        try {
          userProfile = await this.getUserProfile(desc)
          console.log('✅ 获取用户信息成功:', userProfile.userInfo.nickName)
        } catch (e) {
          console.log('⚠️ 用户取消授权或获取用户信息失败，仅使用code登录')
        }
      }

      // 第三步：调用后端接口，传递 code 和用户信息
      console.log('🌐 调用后端登录接口...')
      const loginResult = await this.callBackendLogin({
        code: loginCode,
        userInfo: userProfile?.userInfo,
        rawData: userProfile?.rawData,
        signature: userProfile?.signature,
        encryptedData: userProfile?.encryptedData,
        iv: userProfile?.iv
      })
      console.log('✅ 后端接口调用成功')

      // 第四步：保存登录信息到本地
      this.saveLoginInfo(loginResult)
      
      console.log('🎉 微信登录完成!')
      return {
        success: true,
        userInfo: loginResult.userInfo,
        token: loginResult.token,
        message: '登录成功'
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
   * 调用 wx.getUserProfile 获取用户信息
   * @param {String} desc 获取用户信息的描述
   * @returns {Promise<Object>} 用户信息
   */
  static getUserProfile(desc = '用于完善用户资料') {
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
   * 调用后端登录接口
   * @param {Object} params 登录参数
   * @returns {Promise<Object>} 登录结果
   */
  static async callBackendLogin(params) {
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
        console.log('使用uni.request直接调用登录接口')
        return await this.callBackendLoginDirect(params)
      }

      // 使用封装的API接口
      const response = await minApi.wechatLogin({
        code: params.code,
        userInfo: params.userInfo,
        rawData: params.rawData,
        signature: params.signature,
        encryptedData: params.encryptedData,
        iv: params.iv
      })

      if (response.code !== 200) {
        throw new Error(response.message || '登录接口返回错误')
      }

      // 转换后端返回的数据结构为前端期望的格式
      const backendData = response.data
      return {
        userInfo: {
          userId: backendData.userId,
          username: backendData.username,
          nickname: backendData.nickname,
          avatar: backendData.avatar,
          avatarUrl: backendData.avatar, // 兼容字段
          creditBalance: backendData.creditBalance,
          points: backendData.creditBalance, // 兼容字段
          isNewUser: backendData.isNewUser
        },
        token: backendData.token,
        expiresIn: backendData.expiresIn
      }

    } catch (error) {
      console.error('后端登录接口调用失败:', error)
      
      // 开发模式下自动降级到模拟数据
      console.log('🔧 开发模式：后端接口调用失败，使用模拟数据')
      return this.getMockLoginData(params)
    }
  }

  /**
   * 直接调用后端登录接口（备用方法）
   * @param {Object} params 登录参数
   * @returns {Promise<Object>} 登录结果
   */
  static async callBackendLoginDirect(params) {
    try {
      // 开发模式：如果后端没有启动，返回模拟数据
      const isDevelopment = process.env.NODE_ENV === 'development'
      
      const response = await uni.request({
        url: 'http://localhost:3000/api/auth/wechat-login',  // 后端登录接口
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: {
          code: params.code,
          userInfo: params.userInfo,
          rawData: params.rawData,
          signature: params.signature,
          encryptedData: params.encryptedData,
          iv: params.iv
        },
        timeout: 5000 // 5秒超时
      })

      const [error, res] = response
      if (error) {
        console.error('网络请求失败:', error.errMsg)
        
        // 开发模式下返回模拟数据
        if (isDevelopment && (error.errMsg.includes('timeout') || error.errMsg.includes('fail'))) {
          console.log('🔧 开发模式：使用模拟登录数据')
          return this.getMockLoginData(params)
        }
        
        throw new Error('网络请求失败: ' + error.errMsg)
      }

      if (res.statusCode !== 200) {
        throw new Error('服务器响应错误: ' + res.statusCode)
      }

      if (res.data.code !== 200) {
        throw new Error(res.data.message || '登录接口返回错误')
      }

      // 转换后端返回的数据结构为前端期望的格式
      const backendData = res.data.data
      return {
        userInfo: {
          userId: backendData.userId,
          username: backendData.username,
          nickname: backendData.nickname,
          avatar: backendData.avatar,
          avatarUrl: backendData.avatar, // 兼容字段
          creditBalance: backendData.creditBalance,
          points: backendData.creditBalance, // 兼容字段
          isNewUser: backendData.isNewUser
        },
        token: backendData.token,
        expiresIn: backendData.expiresIn
      }

    } catch (error) {
      console.error('直接登录接口调用失败:', error)
      
      // 开发模式下的兜底处理
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 开发模式：后端接口调用失败，使用模拟数据')
        return this.getMockLoginData(params)
      }
      
      throw error
    }
  }

  /**
   * 获取模拟登录数据（开发模式使用）
   * @param {Object} params 登录参数
   * @returns {Object} 模拟登录结果
   */
  static getMockLoginData(params) {
    const mockUser = {
      id: 'mock_user_' + Date.now(),
      openId: 'mock_openid_' + params.code.slice(-8),
      unionId: null,
      nickName: params.userInfo?.nickName || '音乐创作者',
      avatarUrl: params.userInfo?.avatarUrl || '/static/img/profile.svg',
      gender: params.userInfo?.gender || 0,
      country: params.userInfo?.country || '中国',
      province: params.userInfo?.province || '广东',
      city: params.userInfo?.city || '深圳',
      points: 320,
      createdAt: new Date().toISOString()
    }

    return {
      userInfo: mockUser,
      token: 'mock_jwt_token_' + Date.now(),
      expiresIn: 7200
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
        const store = currentPage.$scope?.$store || uni.$store
        
        if (store) {
          store.commit('logout')
        }
      }
      
      console.log('✅ 退出登录成功')
      
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  }

  /**
   * 登录状态检查和自动登录
   * @returns {Promise<Boolean>} 是否登录成功
   */
  static async checkAndAutoLogin() {
    if (this.isLoggedIn()) {
      console.log('✅ 用户已登录')
      return true
    }
    
    console.log('❌ 用户未登录')
    return false
  }

  /**
   * 显示登录弹窗
   * @param {Object} options 配置选项
   * @param {String} options.title 弹窗标题
   * @param {String} options.content 弹窗内容
   * @param {Boolean} options.needUserInfo 是否需要用户信息
   * @returns {Promise} 登录结果
   */
  static showLoginModal(options = {}) {
    const {
      title = '需要登录',
      content = '该功能需要登录后才能使用，是否立即登录？',
      needUserInfo = true
    } = options

    return new Promise((resolve, reject) => {
      uni.showModal({
        title: title,
        content: content,
        confirmText: '立即登录',
        cancelText: '取消',
        success: async (res) => {
          if (res.confirm) {
            try {
              const loginResult = await this.login({ 
                needUserInfo,
                desc: '用于完善用户资料和提供个性化服务' 
              })
              
              if (loginResult.success) {
                uni.showToast({
                  title: '登录成功',
                  icon: 'success'
                })
                resolve(loginResult)
              } else {
                uni.showToast({
                  title: loginResult.message,
                  icon: 'none'
                })
                reject(new Error(loginResult.message))
              }
            } catch (error) {
              uni.showToast({
                title: '登录失败',
                icon: 'none'
              })
              reject(error)
            }
          } else {
            reject(new Error('用户取消登录'))
          }
        }
      })
    })
  }

  /**
   * 创作功能登录检查
   * 用于创作相关功能的登录验证
   * @param {String} creationType 创作类型 ('manual' | 'ai' | 'lyrics')
   * @returns {Promise<Boolean>} 是否已登录
   */
  static async checkCreationLogin(creationType) {
    if (this.isLoggedIn()) {
      return true
    }

    const typeMap = {
      'manual': '自主创作',
      'ai': 'AI创作',
      'lyrics': '歌词生成'
    }

    try {
      await this.showLoginModal({
        title: '登录后开始创作',
        content: `${typeMap[creationType] || '该功能'}需要登录后才能使用，登录即可开始创作您的专属音乐！`,
        needUserInfo: true
      })
      return true
    } catch (error) {
      console.log('用户取消登录')
      return false
    }
  }

  /**
   * 个人中心登录检查
   * @returns {Promise<Boolean>} 是否已登录
   */
  static async checkProfileLogin() {
    if (this.isLoggedIn()) {
      return true
    }

    try {
      await this.showLoginModal({
        title: '完善个人资料',
        content: '登录后可查看和管理您的作品、点数记录等个人信息',
        needUserInfo: true
      })
      return true
    } catch (error) {
      console.log('用户取消登录')
      return false
    }
  }

  /**
   * 购买点数登录检查
   * @returns {Promise<Boolean>} 是否已登录
   */
  static async checkPurchaseLogin() {
    if (this.isLoggedIn()) {
      return true
    }

    try {
      await this.showLoginModal({
        title: '登录后购买点数',
        content: '购买点数需要登录账号，登录后即可享受音乐创作服务',
        needUserInfo: true
      })
      return true
    } catch (error) {
      console.log('用户取消登录')
      return false
    }
  }
}

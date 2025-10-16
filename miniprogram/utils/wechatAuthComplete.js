/**
 * 完整的微信小程序授权工具类
 * 基于微信官方最新文档和API实现
 * 支持：账号信息、用户信息、手机号授权等完整功能
 */

export default class WeChatAuthComplete {
  
  /**
   * 获取小程序账号信息
   * @returns {Object} 账号信息
   */
  static getAccountInfo() {
    try {
      if (wx.getAccountInfoSync) {
        const accountInfo = wx.getAccountInfoSync();
        console.log('📱 小程序账号信息:', {
          appId: accountInfo.miniProgram.appId,
          envVersion: accountInfo.miniProgram.envVersion,
          version: accountInfo.miniProgram.version
        });
        return accountInfo;
      } else {
        console.warn('⚠️ 当前基础库版本不支持 getAccountInfoSync');
        return null;
      }
    } catch (error) {
      console.error('获取账号信息失败:', error);
      return null;
    }
  }

  /**
   * 检查用户是否已登录
   */
  static isLoggedIn() {
    try {
      const userInfo = uni.getStorageSync('userInfo');
      const token = uni.getStorageSync('token');
      return !!(userInfo && token);
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取存储的用户信息
   */
  static getUserInfo() {
    try {
      return uni.getStorageSync('userInfo');
    } catch (error) {
      return null;
    }
  }

  /**
   * 检查是否支持 getUserProfile
   */
  static canUseGetUserProfile() {
    return !!wx.getUserProfile;
  }

  /**
   * 完整的微信授权登录流程
   * @param {Object} options 配置选项
   */
  static async login(options = {}) {
    const {
      needUserInfo = true,
      needPhone = false,
      phoneCode = null,
      desc = '用于完善用户资料和提供个性化服务'
    } = options;

    try {
      console.log('🔐 开始完整微信授权流程...');

      // 1. 获取账号信息
      const accountInfo = this.getAccountInfo();
      
      // 2. 获取登录code
      const loginCode = await this.getWxLoginCode();
      console.log('✅ 获取登录code成功:', loginCode);

      // 3. 获取用户信息（如果需要）
      let userProfile = null;
      if (needUserInfo) {
        try {
          if (this.canUseGetUserProfile()) {
            userProfile = await this.getUserProfile(desc);
            console.log('✅ 通过getUserProfile获取用户信息成功:', userProfile.userInfo.nickName);
          } else {
            // 降级到 getUserInfo（已废弃，仅兼容）
            userProfile = await this.getUserInfoDeprecated();
            console.log('⚠️ 通过getUserInfo获取用户信息（兼容模式）');
          }
        } catch (error) {
          console.log('⚠️ 用户取消授权或获取用户信息失败:', error.message);
        }
      }

      // 4. 构建登录参数
      const loginParams = {
        code: loginCode,
        phoneCode: phoneCode,
        nickName: userProfile?.userInfo?.nickName,
        avatarUrl: userProfile?.userInfo?.avatarUrl,
        gender: userProfile?.userInfo?.gender?.toString(),
        country: userProfile?.userInfo?.country,
        province: userProfile?.userInfo?.province,
        city: userProfile?.userInfo?.city,
        language: userProfile?.userInfo?.language,
        // 添加账号信息
        appId: accountInfo?.miniProgram?.appId,
        envVersion: accountInfo?.miniProgram?.envVersion,
        version: accountInfo?.miniProgram?.version,
        // 签名验证信息
        rawData: userProfile?.rawData,
        signature: userProfile?.signature,
        encryptedData: userProfile?.encryptedData,
        iv: userProfile?.iv
      };

      // 5. 调用后端授权接口
      console.log('🌐 调用后端授权接口...');
      const loginResult = await this.callBackendAuth(loginParams);

      // 6. 保存登录信息
      this.saveLoginInfo(loginResult);
      
      console.log('🎉 完整微信授权完成!', {
        isNewUser: loginResult.userInfo.isNewUser,
        hasPhone: loginResult.userInfo.hasPhone,
        appId: accountInfo?.miniProgram?.appId
      });

      return {
        success: true,
        userInfo: loginResult.userInfo,
        token: loginResult.token,
        accountInfo: accountInfo,
        message: '授权成功'
      };

    } catch (error) {
      console.error('❌ 微信授权失败:', error);
      return {
        success: false,
        error: error.message,
        message: '授权失败，请重试'
      };
    }
  }

  /**
   * 获取微信登录code
   */
  static getWxLoginCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            resolve(res.code);
          } else {
            reject(new Error('获取登录code失败: ' + res.errMsg));
          }
        },
        fail: (err) => {
          reject(new Error('wx.login调用失败: ' + err.errMsg));
        }
      });
    });
  }

  /**
   * 使用 wx.getUserProfile 获取用户信息（推荐方式）
   */
  static getUserProfile(desc = '用于完善用户资料') {
    return new Promise((resolve, reject) => {
      if (!wx.getUserProfile) {
        reject(new Error('当前微信版本不支持getUserProfile'));
        return;
      }

      wx.getUserProfile({
        desc: desc,
        lang: 'zh_CN',
        success: (res) => {
          resolve(res);
        },
        fail: (err) => {
          reject(new Error('用户拒绝授权: ' + err.errMsg));
        }
      });
    });
  }

  /**
   * 使用 wx.getUserInfo 获取用户信息（已废弃，仅兼容）
   */
  static getUserInfoDeprecated() {
    return new Promise((resolve, reject) => {
      wx.getUserInfo({
        withCredentials: true,
        lang: 'zh_CN',
        success: (res) => {
          resolve(res);
        },
        fail: (err) => {
          reject(new Error('获取用户信息失败: ' + err.errMsg));
        }
      });
    });
  }

  /**
   * 检查用户授权状态
   */
  static checkAuthSettings() {
    return new Promise((resolve) => {
      wx.getSetting({
        success: (res) => {
          console.log('👤 用户授权状态:', res.authSetting);
          resolve({
            hasUserInfo: !!res.authSetting['scope.userInfo'],
            authSetting: res.authSetting
          });
        },
        fail: () => {
          resolve({ hasUserInfo: false, authSetting: {} });
        }
      });
    });
  }

  /**
   * 处理手机号授权回调
   */
  static handlePhoneNumberAuth(event) {
    console.log('📱 手机号授权回调详情:', event.detail);
    
    const { errMsg, errno, code } = event.detail;
    
    if (errMsg === 'getPhoneNumber:ok' && code) {
      return {
        success: true,
        code: code,
        message: '手机号授权成功'
      };
    } else if (errno === 1400001) {
      return {
        success: false,
        error: 'quota_exceeded',
        message: '该功能使用次数已达当前小程序上限，暂时无法使用'
      };
    } else {
      return {
        success: false,
        error: errMsg || 'unknown_error',
        message: '手机号授权失败: ' + (errMsg || '未知错误')
      };
    }
  }

  /**
   * 调用后端授权接口
   */
  static async callBackendAuth(params) {
    try {
      // 尝试获取API实例
      const pages = getCurrentPages();
      let minApi = null;
      
      if (pages.length > 0) {
        const currentPage = pages[pages.length - 1];
        minApi = currentPage.$vm?.$minApi || currentPage.$minApi;
      }

      let response;
      
      if (minApi && minApi.wechatAuth) {
        // 使用新的授权接口
        console.log('🔄 使用新授权接口 wechatAuth');
        response = await minApi.wechatAuth(params);
      } else if (minApi && minApi.wechatLogin) {
        // 降级到旧接口
        console.log('🔄 降级使用 wechatLogin 接口');
        response = await minApi.wechatLogin(params);
      } else {
        // 直接调用
        console.log('🔄 使用直接HTTP调用');
        response = await this.callBackendDirectly(params);
      }

      if (response.code !== 200) {
        throw new Error(response.message || '登录接口返回错误');
      }

      // 转换数据格式
      const backendData = response.data;
      return {
        userInfo: {
          userId: backendData.userId,
          username: backendData.username,
          nickname: backendData.nickname,
          avatar: backendData.avatar,
          phone: backendData.phone,
          creditBalance: backendData.creditBalance,
          isNewUser: backendData.isNewUser,
          hasPhone: backendData.hasPhone || !!backendData.phone,
        },
        token: backendData.token,
        expiresIn: backendData.expiresIn
      };

    } catch (error) {
      console.error('后端授权接口调用失败:', error);
      throw error;
    }
  }

  /**
   * 直接HTTP调用后端
   */
  static async callBackendDirectly(params) {
    const response = await uni.request({
      url: 'http://192.168.1.118:3000/api/auth/wechat-login', // 使用现有可用接口
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: params,
      timeout: 10000
    });

    const [error, res] = response;
    if (error) {
      throw new Error('网络请求失败: ' + error.errMsg);
    }

    if (res.statusCode !== 200) {
      throw new Error('服务器响应错误: ' + res.statusCode);
    }

    return res.data;
  }

  /**
   * 保存登录信息
   */
  static saveLoginInfo(loginResult) {
    try {
      uni.setStorageSync('userInfo', loginResult.userInfo);
      uni.setStorageSync('token', loginResult.token);
      uni.setStorageSync('loginTime', Date.now());
      
      // 更新Vuex状态
      this.updateVuexState(loginResult);
      
    } catch (error) {
      console.error('保存登录信息失败:', error);
    }
  }

  /**
   * 更新Vuex状态
   */
  static updateVuexState(loginResult) {
    try {
      const pages = getCurrentPages();
      if (pages.length > 0) {
        const currentPage = pages[pages.length - 1];
        const store = currentPage.$vm?.$store || currentPage.$store || uni.$store || getApp().$store;
        
        if (store) {
          store.commit('login', {
            ...loginResult.userInfo,
            token: loginResult.token,
            ApiToken: loginResult.token // 兼容字段
          });
          console.log('✅ Vuex状态更新成功');
        }
      }
    } catch (error) {
      console.error('更新Vuex状态失败:', error);
    }
  }

  /**
   * 智能授权流程（根据场景自适应）
   */
  static async smartAuth(scene = 'default') {
    // 检查当前登录状态
    if (this.isLoggedIn()) {
      const userInfo = this.getUserInfo();
      
      // 根据场景判断是否需要额外授权
      switch (scene) {
        case 'purchase':
          if (!userInfo.phone) {
            return await this.showPhoneAuthModal();
          }
          break;
        case 'profile':
          if (!userInfo.nickname || !userInfo.avatar) {
            return await this.showUserInfoAuthModal();
          }
          break;
      }
      
      return { success: true, userInfo, message: '已登录' };
    }

    // 未登录，启动授权流程
    const authSettings = await this.checkAuthSettings();
    
    return await this.login({
      needUserInfo: !authSettings.hasUserInfo,
      needPhone: scene === 'purchase',
      desc: this.getSceneDesc(scene)
    });
  }

  /**
   * 获取场景描述文案
   */
  static getSceneDesc(scene) {
    const descMap = {
      'create': '用于保存您的创作作品和提供个性化服务',
      'purchase': '用于购买点数和账户安全验证',
      'profile': '用于完善个人资料和作品管理',
      'default': '用于提供更好的使用体验'
    };
    return descMap[scene] || descMap['default'];
  }

  /**
   * 显示用户信息授权弹窗
   */
  static showUserInfoAuthModal() {
    return new Promise((resolve, reject) => {
      uni.showModal({
        title: '完善个人信息',
        content: '获取您的头像和昵称，用于完善个人资料',
        confirmText: '授权',
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await this.login({ 
                needUserInfo: true, 
                needPhone: false 
              });
              resolve(result);
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error('用户取消授权'));
          }
        }
      });
    });
  }

  /**
   * 显示手机号授权弹窗
   */
  static showPhoneAuthModal() {
    return new Promise((resolve, reject) => {
      uni.showModal({
        title: '验证手机号',
        content: '为了账户安全，需要验证您的手机号',
        confirmText: '验证',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '请点击"获取手机号"按钮',
              icon: 'none',
              duration: 2000
            });
            resolve({ success: false, message: '需要点击手机号授权按钮' });
          } else {
            reject(new Error('用户取消手机号验证'));
          }
        }
      });
    });
  }

  /**
   * 一键完整授权（包含用户信息和手机号）
   */
  static async completeAuth() {
    try {
      console.log('🎯 开始一键完整授权流程...');
      
      // 先进行基础授权
      const basicResult = await this.login({
        needUserInfo: true,
        needPhone: false,
        desc: '用于完善用户资料并提供个性化服务'
      });

      if (!basicResult.success) {
        return basicResult;
      }

      // 提示用户进行手机号授权
      uni.showModal({
        title: '手机号验证',
        content: '为了提供更安全的服务，建议绑定手机号。点击确定后请点击"获取手机号"按钮',
        confirmText: '继续验证',
        cancelText: '暂时跳过',
        success: (res) => {
          if (res.confirm) {
            console.log('💡 用户选择继续手机号验证，请点击获取手机号按钮');
          } else {
            console.log('⚠️ 用户跳过手机号验证');
          }
        }
      });

      return {
        ...basicResult,
        message: '基础授权完成，可选择验证手机号'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '完整授权失败'
      };
    }
  }

  /**
   * 退出登录
   */
  static logout() {
    try {
      // 清除本地存储
      uni.removeStorageSync('userInfo');
      uni.removeStorageSync('token');
      uni.removeStorageSync('loginTime');
      
      // 清除Vuex状态
      const pages = getCurrentPages();
      if (pages.length > 0) {
        const currentPage = pages[pages.length - 1];
        const store = currentPage.$vm?.$store || currentPage.$store || uni.$store || getApp().$store;
        
        if (store) {
          store.commit('logout');
        }
      }
      
      console.log('✅ 退出登录成功');
      
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  }

  /**
   * 场景化授权检查
   */
  static async checkCreationAuth() {
    return await this.smartAuth('create');
  }

  static async checkPurchaseAuth() {
    return await this.smartAuth('purchase');
  }

  static async checkProfileAuth() {
    return await this.smartAuth('profile');
  }

  // 兼容性方法（保持向后兼容）
  static async checkCreationLogin() { return (await this.checkCreationAuth()).success; }
  static async checkPurchaseLogin() { return (await this.checkPurchaseAuth()).success; }
  static async checkProfileLogin() { return (await this.checkProfileAuth()).success; }
}

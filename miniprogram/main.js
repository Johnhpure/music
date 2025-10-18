import Vue from 'vue'
import App from './App'
import store from './store'
import i18n from './i18n'
import _ from 'lodash'
import MinRequest from './utils//MinRequest'
import minApi from './api/api'
import MinCache from './utils/MinCache'
import audioManager from './utils/audioManager'
// import minRouter from './router/router.js'

// import cuCustom from './colorui/components/cu-custom.vue'
// Vue.component('cu-custom', cuCustom)

Vue.config.productionTip = false
Vue.prototype.$store = store
// 注册缓存器
Vue.use(MinCache)
// 注册路由
// Vue.use(MinRouter)
// 注册 MinRequest（必须在使用 minApi 之前）
Vue.use(MinRequest)

App.mpType = 'app'
Vue.prototype._i18n = i18n
Vue.prototype.$_ = _
// 挂载音频管理器到Vue原型
Vue.prototype.$audioManager = audioManager

// 调试：检查audioManager是否正确加载
console.log('[Main.js] audioManager:', audioManager)
console.log('[Main.js] Vue.prototype.$audioManager:', Vue.prototype.$audioManager)

const app = new Vue({
	store,
	minApi,
	i18n,
	// minRouter,
	...App
})
app.$mount()

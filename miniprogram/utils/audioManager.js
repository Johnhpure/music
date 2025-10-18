/**
 * 全局音频管理器
 * 单例模式，确保全局只有一个音频实例
 */
class AudioManager {
	constructor() {
		if (AudioManager.instance) {
			return AudioManager.instance;
		}
		
		this.audioContext = null;
		this.currentMusic = null; // 当前播放的音乐信息
		this.isPlaying = false;
		this.currentTime = 0;
		this.duration = 0;
		this.listeners = {}; // 事件监听器
		this.initialized = false; // 是否已初始化
		
		AudioManager.instance = this;
	}
	
	/**
	 * 初始化音频上下文
	 */
	_initAudioContext() {
		if (this.initialized && this.audioContext) {
			return true;
		}
		
		try {
			// 销毁旧实例，避免-99错误
			if (this.audioContext) {
				try {
					this.audioContext.pause();
					this.audioContext.destroy();
					this.audioContext = null;
				} catch (e) {
					console.warn('销毁旧音频实例失败:', e);
				}
			}
			
			this.audioContext = uni.createInnerAudioContext();
			
			// 只有成功创建后才标记为已初始化
			if (!this.audioContext) {
				console.error('音频上下文创建失败: createInnerAudioContext返回null');
				this.initialized = false;
				return false;
			}
			
			this.initialized = true;
			
		} catch (err) {
			console.error('音频上下文初始化失败:', err);
			this.initialized = false;
			this.audioContext = null;
			return false;
		}
		
		// 监听播放进度更新
		this.audioContext.onTimeUpdate(() => {
			this.currentTime = this.audioContext.currentTime;
			this.duration = this.audioContext.duration;
			this._emit('timeUpdate', {
				currentTime: this.currentTime,
				duration: this.duration,
				progress: (this.currentTime / this.duration) * 100
			});
		});
		
		// 监听播放结束
		this.audioContext.onEnded(() => {
			this.isPlaying = false;
			this._emit('ended');
		});
		
		// 监听播放错误
		this.audioContext.onError((err) => {
			console.error('音频播放错误:', err);
			this.isPlaying = false;
			this._emit('error', err);
		});
		
		// 监听播放开始
		this.audioContext.onPlay(() => {
			this.isPlaying = true;
			this._emit('play');
		});
		
		// 监听暂停
		this.audioContext.onPause(() => {
			this.isPlaying = false;
			this._emit('pause');
		});
		
		return true;
	}
	
	/**
	 * 播放音乐
	 * @param {Object} music - 音乐对象 {id, title, audioUrl, coverUrl, ...}
	 */
	play(music) {
		// 确保音频上下文已初始化
		if (!this.initialized || !this.audioContext) {
			const initSuccess = this._initAudioContext();
			if (!initSuccess || !this.audioContext) {
				console.error('音频上下文初始化失败，无法播放');
				// 通过emit通知外部初始化失败
				this._emit('error', { 
					errMsg: '音频管理器初始化失败',
					errCode: -1
				});
				return;
			}
		}
		
		if (!music || !music.audioUrl) {
			console.error('音乐信息或音频URL不存在');
			this._emit('error', {
				errMsg: '音乐信息或音频URL不存在',
				errCode: -2
			});
			return;
		}
		
		// 如果是同一首歌，继续播放
		if (this.currentMusic && this.currentMusic.id === music.id) {
			if (!this.isPlaying) {
				this.audioContext.play();
			}
			return;
		}
		
		// 切换歌曲
		this.currentMusic = music;
		this.audioContext.src = music.audioUrl;
		this.audioContext.play();
		
		this._emit('musicChange', music);
	}
	
	/**
	 * 暂停播放
	 */
	pause() {
		if (this.audioContext && this.isPlaying) {
			this.audioContext.pause();
		}
	}
	
	/**
	 * 停止播放
	 */
	stop() {
		if (this.audioContext) {
			this.audioContext.stop();
			this.isPlaying = false;
			this.currentTime = 0;
		}
	}
	
	/**
	 * 切换播放/暂停
	 */
	togglePlay() {
		if (!this.audioContext) {
			console.error('音频上下文未初始化');
			return;
		}
		
		if (this.isPlaying) {
			this.pause();
		} else {
			if (this.currentMusic) {
				this.audioContext.play();
			}
		}
	}
	
	/**
	 * 跳转到指定时间
	 * @param {Number} time - 时间（秒）
	 */
	seek(time) {
		if (this.audioContext) {
			this.audioContext.seek(time);
		}
	}
	
	/**
	 * 获取当前播放状态
	 */
	getPlayState() {
		return {
			isPlaying: this.isPlaying,
			currentMusic: this.currentMusic,
			currentTime: this.currentTime,
			duration: this.duration,
			progress: this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0
		};
	}
	
	/**
	 * 注册事件监听
	 * @param {String} event - 事件名：play, pause, ended, timeUpdate, error, musicChange
	 * @param {Function} callback - 回调函数
	 */
	on(event, callback) {
		if (!this.listeners[event]) {
			this.listeners[event] = [];
		}
		this.listeners[event].push(callback);
	}
	
	/**
	 * 移除事件监听
	 * @param {String} event - 事件名
	 * @param {Function} callback - 回调函数
	 */
	off(event, callback) {
		if (!this.listeners[event]) return;
		
		const index = this.listeners[event].indexOf(callback);
		if (index > -1) {
			this.listeners[event].splice(index, 1);
		}
	}
	
	/**
	 * 触发事件
	 * @param {String} event - 事件名
	 * @param {*} data - 事件数据
	 */
	_emit(event, data) {
		if (!this.listeners[event]) return;
		
		this.listeners[event].forEach(callback => {
			callback(data);
		});
	}
	
	/**
	 * 销毁音频上下文
	 */
	destroy() {
		if (this.audioContext) {
			this.audioContext.destroy();
			this.audioContext = null;
		}
		this.listeners = {};
		this.currentMusic = null;
		this.isPlaying = false;
	}
}

// 导出单例
export default new AudioManager();

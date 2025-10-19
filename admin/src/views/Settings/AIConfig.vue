<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">AI配置管理</h1>
        <p class="text-gray-400 mt-1">统一管理AI大模型配置和API密钥</p>
      </div>
      
      <div class="flex items-center space-x-4">
        <CyberButton
          variant="outline"
          left-icon="mdi:refresh"
          @click="loadAllData"
          :loading="loading"
        >
          刷新数据
        </CyberButton>
      </div>
    </div>

    <!-- AI Providers Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        v-for="provider in providers" 
        :key="provider.id"
        class="relative group cursor-pointer"
        @click="openProviderDetail(provider)"
      >
        <!-- Provider Card -->
        <div 
          class="relative p-8 rounded-2xl border-2 transition-all duration-300 h-full"
          :class="{
            'border-cyber-purple bg-cyber-purple/10': provider.isActive,
            'border-gray-700 bg-glass-white/5 hover:border-gray-600': !provider.isActive,
          }"
        >
          <!-- Card Header -->
          <div class="flex items-start justify-between mb-6">
            <div class="flex items-center space-x-4">
              <div 
                class="w-16 h-16 rounded-xl flex items-center justify-center p-2"
                :class="provider.isActive ? 'bg-cyber-purple/20' : 'bg-gray-700/50'"
              >
                <img 
                  v-if="provider.configJson?.logoUrl"
                  :src="provider.configJson.logoUrl" 
                  :alt="`${provider.providerName} Logo`"
                  class="w-full h-full object-contain"
                  @error="handleImageError"
                />
                <Icon 
                  v-else
                  :icon="getProviderIcon(provider.providerCode)" 
                  class="w-10 h-10"
                  :class="provider.isActive ? 'text-cyber-purple' : 'text-gray-400'"
                />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-white">{{ provider.providerName }}</h3>
                <p class="text-sm text-gray-400 mt-1">{{ provider.providerCode }}</p>
              </div>
            </div>
            
            <!-- Enable Toggle Button -->
            <div @click.stop>
              <button
                @click="toggleProviderActive(provider)"
                class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors"
                :class="provider.isActive ? 'bg-cyber-purple' : 'bg-gray-600'"
              >
                <span
                  class="inline-block h-6 w-6 transform rounded-full bg-white transition-transform"
                  :class="provider.isActive ? 'translate-x-7' : 'translate-x-1'"
                ></span>
              </button>
            </div>
          </div>

          <!-- Card Content -->
          <div class="space-y-4">
            <p class="text-gray-300 text-sm line-clamp-2 min-h-[2.5rem]">
              {{ provider.description || '暂无描述' }}
            </p>
            
            <!-- API信息 -->
            <div class="text-xs text-gray-500 space-y-1">
              <div class="flex items-center space-x-2">
                <Icon icon="mdi:api" class="w-3 h-3" />
                <span class="font-mono truncate">{{ provider.baseUrl }}</span>
              </div>
              <div v-if="provider.configJson?.rateLimit" class="flex items-center space-x-2">
                <Icon icon="mdi:speedometer" class="w-3 h-3" />
                <span>{{ provider.configJson.rateLimit.rpm }} RPM / {{ provider.configJson.rateLimit.rpd }} RPD</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="bg-glass-white/5 rounded-lg p-3">
                <div class="flex items-center space-x-2 mb-1">
                  <Icon icon="mdi:cube-outline" class="w-4 h-4 text-gray-400" />
                  <span class="text-xs text-gray-400">模型数量</span>
                </div>
                <p class="text-2xl font-bold text-white">{{ provider.modelsCount || 0 }}</p>
              </div>
              
              <div class="bg-glass-white/5 rounded-lg p-3">
                <div class="flex items-center space-x-2 mb-1">
                  <Icon icon="mdi:key-variant" class="w-4 h-4 text-gray-400" />
                  <span class="text-xs text-gray-400">API密钥</span>
                </div>
                <p class="text-2xl font-bold text-white">{{ provider.activeKeysCount || 0 }}</p>
              </div>
            </div>
          </div>

          <!-- Click hint -->
          <div class="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div class="flex items-center space-x-1 text-cyber-purple text-sm">
              <span>点击配置</span>
              <Icon icon="mdi:chevron-right" class="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Provider Detail Modal (Centered) -->
    <Teleport to="body">
      <div 
        v-if="showDetailDrawer" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        @click.self="closeDetailDrawer"
      >
        <div 
          class="w-full max-w-7xl max-h-[90vh] bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col"
          @click.stop
        >
          <!-- Detail Header -->
          <div class="sticky top-0 z-10 bg-gray-900 border-b border-gray-700 px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div 
                  class="w-12 h-12 rounded-lg flex items-center justify-center p-2"
                  :class="selectedProvider?.isActive ? 'bg-cyber-purple/20' : 'bg-gray-700/50'"
                >
                  <img 
                    v-if="selectedProvider?.configJson?.logoUrl"
                    :src="selectedProvider.configJson.logoUrl" 
                    :alt="`${selectedProvider.providerName} Logo`"
                    class="w-full h-full object-contain"
                  />
                  <Icon 
                    v-else
                    :icon="getProviderIcon(selectedProvider?.providerCode)" 
                    class="w-8 h-8"
                    :class="selectedProvider?.isActive ? 'text-cyber-purple' : 'text-gray-400'"
                  />
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-white">{{ selectedProvider?.providerName }}</h2>
                  <p class="text-sm text-gray-400 mt-1">{{ selectedProvider?.description }}</p>
                </div>
              </div>
              
              <button
                @click="closeDetailDrawer"
                class="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Icon icon="mdi:close" class="w-6 h-6 text-gray-400" />
              </button>
            </div>
          </div>


          <!-- 配置内容区域 - 使用Tab布局 -->
          <div class="flex-1 overflow-y-auto">
            <TabGroup>
              <TabList class="flex border-b border-gray-700/50 px-6 bg-gray-800/30 sticky top-0 z-10">
                <Tab v-slot="{ selected }" class="outline-none">
                  <button
                    class="px-6 py-4 text-sm font-medium transition-all relative"
                    :class="selected 
                      ? 'text-cyber-purple' 
                      : 'text-gray-400 hover:text-gray-300'"
                  >
                    <span class="flex items-center space-x-2">
                      <Icon icon="mdi:lightning-bolt" class="w-4 h-4" />
                      <span>快速配置</span>
                    </span>
                    <div 
                      v-if="selected" 
                      class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyber-purple to-pink-500"
                    ></div>
                  </button>
                </Tab>
                <Tab v-slot="{ selected }" class="outline-none">
                  <button
                    class="px-6 py-4 text-sm font-medium transition-all relative"
                    :class="selected 
                      ? 'text-cyber-purple' 
                      : 'text-gray-400 hover:text-gray-300'"
                  >
                    <span class="flex items-center space-x-2">
                      <Icon icon="mdi:cog" class="w-4 h-4" />
                      <span>详细配置</span>
                    </span>
                    <div 
                      v-if="selected" 
                      class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyber-purple to-pink-500"
                    ></div>
                  </button>
                </Tab>
              </TabList>

              <TabPanels class="p-6">
                <!-- 快速配置面板 -->
                <TabPanel>
                  <div class="space-y-6">
                    <!-- 步骤1: API密钥 -->
                    <div class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50 shadow-lg">
                      <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center space-x-3">
                          <div class="w-10 h-10 rounded-lg bg-cyber-purple/20 flex items-center justify-center">
                            <Icon icon="mdi:key-variant" class="w-5 h-5 text-cyber-purple" />
                          </div>
                          <div>
                            <h3 class="text-lg font-semibold text-white">API密钥</h3>
                            <p class="text-xs text-gray-400">添加并选择一个API密钥</p>
                          </div>
                        </div>
                        <div class="flex items-center space-x-2">
                          <CyberButton
                            v-if="selectedKeyId"
                            variant="outline"
                            left-icon="mdi:delete"
                            @click.stop="deleteSelectedKey"
                            size="sm"
                            class="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                          >
                            删除密钥
                          </CyberButton>
                          <CyberButton
                            left-icon="mdi:plus"
                            @click="openAddKeyDialog"
                            size="sm"
                          >
                            添加密钥
                          </CyberButton>
                        </div>
                      </div>
                      
                      <div v-if="apiKeys.length > 0" class="space-y-2 pr-2">
                        <div 
                          v-for="key in apiKeys" 
                          :key="key.id"
                          @click="selectApiKey(key.id)"
                          class="p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.02]"
                          :class="{
                            'border-cyber-purple bg-cyber-purple/10 shadow-lg shadow-cyber-purple/20': selectedKeyId === key.id,
                            'border-gray-700/50 bg-gray-800/30 hover:border-gray-600': selectedKeyId !== key.id
                          }"
                        >
                          <div class="flex items-center justify-between">
                            <div class="flex-1 min-w-0">
                              <div class="flex items-center space-x-2">
                                <h4 class="text-white font-medium text-sm">{{ key.keyName }}</h4>
                                <span 
                                  class="px-2 py-0.5 text-xs rounded-full"
                                  :class="{
                                    'bg-green-500/20 text-green-400': key.status === 'normal',
                                    'bg-yellow-500/20 text-yellow-400': key.status === 'rate_limited',
                                    'bg-red-500/20 text-red-400': key.status === 'error'
                                  }"
                                >
                                  {{ getKeyStatusText(key.status) }}
                                </span>
                              </div>
                              <p class="text-xs text-gray-400 font-mono mt-1 break-all">{{ key.apiKey }}</p>
                            </div>
                            <Icon 
                              v-if="selectedKeyId === key.id"
                              icon="mdi:check-circle" 
                              class="w-6 h-6 text-cyber-purple ml-3 flex-shrink-0 animate-pulse" 
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div v-else class="text-center py-8 text-gray-500">
                        <Icon icon="mdi:key-variant" class="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p class="text-sm">暂无API密钥，请点击"添加密钥"按钮</p>
                      </div>
                    </div>

                    <!-- 步骤2: 选择模型 -->
                    <div class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50 shadow-lg">
                      <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center space-x-3">
                          <div class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Icon icon="mdi:cube-outline" class="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <h3 class="text-lg font-semibold text-white">AI模型</h3>
                            <p class="text-xs text-gray-400">同步并选择要使用的模型</p>
                          </div>
                        </div>
                        <CyberButton
                          variant="outline"
                          left-icon="mdi:sync"
                          @click="syncModels"
                          :loading="syncing"
                          size="sm"
                        >
                          同步模型
                        </CyberButton>
                      </div>
                      
                      <div v-if="models.length > 0" class="space-y-2 pr-2">
                        <div 
                          v-for="model in models.filter(m => m.isActive)" 
                          :key="model.id"
                          @click="selectModel(model.id)"
                          class="p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.02]"
                          :class="{
                            'border-cyber-purple bg-cyber-purple/10 shadow-lg shadow-cyber-purple/20': selectedModelId === model.id,
                            'border-gray-700/50 bg-gray-800/30 hover:border-gray-600': selectedModelId !== model.id
                          }"
                        >
                          <div class="flex items-center justify-between">
                            <div class="flex-1">
                              <div class="flex items-center space-x-2 mb-1">
                                <h4 class="text-white font-medium text-sm">{{ model.modelName }}</h4>
                                <span 
                                  v-if="model.isDefault"
                                  class="px-2 py-0.5 text-xs bg-gradient-to-r from-cyber-purple to-pink-500 text-white rounded-full"
                                >
                                  默认
                                </span>
                              </div>
                              <p class="text-xs text-gray-400 font-mono">{{ model.modelCode }}</p>
                              <div class="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                                <span v-if="model.maxInputTokens">📥 {{ model.maxInputTokens }}</span>
                                <span v-if="model.maxOutputTokens">📤 {{ model.maxOutputTokens }}</span>
                                <span v-if="model.supportsStreaming" class="text-green-400">⚡ 流式</span>
                              </div>
                            </div>
                            <Icon 
                              v-if="selectedModelId === model.id"
                              icon="mdi:check-circle" 
                              class="w-6 h-6 text-cyber-purple ml-3 animate-pulse" 
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div v-else class="text-center py-8 text-gray-500">
                        <Icon icon="mdi:package-variant" class="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p class="text-sm">暂无模型，请点击"同步模型"按钮</p>
                      </div>
                    </div>

                    <!-- 步骤3: 测试与保存 -->
                    <div class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50 shadow-lg">
                      <div class="flex items-center space-x-3 mb-4">
                        <div class="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                          <Icon icon="mdi:connection" class="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <h3 class="text-lg font-semibold text-white">测试连接</h3>
                          <p class="text-xs text-gray-400">验证配置是否正确</p>
                        </div>
                      </div>
                      
                      <div class="space-y-4">
                        <div class="flex justify-center">
                          <CyberButton
                            left-icon="mdi:connection"
                            @click="testConnection"
                            :loading="testing"
                            :disabled="!selectedKeyId"
                            size="lg"
                            class="w-full md:w-auto"
                          >
                            {{ testing ? '测试中...' : '开始测试连接' }}
                          </CyberButton>
                        </div>
                        
                        <div 
                          v-if="testResult" 
                          class="p-4 rounded-lg border-2 animate-fade-in"
                          :class="{
                            'border-green-500/50 bg-green-500/10': testResult.success,
                            'border-red-500/50 bg-red-500/10': !testResult.success
                          }"
                        >
                          <div class="flex items-start space-x-3">
                            <Icon 
                              :icon="testResult.success ? 'mdi:check-circle' : 'mdi:alert-circle'" 
                              class="w-7 h-7 flex-shrink-0"
                              :class="testResult.success ? 'text-green-400' : 'text-red-400'"
                            />
                            <div class="flex-1">
                              <h4 
                                class="font-semibold mb-1 text-base"
                                :class="testResult.success ? 'text-green-400' : 'text-red-400'"
                              >
                                {{ testResult.success ? '✓ 测试成功' : '✗ 测试失败' }}
                              </h4>
                              <p class="text-sm text-gray-300">{{ testResult.message }}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div class="flex justify-end space-x-3 pt-2">
                          <CyberButton
                            variant="outline"
                            @click="closeDetailDrawer"
                          >
                            取消
                          </CyberButton>
                          <CyberButton
                            @click="saveCompleteConfig"
                            :loading="saving"
                            :disabled="!selectedKeyId || !selectedModelId"
                            left-icon="mdi:content-save"
                          >
                            保存配置
                          </CyberButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabPanel>

                <!-- 详细配置面板 -->
                <TabPanel>
                  <div class="space-y-6">
            <!-- API Configuration -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Base URL -->
              <div class="bg-glass-white/5 rounded-lg p-4">
                <div class="flex items-center space-x-2 mb-2">
                  <Icon icon="mdi:web" class="w-5 h-5 text-gray-400" />
                  <span class="text-sm text-gray-400">API地址</span>
                </div>
                <p class="text-white font-mono text-sm break-all">{{ selectedProvider?.baseUrl }}</p>
              </div>

              <!-- API Docs -->
              <div v-if="selectedProvider?.configJson?.apiDocs" class="bg-glass-white/5 rounded-lg p-4">
                <div class="flex items-center space-x-2 mb-2">
                  <Icon icon="mdi:book-open-variant" class="w-5 h-5 text-gray-400" />
                  <span class="text-sm text-gray-400">官方文档</span>
                </div>
                <a 
                  :href="selectedProvider.configJson.apiDocs" 
                  target="_blank"
                  class="text-cyber-purple hover:text-cyber-purple/80 text-sm break-all"
                >
                  {{ selectedProvider.configJson.apiDocs }}
                  <Icon icon="mdi:open-in-new" class="inline w-3 h-3 ml-1" />
                </a>
              </div>

              <!-- Auth Header -->
              <div v-if="selectedProvider?.configJson?.authHeader" class="bg-glass-white/5 rounded-lg p-4">
                <div class="flex items-center space-x-2 mb-2">
                  <Icon icon="mdi:key" class="w-5 h-5 text-gray-400" />
                  <span class="text-sm text-gray-400">认证方式</span>
                </div>
                <p class="text-white font-mono text-sm">{{ selectedProvider.configJson.authHeader }}</p>
              </div>

              <!-- Rate Limit -->
              <div v-if="selectedProvider?.configJson?.rateLimit" class="bg-glass-white/5 rounded-lg p-4">
                <div class="flex items-center space-x-2 mb-2">
                  <Icon icon="mdi:speedometer" class="w-5 h-5 text-gray-400" />
                  <span class="text-sm text-gray-400">速率限制</span>
                </div>
                <div class="text-white text-sm space-y-1">
                  <div>RPM: {{ selectedProvider.configJson.rateLimit.rpm }}</div>
                  <div>TPM: {{ selectedProvider.configJson.rateLimit.tpm?.toLocaleString() }}</div>
                  <div>RPD: {{ selectedProvider.configJson.rateLimit.rpd?.toLocaleString() }}</div>
                </div>
              </div>
            </div>

            <!-- Default Parameters -->
            <div v-if="selectedProvider?.configJson?.defaultParams" class="bg-glass-white/5 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-3">
                <Icon icon="mdi:tune" class="w-5 h-5 text-gray-400" />
                <span class="text-sm font-semibold text-white">默认参数</span>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div v-for="(value, key) in selectedProvider.configJson.defaultParams" :key="key">
                  <span class="text-xs text-gray-400">{{ key }}</span>
                  <p class="text-white text-sm font-mono">{{ value }}</p>
                </div>
              </div>
            </div>

            <!-- Supported Features -->
            <div v-if="selectedProvider?.configJson?.supportedFeatures" class="bg-glass-white/5 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-3">
                <Icon icon="mdi:feature-search" class="w-5 h-5 text-gray-400" />
                <span class="text-sm font-semibold text-white">支持功能</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="feature in selectedProvider.configJson.supportedFeatures" 
                  :key="feature"
                  class="px-3 py-1 text-xs bg-cyber-purple/20 text-cyber-purple rounded-full"
                >
                  {{ feature }}
                </span>
              </div>
            </div>

            <!-- Models Section -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-white">AI模型</h3>
                <CyberButton
                  variant="outline"
                  left-icon="mdi:sync"
                  @click="syncModels"
                  :loading="syncing"
                  size="sm"
                >
                  同步模型
                </CyberButton>
              </div>

              <div v-if="models.length > 0" class="space-y-3">
                <div 
                  v-for="model in models" 
                  :key="model.id"
                  class="p-4 rounded-lg border border-gray-700/30 bg-glass-white/5"
                  :class="{ 'border-cyber-purple': model.isDefault }"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center space-x-3 mb-2">
                        <h4 class="text-white font-semibold">{{ model.modelName }}</h4>
                        <span 
                          v-if="model.isDefault"
                          class="px-2 py-0.5 text-xs bg-cyber-purple/20 text-cyber-purple rounded"
                        >
                          默认
                        </span>
                        <span 
                          class="px-2 py-0.5 text-xs rounded"
                          :class="model.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'"
                        >
                          {{ model.isActive ? '已启用' : '已停用' }}
                        </span>
                      </div>
                      <p class="text-sm text-gray-400 mb-2">{{ model.modelCode }}</p>
                      <div class="flex items-center space-x-4 text-xs text-gray-500">
                        <span v-if="model.maxInputTokens">输入: {{ model.maxInputTokens }} tokens</span>
                        <span v-if="model.maxOutputTokens">输出: {{ model.maxOutputTokens }} tokens</span>
                        <span v-if="model.supportsStreaming">流式输出</span>
                        <span v-if="model.supportsFunctionCall">函数调用</span>
                      </div>
                    </div>
                    
                    <div class="flex items-center space-x-2 ml-4">
                      <button
                        v-if="!model.isDefault"
                        @click="setDefaultModel(model.id)"
                        class="px-3 py-1 text-xs bg-cyber-purple/20 hover:bg-cyber-purple/30 text-cyber-purple rounded transition-colors"
                      >
                        设为默认
                      </button>
                      <button
                        @click="toggleModelActive(model.id, model.isActive)"
                        class="px-3 py-1 text-xs rounded transition-colors"
                        :class="model.isActive ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'"
                      >
                        {{ model.isActive ? '停用' : '启用' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-else class="text-center py-8 text-gray-500">
                <Icon icon="mdi:package-variant" class="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无模型，请点击"同步模型"按钮</p>
              </div>
            </div>

            <!-- API Keys Section -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-white">API密钥</h3>
                <CyberButton
                  left-icon="mdi:plus"
                  @click="openAddKeyDialog"
                  size="sm"
                >
                  添加密钥
                </CyberButton>
              </div>

              <div v-if="apiKeys.length > 0" class="space-y-3">
                <div 
                  v-for="key in apiKeys" 
                  :key="key.id"
                  class="p-4 rounded-lg border border-gray-700/30 bg-glass-white/5"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center space-x-3 mb-2">
                        <h4 class="text-white font-semibold">{{ key.keyName }}</h4>
                        <span 
                          class="px-2 py-0.5 text-xs rounded"
                          :class="{
                            'bg-green-500/20 text-green-400': key.status === 'normal',
                            'bg-yellow-500/20 text-yellow-400': key.status === 'rate_limited',
                            'bg-red-500/20 text-red-400': key.status === 'error',
                            'bg-gray-500/20 text-gray-400': key.status === 'exhausted'
                          }"
                        >
                          {{ getKeyStatusText(key.status) }}
                        </span>
                        <span 
                          v-if="!key.isActive"
                          class="px-2 py-0.5 text-xs bg-gray-500/20 text-gray-400 rounded"
                        >
                          已停用
                        </span>
                      </div>
                      <p class="text-sm text-gray-400 font-mono mb-3">{{ key.apiKey }}</p>
                      <div class="grid grid-cols-3 gap-4">
                        <div>
                          <p class="text-xs text-gray-500">今日请求</p>
                          <p class="text-sm text-white mt-1">{{ key.requestsCountToday }} / {{ key.rateLimitRpd }}</p>
                        </div>
                        <div>
                          <p class="text-xs text-gray-500">今日Token</p>
                          <p class="text-sm text-white mt-1">{{ key.tokensCountToday }}</p>
                        </div>
                        <div>
                          <p class="text-xs text-gray-500">优先级</p>
                          <p class="text-sm text-white mt-1">{{ key.priority }}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div class="flex items-center space-x-2 ml-4">
                      <button
                        @click="validateKey(key.id)"
                        class="px-3 py-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors"
                        title="验证密钥"
                      >
                        验证
                      </button>
                      <button
                        @click="openEditKeyDialog(key)"
                        class="px-3 py-1 text-xs bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                      >
                        编辑
                      </button>
                      <button
                        @click="deleteKey(key.id, key.keyName)"
                        class="px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-else class="text-center py-8 text-gray-500">
                <Icon icon="mdi:key-variant" class="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无API密钥，请点击"添加密钥"按钮</p>
              </div>
            </div>
                  </div>
                </TabPanel>
              </TabPanels>
            </TabGroup>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Add/Edit API Key Dialog -->
    <Teleport to="body">
      <div 
        v-if="showKeyDialog" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        @click.self="closeKeyDialog"
      >
        <div class="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-2xl mx-4 shadow-xl">
          <h3 class="text-xl font-bold text-white mb-4">
            {{ editingKey ? '编辑API密钥' : '添加API密钥' }}
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">密钥名称</label>
              <input
                v-model="keyForm.keyName"
                type="text"
                class="cyber-input"
                placeholder="例如: 主密钥、备用密钥"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">API密钥</label>
              <input
                v-model="keyForm.apiKey"
                type="password"
                class="cyber-input"
                placeholder="输入API密钥"
              />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">优先级 (0-100)</label>
                <input
                  v-model.number="keyForm.priority"
                  type="number"
                  min="0"
                  max="100"
                  class="cyber-input"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">每日请求限制</label>
                <input
                  v-model.number="keyForm.rateLimitRpd"
                  type="number"
                  min="1"
                  class="cyber-input"
                />
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <input
                v-model="keyForm.isActive"
                type="checkbox"
                id="keyActive"
                class="rounded border-gray-600 bg-gray-700 text-cyber-purple focus:ring-cyber-purple"
              />
              <label for="keyActive" class="text-sm text-gray-300">启用此密钥</label>
            </div>
          </div>
          
          <div class="flex items-center justify-end space-x-3 mt-6">
            <button
              @click="closeKeyDialog"
              class="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              取消
            </button>
            <CyberButton
              @click="saveKey"
              :loading="saving"
            >
              {{ editingKey ? '保存' : '添加' }}
            </CyberButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'
import CyberButton from '@/components/UI/CyberButton.vue'
import { aiProviderAPI, aiModelAPI, aiApiKeyAPI } from '@/api'

// State
const loading = ref(false)
const syncing = ref(false)
const saving = ref(false)
const testing = ref(false)

// Data
const providers = ref<any[]>([])
const selectedProvider = ref<any>(null)
const models = ref<any[]>([])
const apiKeys = ref<any[]>([])


// 配置流程状态
const configStep = ref(1) // 1-配置KEY, 2-选择模型, 3-测试连接
const selectedKeyId = ref<number | null>(null)
const selectedModelId = ref<number | null>(null)
const testResult = ref<{ success: boolean; message: string } | null>(null)
const hasUnsavedChanges = ref(false)

// Drawer & Dialogs
const showDetailDrawer = ref(false)
const showKeyDialog = ref(false)
const editingKey = ref<any>(null)
const keyForm = ref({
  keyName: '',
  apiKey: '',
  priority: 50,
  rateLimitRpd: 10000,
  isActive: true
})

// Methods
const loadAllData = async () => {
  loading.value = true
  try {
    await loadProviders()
  } catch (error) {
    console.error('Failed to load data:', error)
    alert('加载数据失败，请重试')
  } finally {
    loading.value = false
  }
}

const loadProviders = async () => {
  try {
    const response = await aiProviderAPI.getProviders()
    console.log('🔍 Providers API Response:', response)
    console.log('🔍 Response data type:', typeof response.data, Array.isArray(response.data))
    console.log('🔍 Response data:', response.data)
    
    if (response.code === 200) {
      // 检查data是直接数组还是嵌套在data.data中
      const providersList = Array.isArray(response.data) ? response.data : (response.data?.data || [])
      providers.value = providersList
      console.log('✅ Providers loaded:', providers.value.length, 'items')
      if (providers.value.length > 0) {
        console.log('📦 First provider:', providers.value[0])
        console.log('📦 First provider configJson:', providers.value[0]?.configJson)
      }
    }
  } catch (error) {
    console.error('❌ Failed to load providers:', error)
    throw error
  }
}

const openProviderDetail = async (provider: any) => {
  console.log('🎯 Opening provider detail:', provider)
  selectedProvider.value = provider
  showDetailDrawer.value = true
  models.value = []
  apiKeys.value = []
  
  if (provider && provider.id) {
    await Promise.all([
      loadModels(provider.id),
      loadApiKeys(provider.id)
    ])
  } else {
    console.error('❌ Provider or provider.id is undefined:', provider)
  }
}

const closeDetailDrawer = () => {
  if (hasUnsavedChanges.value && !confirm('有未保存的更改，确定要关闭吗？')) {
    return
  }
  showDetailDrawer.value = false
  selectedProvider.value = null
  models.value = []
  apiKeys.value = []
  resetConfigState()
}

const toggleProviderActive = async (provider: any) => {
  try {
    // 如果要启用，先禁用其他所有provider
    if (!provider.isActive) {
      for (const p of providers.value) {
        if (p.id !== provider.id && p.isActive) {
          await aiProviderAPI.updateProvider(p.id, { isActive: false })
        }
      }
    }
    
    // 切换当前provider状态
    const response = await aiProviderAPI.updateProvider(provider.id, { 
      isActive: !provider.isActive 
    })
    
    if (response.code === 200) {
      alert(`${provider.providerName} 已${provider.isActive ? '停用' : '启用'}`)
      await loadProviders()
    }
  } catch (error: any) {
    console.error('Failed to toggle provider:', error)
    alert(`操作失败: ${error.message || '未知错误'}`)
  }
}

const loadModels = async (providerId: number) => {
  try {
    const response = await aiModelAPI.getModels({ providerId, isActive: undefined })
    console.log('🔍 Models Response:', response)
    console.log('🔍 Response data type:', typeof response.data, Array.isArray(response.data))
    
    if (response.code === 200) {
      // 检查data是直接数组还是嵌套在data.data中
      const modelsList = Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.items || [])
      models.value = modelsList
      console.log('📦 Models loaded:', models.value.length, 'models')
      if (models.value.length > 0) {
        console.log('📦 First model:', models.value[0])
      }
    }
  } catch (error) {
    console.error('Failed to load models:', error)
    models.value = [] // 出错时确保是空数组
  }
}

const loadApiKeys = async (providerId: number) => {
  try {
    const response = await aiApiKeyAPI.getKeys(providerId)
    console.log('🔍 API Keys Response:', response)
    console.log('🔍 Response data type:', typeof response.data, Array.isArray(response.data))
    console.log('🔍 Response data:', response.data)
    
    if (response.code === 200) {
      // 检查data是直接数组还是嵌套在data.data中
      const keysList = Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.items || [])
      apiKeys.value = keysList
      console.log('🔑 API Keys loaded:', apiKeys.value.length, 'keys')
      if (apiKeys.value.length > 0) {
        console.log('🔑 First key:', apiKeys.value[0])
      }
      
      // ❌ 已移除自动验证：每次加载都验证会造成不必要的API调用
      // 用户可以通过"测试连接"按钮手动验证
    }
  } catch (error) {
    console.error('Failed to load API keys:', error)
    apiKeys.value = [] // 出错时确保是空数组
  }
}

// 验证所有密钥状态（当前未使用，保留以备后续批量验证需求）
const validateAllKeys = async () => {
  if (apiKeys.value.length === 0) return
  
  console.log('🔄 开始验证所有密钥状态...')
  
  // 批量验证所有key，但避免同时发起过多请求
  const validationPromises = apiKeys.value.map(async (key, index) => {
    // 添加小延迟避免触发rate limit
    await new Promise(resolve => setTimeout(resolve, index * 200))
    
    try {
      const response = await aiApiKeyAPI.validateKey(key.id)
      if (response.code === 200 && response.data) {
        // 兼容嵌套的data结构
        const isValid = response.data?.data?.isValid ?? response.data?.isValid
        // 更新key的状态
        const keyIndex = apiKeys.value.findIndex(k => k.id === key.id)
        if (keyIndex !== -1) {
          apiKeys.value[keyIndex].status = isValid ? 'normal' : 'error'
        }
      }
    } catch (error) {
      console.error(`验证密钥 ${key.keyName} 失败:`, error)
      // 验证失败时标记为错误状态
      const keyIndex = apiKeys.value.findIndex(k => k.id === key.id)
      if (keyIndex !== -1) {
        apiKeys.value[keyIndex].status = 'error'
      }
    }
  })
  
  await Promise.all(validationPromises)
  console.log('✅ 所有密钥状态验证完成')
}

// 删除选中的密钥
const deleteSelectedKey = async () => {
  if (!selectedKeyId.value) return
  
  const selectedKey = apiKeys.value.find(k => k.id === selectedKeyId.value)
  if (!selectedKey) return
  
  if (!confirm(`确定要删除密钥 "${selectedKey.keyName}" 吗？`)) return
  
  try {
    const response = await aiApiKeyAPI.deleteKey(selectedKeyId.value)
    if (response.code === 200) {
      alert('密钥删除成功')
      selectedKeyId.value = null
      await loadApiKeys(selectedProvider.value.id)
      await loadProviders()
    }
  } catch (error: any) {
    console.error('Failed to delete key:', error)
    alert(`删除失败: ${error.message || '未知错误'}`)
  }
}

const syncModels = async () => {
  if (!selectedProvider.value) return
  
  syncing.value = true
  try {
    const response = await aiProviderAPI.syncModels(selectedProvider.value.id)
    console.log('🔄 Sync Models Response:', response)
    console.log('🔄 Response.data:', response.data)
    console.log('🔄 Response.data.data:', response.data?.data)
    console.log('🔄 Count paths:', {
      'data.data.count': response.data?.data?.count,
      'data.count': response.data?.count,
      'raw response': response
    })
    
    if (response.code === 200) {
      // 处理嵌套的data结构（TransformInterceptor包装）
      const count = response.data?.data?.count || response.data?.count || 0
      alert(`成功同步 ${count} 个模型`)
      await loadModels(selectedProvider.value.id)
    }
  } catch (error: any) {
    console.error('Failed to sync models:', error)
    alert(`同步模型失败: ${error.message || '未知错误'}`)
  } finally {
    syncing.value = false
  }
}

const setDefaultModel = async (modelId: number) => {
  try {
    const response = await aiModelAPI.setDefault(modelId)
    if (response.code === 200) {
      alert('默认模型设置成功')
      await loadModels(selectedProvider.value.id)
    }
  } catch (error: any) {
    console.error('Failed to set default model:', error)
    alert(`设置失败: ${error.message || '未知错误'}`)
  }
}

const toggleModelActive = async (modelId: number, currentState: boolean) => {
  try {
    const response = await aiModelAPI.toggleActive(modelId)
    if (response.code === 200) {
      alert(`模型已${currentState ? '停用' : '启用'}`)
      await loadModels(selectedProvider.value.id)
    }
  } catch (error: any) {
    console.error('Failed to toggle model:', error)
    alert(`操作失败: ${error.message || '未知错误'}`)
  }
}

const openAddKeyDialog = () => {
  editingKey.value = null
  keyForm.value = {
    keyName: '',
    apiKey: '',
    priority: 50,
    rateLimitRpd: 10000,
    isActive: true
  }
  showKeyDialog.value = true
}

const openEditKeyDialog = (key: any) => {
  editingKey.value = key
  keyForm.value = {
    keyName: key.keyName,
    apiKey: '', // 不回显密钥
    priority: key.priority,
    rateLimitRpd: key.rateLimitRpd,
    isActive: key.isActive
  }
  showKeyDialog.value = true
}

const closeKeyDialog = () => {
  showKeyDialog.value = false
  editingKey.value = null
}

const saveKey = async () => {
  if (!selectedProvider.value) return
  
  // 验证必填字段
  if (!keyForm.value.keyName || (!editingKey.value && !keyForm.value.apiKey)) {
    alert('请填写必填字段')
    return
  }
  
  // 检查重复的key名称（仅在新增时）
  if (!editingKey.value) {
    const isDuplicate = apiKeys.value.some(key => key.keyName === keyForm.value.keyName)
    if (isDuplicate) {
      alert('密钥名称已存在，请使用不同的名称')
      return
    }
  }
  
  saving.value = true
  try {
    if (editingKey.value) {
      // 更新密钥
      const updateData: any = {
        keyName: keyForm.value.keyName,
        priority: keyForm.value.priority,
        rateLimitRpd: keyForm.value.rateLimitRpd,
        isActive: keyForm.value.isActive
      }
      
      // 只在有新密钥时才更新
      if (keyForm.value.apiKey) {
        updateData.apiKey = keyForm.value.apiKey
      }
      
      const response = await aiApiKeyAPI.updateKey(editingKey.value.id, updateData)
      if (response.code === 200) {
        alert('密钥更新成功')
        closeKeyDialog()
        await loadApiKeys(selectedProvider.value.id)
        // 刷新providers列表以更新卡片统计
        await loadProviders()
      }
    } else {
      // 创建新密钥
      const response = await aiApiKeyAPI.createKey(selectedProvider.value.id, {
        providerId: selectedProvider.value.id,
        keyName: keyForm.value.keyName,
        apiKey: keyForm.value.apiKey,
        priority: keyForm.value.priority,
        rateLimitRpd: keyForm.value.rateLimitRpd,
        isActive: keyForm.value.isActive
      })
      
      if (response.code === 201 || response.code === 200) {
        alert('密钥添加成功')
        closeKeyDialog()
        
        // 先刷新keys列表
        await loadApiKeys(selectedProvider.value.id)
        
        // 刷新providers列表以更新卡片统计
        await loadProviders()
        
        // 自动选中新添加的key（通过返回的id或查找最新的key）
        if (response.data?.id) {
          selectedKeyId.value = response.data.id
          hasUnsavedChanges.value = true
        } else if (apiKeys.value.length > 0) {
          // 如果API没有返回id，选择列表中的最后一个（最新添加的）
          const latestKey = apiKeys.value[apiKeys.value.length - 1]
          selectedKeyId.value = latestKey.id
          hasUnsavedChanges.value = true
        }
      }
    }
  } catch (error: any) {
    console.error('Failed to save key:', error)
    alert(`保存失败: ${error.message || '未知错误'}`)
  } finally {
    saving.value = false
  }
}

const deleteKey = async (keyId: number, keyName: string) => {
  if (!confirm(`确定要删除密钥 "${keyName}" 吗？`)) return
  
  try {
    const response = await aiApiKeyAPI.deleteKey(keyId)
    if (response.code === 200) {
      alert('密钥删除成功')
      
      // 如果删除的是当前选中的key，清除选择
      if (selectedKeyId.value === keyId) {
        selectedKeyId.value = null
      }
      
      await loadApiKeys(selectedProvider.value.id)
      // 刷新providers列表以更新卡片统计
      await loadProviders()
    }
  } catch (error: any) {
    console.error('Failed to delete key:', error)
    alert(`删除失败: ${error.message || '未知错误'}`)
  }
}

const validateKey = async (keyId: number) => {
  try {
    const response = await aiApiKeyAPI.validateKey(keyId)
    if (response.code === 200) {
      // 兼容嵌套的data结构：response.data.data.isValid 或 response.data.isValid
      const isValid = response.data?.data?.isValid ?? response.data?.isValid
      alert(isValid ? '密钥验证通过' : '密钥无效')
    }
  } catch (error: any) {
    console.error('Failed to validate key:', error)
    alert(`验证失败: ${error.message || '未知错误'}`)
  }
}

const getKeyStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'normal': '正常',
    'rate_limited': '限流中',
    'error': '错误',
    'exhausted': '已耗尽'
  }
  return statusMap[status] || status
}

const getProviderIcon = (providerCode: string): string => {
  const iconMap: Record<string, string> = {
    'openai': 'simple-icons:openai',
    'anthropic': 'simple-icons:anthropic',
    'claude': 'simple-icons:anthropic',
    'deepseek': 'mdi:brain',
    'gemini': 'simple-icons:googlegemini'
  }
  return iconMap[providerCode] || 'mdi:robot'
}

const handleImageError = (event: Event) => {
  console.warn('Logo image failed to load')
  const img = event.target as HTMLImageElement
  if (img && img.parentElement) {
    img.style.display = 'none'
  }
}

// 重置配置流程状态
const resetConfigState = () => {
  configStep.value = 1
  selectedKeyId.value = null
  selectedModelId.value = null
  testResult.value = null
  hasUnsavedChanges.value = false
}

// 进入下一步
const nextStep = () => {
  if (configStep.value < 3) {
    configStep.value++
  }
}

// 返回上一步
const prevStep = () => {
  if (configStep.value > 1) {
    configStep.value--
  }
}

// 选择API Key
const selectApiKey = (keyId: number) => {
  selectedKeyId.value = keyId
  hasUnsavedChanges.value = true
}

// 选择模型
const selectModel = (modelId: number) => {
  selectedModelId.value = modelId
  hasUnsavedChanges.value = true
}

// 测试连接
const testConnection = async () => {
  if (!selectedKeyId.value) {
    alert('请先选择API密钥')
    return
  }
  
  testing.value = true
  testResult.value = null
  
  try {
    const response = await aiApiKeyAPI.validateKey(selectedKeyId.value)
    // 兼容嵌套的data结构：response.data.data.isValid 或 response.data.isValid
    const isValid = response.data?.data?.isValid ?? response.data?.isValid
    
    if (response.code === 200 && isValid) {
      testResult.value = {
        success: true,
        message: '连接测试成功！密钥有效且可用。'
      }
    } else {
      testResult.value = {
        success: false,
        message: '连接测试失败：密钥无效或不可用。'
      }
    }
  } catch (error: any) {
    console.error('测试连接失败:', error)
    testResult.value = {
      success: false,
      message: `连接测试失败: ${error.message || '未知错误'}`
    }
  } finally {
    testing.value = false
  }
}

// 保存完整配置
const saveCompleteConfig = async () => {
  if (!selectedProvider.value) {
    alert('未选择Provider')
    return
  }
  
  if (!selectedKeyId.value) {
    alert('请先配置并选择API密钥')
    return
  }
  
  if (!selectedModelId.value) {
    alert('请选择一个模型')
    return
  }
  
  if (!testResult.value?.success) {
    if (!confirm('连接测试未通过或未测试，确定要保存吗？')) {
      return
    }
  }
  
  saving.value = true
  try {
    // 1. 激活选中的API Key
    await aiApiKeyAPI.updateKey(selectedKeyId.value, { isActive: true })
    
    // 2. 设置选中的模型为默认模型
    await aiModelAPI.setDefault(selectedModelId.value)
    
    // 3. 激活Provider
    await aiProviderAPI.updateProvider(selectedProvider.value.id, { 
      isActive: true 
    })
    
    alert('配置保存成功！')
    hasUnsavedChanges.value = false
    
    // 刷新数据
    await loadAllData()
    closeDetailDrawer()
  } catch (error: any) {
    console.error('保存配置失败:', error)
    alert(`保存失败: ${error.message || '未知错误'}`)
  } finally {
    saving.value = false
  }
}


// Lifecycle
onMounted(() => {
  loadAllData()
})
</script>

<style scoped>
.cyber-input {
  @apply w-full px-4 py-2 bg-glass-white/10 backdrop-blur-xl border border-gray-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple transition-all duration-300;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>

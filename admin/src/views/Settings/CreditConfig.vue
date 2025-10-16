<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">积分配置</h1>
        <p class="text-gray-400 mt-1">管理用户积分系统和消费规则</p>
      </div>
      
      <div class="flex items-center space-x-4">
        <CyberButton
          variant="outline"
          left-icon="mdi:refresh"
          @click="loadConfig"
          :loading="loading"
        >
          刷新配置
        </CyberButton>
        
        <CyberButton
          left-icon="mdi:content-save"
          @click="saveConfig"
          :loading="saving"
        >
          保存配置
        </CyberButton>
      </div>
    </div>

    <!-- Credit Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatsCard
        title="总积分发放"
        :value="stats.totalIssued.toLocaleString()"
        change="+15.2%"
        trend="up"
        icon="mdi:coin"
        color="primary"
        :delay="0"
      />
      
      <StatsCard
        title="总积分消费"
        :value="stats.totalConsumed.toLocaleString()"
        change="+22.8%"
        trend="up"
        icon="mdi:cash-multiple"
        color="success"
        :delay="100"
      />
      
      <StatsCard
        title="活跃用户"
        :value="stats.activeUsers.toLocaleString()"
        change="+8.5%"
        trend="up"
        icon="mdi:account-cash"
        color="info"
        :delay="200"
      />
      
      <StatsCard
        title="平均余额"
        :value="stats.averageBalance.toLocaleString()"
        change="+5.3%"
        trend="up"
        icon="mdi:wallet"
        color="warning"
        :delay="300"
      />
    </div>

    <!-- Basic Credit Settings -->
    <CyberCard title="基础积分设置" :delay="400">
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              新用户注册奖励
            </label>
            <div class="flex items-center space-x-3">
              <CyberInput
                v-model.number="config.newUserBonus"
                type="number"
                min="0"
                placeholder="积分数量..."
                @input="onConfigChange"
              />
              <span class="text-gray-400 text-sm">积分</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">新用户注册时获得的初始积分</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              每日签到奖励
            </label>
            <div class="flex items-center space-x-3">
              <CyberInput
                v-model.number="config.dailySignInBonus"
                type="number"
                min="0"
                placeholder="积分数量..."
                @input="onConfigChange"
              />
              <span class="text-gray-400 text-sm">积分</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">用户每日签到可获得的积分</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              推荐用户奖励
            </label>
            <div class="flex items-center space-x-3">
              <CyberInput
                v-model.number="config.referralBonus"
                type="number"
                min="0"
                placeholder="积分数量..."
                @input="onConfigChange"
              />
              <span class="text-gray-400 text-sm">积分</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">成功推荐新用户注册的奖励积分</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              VIP用户每日额外奖励
            </label>
            <div class="flex items-center space-x-3">
              <CyberInput
                v-model.number="config.vipDailyBonus"
                type="number"
                min="0"
                placeholder="积分数量..."
                @input="onConfigChange"
              />
              <span class="text-gray-400 text-sm">积分</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">VIP用户每日额外获得的积分</p>
          </div>
        </div>
      </div>
    </CyberCard>

    <!-- Music Generation Costs -->
    <CyberCard title="音乐生成消费" :delay="500">
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              基础生成费用 (30秒以内)
            </label>
            <div class="flex items-center space-x-3">
              <CyberInput
                v-model.number="config.basicGenerationCost"
                type="number"
                min="1"
                placeholder="积分数量..."
                @input="onConfigChange"
              />
              <span class="text-gray-400 text-sm">积分/次</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">生成30秒以内音乐的基础费用</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              长音乐额外费用 (每30秒)
            </label>
            <div class="flex items-center space-x-3">
              <CyberInput
                v-model.number="config.extendedGenerationCost"
                type="number"
                min="1"
                placeholder="积分数量..."
                @input="onConfigChange"
              />
              <span class="text-gray-400 text-sm">积分/30秒</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">超过30秒后每增加30秒的额外费用</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              高品质生成费用倍数
            </label>
            <div class="flex items-center space-x-3">
              <CyberInput
                v-model.number="config.highQualityMultiplier"
                type="number"
                min="1"
                step="0.1"
                placeholder="倍数..."
                @input="onConfigChange"
              />
              <span class="text-gray-400 text-sm">倍</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">选择高品质音频时的费用倍数</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              VIP用户折扣
            </label>
            <div class="flex items-center space-x-3">
              <CyberInput
                v-model.number="config.vipDiscount"
                type="number"
                min="0"
                max="100"
                placeholder="折扣百分比..."
                @input="onConfigChange"
              />
              <span class="text-gray-400 text-sm">% 折扣</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">VIP用户享受的折扣比例</p>
          </div>
        </div>
        
        <!-- Cost Calculator -->
        <div class="border-t border-gray-700/30 pt-6">
          <h4 class="text-lg font-semibold text-white mb-4">费用计算器</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">音乐时长 (秒)</label>
              <CyberInput
                v-model.number="calculator.duration"
                type="number"
                min="30"
                max="300"
                placeholder="时长..."
                @input="calculateCost"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">用户类型</label>
              <select 
                v-model="calculator.userType"
                class="cyber-input"
                @change="calculateCost"
              >
                <option value="free">普通用户</option>
                <option value="vip">VIP用户</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">音质</label>
              <select 
                v-model="calculator.quality"
                class="cyber-input"
                @change="calculateCost"
              >
                <option value="standard">标准音质</option>
                <option value="high">高音质</option>
              </select>
            </div>
          </div>
          
          <div class="mt-4 p-4 bg-cyber-purple/10 border border-cyber-purple/30 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="text-white font-medium">预计消费积分：</span>
              <span class="text-2xl font-bold text-cyber-purple">{{ calculatedCost }}</span>
            </div>
          </div>
        </div>
      </div>
    </CyberCard>

    <!-- Transaction Rules -->
    <CyberCard title="交易规则" :delay="600">
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              积分有效期 (天)
            </label>
            <CyberInput
              v-model.number="config.creditExpiration"
              type="number"
              min="30"
              max="730"
              placeholder="有效期天数..."
              @input="onConfigChange"
            />
            <p class="text-xs text-gray-500 mt-1">积分的有效期，0表示永久有效</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              单日最大消费限制
            </label>
            <CyberInput
              v-model.number="config.dailySpendLimit"
              type="number"
              min="100"
              placeholder="积分数量..."
              @input="onConfigChange"
            />
            <p class="text-xs text-gray-500 mt-1">用户单日最大积分消费量</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              最小充值金额
            </label>
            <div class="flex items-center space-x-3">
              <CyberInput
                v-model.number="config.minRecharge"
                type="number"
                min="1"
                placeholder="金额..."
                @input="onConfigChange"
              />
              <span class="text-gray-400 text-sm">元</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">用户单次充值的最小金额</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              积分兑换比例
            </label>
            <div class="flex items-center space-x-3">
              <span class="text-gray-300">1元 = </span>
              <CyberInput
                v-model.number="config.exchangeRate"
                type="number"
                min="1"
                placeholder="积分数量..."
                @input="onConfigChange"
                class="w-24"
              />
              <span class="text-gray-400 text-sm">积分</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">人民币与积分的兑换比例</p>
          </div>
        </div>
        
        <div class="space-y-4">
          <h4 class="text-lg font-semibold text-white">高级规则</h4>
          
          <div class="flex items-center space-x-3">
            <input
              v-model="config.enableNegativeBalance"
              type="checkbox"
              id="negativeBalance"
              class="rounded border-gray-600 bg-gray-700 text-cyber-purple focus:ring-cyber-purple"
              @change="onConfigChange"
            />
            <label for="negativeBalance" class="text-sm text-gray-300">允许负积分余额</label>
            <p class="text-xs text-gray-500">允许VIP用户的积分余额为负数</p>
          </div>
          
          <div class="flex items-center space-x-3">
            <input
              v-model="config.enableCreditTransfer"
              type="checkbox"
              id="creditTransfer"
              class="rounded border-gray-600 bg-gray-700 text-cyber-purple focus:ring-cyber-purple"
              @change="onConfigChange"
            />
            <label for="creditTransfer" class="text-sm text-gray-300">启用积分转赠</label>
            <p class="text-xs text-gray-500">允许用户之间转赠积分</p>
          </div>
          
          <div class="flex items-center space-x-3">
            <input
              v-model="config.enableAutoRecharge"
              type="checkbox"
              id="autoRecharge"
              class="rounded border-gray-600 bg-gray-700 text-cyber-purple focus:ring-cyber-purple"
              @change="onConfigChange"
            />
            <label for="autoRecharge" class="text-sm text-gray-300">启用自动充值</label>
            <p class="text-xs text-gray-500">积分不足时自动充值</p>
          </div>
        </div>
      </div>
    </CyberCard>

    <!-- Recent Transactions -->
    <CyberCard title="最近交易记录" :delay="700">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-700/30">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">时间</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">用户</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">类型</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">积分变动</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">余额</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">说明</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="transaction in recentTransactions"
              :key="transaction.id"
              class="border-b border-gray-700/20 hover:bg-glass-white/5 transition-colors"
            >
              <td class="py-3 px-4 text-sm text-gray-300">
                {{ formatTime(transaction.timestamp) }}
              </td>
              <td class="py-3 px-4 text-sm text-white">
                {{ transaction.username }}
              </td>
              <td class="py-3 px-4">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="{
                    'bg-green-500/20 text-green-400': transaction.type === 'earn',
                    'bg-red-500/20 text-red-400': transaction.type === 'spend',
                    'bg-blue-500/20 text-blue-400': transaction.type === 'recharge'
                  }"
                >
                  {{ getTransactionTypeText(transaction.type) }}
                </span>
              </td>
              <td class="py-3 px-4 text-sm font-medium" :class="{
                'text-green-400': transaction.amount > 0,
                'text-red-400': transaction.amount < 0
              }">
                {{ transaction.amount > 0 ? '+' : '' }}{{ transaction.amount }}
              </td>
              <td class="py-3 px-4 text-sm text-gray-300">
                {{ transaction.balance.toLocaleString() }}
              </td>
              <td class="py-3 px-4 text-sm text-gray-400">
                {{ transaction.description }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </CyberCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import CyberCard from '@/components/UI/CyberCard.vue'
import CyberButton from '@/components/UI/CyberButton.vue'
import CyberInput from '@/components/UI/CyberInput.vue'
import StatsCard from '@/views/Dashboard/components/StatsCard.vue'

// State
const loading = ref(false)
const saving = ref(false)
const hasChanges = ref(false)

// Configuration
const config = ref({
  // Basic settings
  newUserBonus: 100,
  dailySignInBonus: 10,
  referralBonus: 50,
  vipDailyBonus: 20,
  
  // Generation costs
  basicGenerationCost: 10,
  extendedGenerationCost: 5,
  highQualityMultiplier: 1.5,
  vipDiscount: 20,
  
  // Transaction rules
  creditExpiration: 365,
  dailySpendLimit: 1000,
  minRecharge: 10,
  exchangeRate: 100,
  enableNegativeBalance: false,
  enableCreditTransfer: true,
  enableAutoRecharge: false
})

// Calculator
const calculator = ref({
  duration: 60,
  userType: 'free',
  quality: 'standard'
})

// Statistics
const stats = ref({
  totalIssued: 2580000,
  totalConsumed: 1950000,
  activeUsers: 1234,
  averageBalance: 856
})

// Recent transactions
const recentTransactions = ref([
  { id: 1, username: '用户001', type: 'spend', amount: -15, balance: 285, description: '生成音乐(60秒)', timestamp: Date.now() - 120000 },
  { id: 2, username: '用户002', type: 'earn', amount: 10, balance: 320, description: '每日签到', timestamp: Date.now() - 240000 },
  { id: 3, username: '用户003', type: 'recharge', amount: 1000, balance: 1450, description: '充值 10 元', timestamp: Date.now() - 360000 },
  { id: 4, username: '用户004', type: 'spend', amount: -20, balance: 180, description: '生成音乐(120秒)', timestamp: Date.now() - 480000 },
  { id: 5, username: '用户005', type: 'earn', amount: 50, description: '推荐奖励', balance: 350, timestamp: Date.now() - 600000 }
])

// Computed
const calculatedCost = computed(() => {
  const baseCost = config.value.basicGenerationCost
  const duration = calculator.value.duration || 30
  const extraSections = Math.max(0, Math.ceil((duration - 30) / 30))
  const extendedCost = extraSections * config.value.extendedGenerationCost
  
  let totalCost = baseCost + extendedCost
  
  // Quality multiplier
  if (calculator.value.quality === 'high') {
    totalCost *= config.value.highQualityMultiplier
  }
  
  // VIP discount
  if (calculator.value.userType === 'vip') {
    totalCost *= (1 - config.value.vipDiscount / 100)
  }
  
  return Math.ceil(totalCost)
})

// Methods
const loadConfig = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Credit config loaded')
  } catch (error) {
    console.error('Failed to load credit config:', error)
  } finally {
    loading.value = false
  }
}

const saveConfig = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    hasChanges.value = false
    console.log('Credit config saved:', config.value)
  } catch (error) {
    console.error('Failed to save credit config:', error)
  } finally {
    saving.value = false
  }
}

const onConfigChange = () => {
  hasChanges.value = true
}

const calculateCost = () => {
  // Cost calculation is handled by computed property
}

const getTransactionTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    'earn': '获得',
    'spend': '消费',
    'recharge': '充值'
  }
  return typeMap[type] || type
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.cyber-input {
  @apply w-full px-4 py-2 bg-glass-white/10 backdrop-blur-xl border border-gray-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple transition-all duration-300;
}
</style>
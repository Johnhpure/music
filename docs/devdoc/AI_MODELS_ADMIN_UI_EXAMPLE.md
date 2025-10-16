# AI模型管理后台前端界面示例

> 这是一个Vue 3 + Element Plus的管理界面示例
> 可用于uni-app管理后台或独立的Web管理系统

## 1. Provider管理页面

```vue
<template>
  <div class="ai-provider-manager">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>AI Provider管理</span>
          <el-button type="primary" @click="showAddDialog">添加Provider</el-button>
        </div>
      </template>

      <el-table :data="providers" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="providerName" label="名称" />
        <el-table-column prop="providerCode" label="代码" />
        <el-table-column prop="baseUrl" label="Base URL" />
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="模型数">
          <template #default="{ row }">
            {{ row.modelsCount }}
          </template>
        </el-table-column>
        <el-table-column label="活跃Key">
          <template #default="{ row }">
            {{ row.activeKeysCount }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300">
          <template #default="{ row }">
            <el-button size="small" @click="manageKeys(row)">管理Key</el-button>
            <el-button size="small" @click="syncModels(row)">同步模型</el-button>
            <el-button size="small" type="primary" @click="editProvider(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Key管理对话框 -->
    <el-dialog v-model="keysDialogVisible" title="API Key管理" width="900px">
      <div class="keys-header">
        <el-button type="primary" size="small" @click="showAddKeyDialog">添加Key</el-button>
      </div>

      <el-table :data="apiKeys" stripe>
        <el-table-column prop="keyName" label="名称" />
        <el-table-column prop="apiKey" label="API Key" />
        <el-table-column label="优先级">
          <template #default="{ row }">
            <el-tag>{{ row.priority }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag 
              :type="getKeyStatusType(row.status)"
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="今日请求">
          <template #default="{ row }">
            {{ row.requestsCountToday }} / {{ row.rateLimitRpd }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="validateKey(row)">验证</el-button>
            <el-button size="small" @click="resetKeyStats(row)">重置统计</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import api from '@/api';

const providers = ref([]);
const apiKeys = ref([]);
const keysDialogVisible = ref(false);
const currentProvider = ref(null);

onMounted(() => {
  loadProviders();
});

async function loadProviders() {
  try {
    const res = await api.get('/api/admin/ai-providers');
    providers.value = res.data;
  } catch (error) {
    ElMessage.error('加载失败: ' + error.message);
  }
}

async function manageKeys(provider) {
  currentProvider.value = provider;
  try {
    const res = await api.get(`/api/admin/ai-providers/${provider.id}/keys`);
    apiKeys.value = res.data;
    keysDialogVisible.value = true;
  } catch (error) {
    ElMessage.error('加载Key失败: ' + error.message);
  }
}

async function syncModels(provider) {
  try {
    const res = await api.post(`/api/admin/ai-providers/${provider.id}/sync-models`);
    ElMessage.success(res.message);
    loadProviders();
  } catch (error) {
    ElMessage.error('同步失败: ' + error.message);
  }
}

async function validateKey(key) {
  try {
    const res = await api.post(`/api/admin/ai-providers/keys/${key.id}/validate`);
    ElMessage.success(res.message);
  } catch (error) {
    ElMessage.error('验证失败: ' + error.message);
  }
}

async function resetKeyStats(key) {
  try {
    await api.post(`/api/admin/ai-providers/keys/${key.id}/reset-stats`);
    ElMessage.success('统计已重置');
    manageKeys(currentProvider.value);
  } catch (error) {
    ElMessage.error('重置失败: ' + error.message);
  }
}

function getKeyStatusType(status) {
  const types = {
    normal: 'success',
    rate_limited: 'warning',
    error: 'danger',
    exhausted: 'info',
  };
  return types[status] || 'info';
}
</script>
```

## 2. 统计仪表盘

```vue
<template>
  <div class="ai-stats-dashboard">
    <el-row :gutter="20">
      <!-- 概览卡片 -->
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-item">
            <div class="stats-label">总请求数</div>
            <div class="stats-value">{{ formatNumber(stats.totalRequests) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-item">
            <div class="stats-label">成功率</div>
            <div class="stats-value">{{ (stats.successRate * 100).toFixed(2) }}%</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-item">
            <div class="stats-label">总Token</div>
            <div class="stats-value">{{ formatNumber(stats.totalTokens) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-item">
            <div class="stats-label">总成本</div>
            <div class="stats-value">${{ stats.totalCost.toFixed(2) }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势图表 -->
    <el-card style="margin-top: 20px;">
      <template #header>
        <span>使用趋势</span>
        <el-radio-group v-model="trendDays" @change="loadTrendData" size="small" style="float: right;">
          <el-radio-button :label="7">7天</el-radio-button>
          <el-radio-button :label="30">30天</el-radio-button>
          <el-radio-button :label="90">90天</el-radio-button>
        </el-radio-group>
      </template>
      
      <div id="trend-chart" style="height: 400px;"></div>
    </el-card>

    <!-- 错误统计 -->
    <el-card style="margin-top: 20px;">
      <template #header>
        <span>错误统计</span>
      </template>

      <el-row :gutter="20">
        <el-col :span="12">
          <h4>按错误码</h4>
          <el-table :data="stats.errors.errorsByCode" stripe size="small">
            <el-table-column prop="code" label="错误码" />
            <el-table-column prop="count" label="次数" />
          </el-table>
        </el-col>
        <el-col :span="12">
          <h4>按Key</h4>
          <el-table :data="stats.errors.errorsByKey" stripe size="small">
            <el-table-column prop="keyId" label="Key ID" />
            <el-table-column prop="count" label="错误次数" />
          </el-table>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import api from '@/api';

const stats = ref({
  totalRequests: 0,
  successRate: 0,
  totalTokens: 0,
  totalCost: 0,
  errors: {
    errorsByCode: [],
    errorsByKey: [],
  },
});

const trendDays = ref(7);
let chart = null;

onMounted(() => {
  loadDashboardStats();
  loadTrendData();
});

async function loadDashboardStats() {
  try {
    const res = await api.get('/api/admin/ai-stats/dashboard', {
      params: { days: trendDays.value },
    });
    stats.value = res.data;
  } catch (error) {
    console.error('加载统计失败:', error);
  }
}

async function loadTrendData() {
  try {
    const res = await api.get('/api/admin/ai-stats/usage/trend', {
      params: { days: trendDays.value },
    });
    
    renderTrendChart(res.data);
  } catch (error) {
    console.error('加载趋势数据失败:', error);
  }
}

function renderTrendChart(data) {
  if (!chart) {
    chart = echarts.init(document.getElementById('trend-chart'));
  }

  const option = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['请求数', 'Token数', '成本($)'],
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date),
    },
    yAxis: [
      {
        type: 'value',
        name: '请求数/Token数',
      },
      {
        type: 'value',
        name: '成本($)',
      },
    ],
    series: [
      {
        name: '请求数',
        type: 'line',
        data: data.map(item => item.requests),
        yAxisIndex: 0,
      },
      {
        name: 'Token数',
        type: 'line',
        data: data.map(item => item.tokens),
        yAxisIndex: 0,
      },
      {
        name: '成本($)',
        type: 'line',
        data: data.map(item => item.cost),
        yAxisIndex: 1,
      },
    ],
  };

  chart.setOption(option);
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
</script>

<style scoped>
.stats-card {
  text-align: center;
}

.stats-item {
  padding: 20px 0;
}

.stats-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 10px;
}

.stats-value {
  font-size: 28px;
  font-weight: bold;
  color: #409EFF;
}
</style>
```

## 3. API调用示例

```javascript
// src/api/ai-models.js
import request from '@/utils/request';

export default {
  // Provider管理
  getProviders() {
    return request.get('/api/admin/ai-providers');
  },

  createProvider(data) {
    return request.post('/api/admin/ai-providers', data);
  },

  updateProvider(id, data) {
    return request.put(`/api/admin/ai-providers/${id}`, data);
  },

  syncModels(id) {
    return request.post(`/api/admin/ai-providers/${id}/sync-models`);
  },

  // API Key管理
  getKeys(providerId) {
    return request.get(`/api/admin/ai-providers/${providerId}/keys`);
  },

  createKey(providerId, data) {
    return request.post(`/api/admin/ai-providers/${providerId}/keys`, data);
  },

  updateKey(id, data) {
    return request.put(`/api/admin/ai-providers/keys/${id}`, data);
  },

  validateKey(id) {
    return request.post(`/api/admin/ai-providers/keys/${id}/validate`);
  },

  resetKeyStats(id) {
    return request.post(`/api/admin/ai-providers/keys/${id}/reset-stats`);
  },

  // 统计
  getDashboard(days = 7) {
    return request.get('/api/admin/ai-stats/dashboard', { params: { days } });
  },

  getTrend(days = 30) {
    return request.get('/api/admin/ai-stats/usage/trend', { params: { days } });
  },

  getLogs(params) {
    return request.get('/api/admin/ai-stats/logs', { params });
  },
};
```

---

**注意事项**:

1. 这些示例需要配合Element Plus UI库使用
2. 需要配置API请求拦截器处理JWT认证
3. ECharts需要单独安装: `npm install echarts`
4. 实际使用时需要根据项目结构调整路径
5. 建议添加权限控制，只有管理员可以访问

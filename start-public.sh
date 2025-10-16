#!/bin/bash

# 公网环境启动脚本
# 使用 Cloudflare Tunnel 映射
# adminapi.jianzhile.vip -> 192.168.1.118:3000
# admin.jianzhile.vip -> 192.168.1.118:5173

set -e

echo "=========================================="
echo "  切换到公网环境 (Cloudflare Tunnel)"
echo "  API域名: adminapi.jianzhile.vip"
echo "  管理后台: admin.jianzhile.vip"
echo "=========================================="

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 备份配置文件
echo -e "${YELLOW}[1/5] 备份当前配置文件...${NC}"
mkdir -p .config-backups
cp backend/.env .config-backups/backend.env.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
cp admin/.env.local .config-backups/admin.env.local.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
cp admin/vite.config.ts .config-backups/vite.config.ts.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
cp miniprogram/config/index.js .config-backups/miniprogram.config.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# 2. 更新后端配置
echo -e "${YELLOW}[2/5] 更新后端配置 (backend/.env)...${NC}"
sed -i 's|^FRONTEND_URL=.*|FRONTEND_URL=https://admin.jianzhile.vip,http://localhost:5173,http://localhost:8080|g' backend/.env

# 3. 更新管理后台配置
echo -e "${YELLOW}[3/5] 更新管理后台配置 (admin/.env.local)...${NC}"
cat > admin/.env.local << 'EOF'
# 公网环境配置 - Cloudflare Tunnel
VITE_API_BASE_URL=https://adminapi.jianzhile.vip/api
EOF

# 4. 更新 Vite 配置文件为公网模式
echo -e "${YELLOW}[4/5] 更新 Vite 配置 (admin/vite.config.ts)...${NC}"
cat > admin/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/views': resolve(__dirname, 'src/views'),
      '@/stores': resolve(__dirname, 'src/stores'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/api': resolve(__dirname, 'src/api'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/assets': resolve(__dirname, 'src/assets')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: false,
    cors: true,
    strictPort: true,
    allowedHosts: [
      'admin.jianzhile.vip',
      '.jianzhile.vip'
    ],
    hmr: {
      protocol: 'wss',
      host: 'admin.jianzhile.vip',
      port: 443
    },
    proxy: {
      '/api': {
        target: 'http://192.168.1.118:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['@headlessui/vue', '@vueuse/core'],
          'chart-vendor': ['echarts', 'echarts-gl']
        }
      }
    }
  }
})
EOF

# 5. 更新小程序配置
echo -e "${YELLOW}[5/5] 更新小程序配置 (miniprogram/config/index.js)...${NC}"
cat > miniprogram/config/index.js << 'EOF'
/**
 * AI音乐平台后端地址
 */
// 开发环境 - 公网环境 (Cloudflare Tunnel)
const devApiAddress = 'https://adminapi.jianzhile.vip'
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
EOF

echo ""
echo -e "${GREEN}✓ 配置文件已更新为公网模式${NC}"
echo ""
echo "=========================================="
echo "  配置摘要："
echo "  • 后端API: https://adminapi.jianzhile.vip"
echo "  • 管理后台: https://admin.jianzhile.vip"
echo "  • 本地后端: http://192.168.1.118:3000"
echo "  • 本地前端: http://192.168.1.118:5173"
echo "  • 数据库: 172.17.0.3:3306 (Docker)"
echo "  • Redis: 172.17.0.2:6379 (Docker)"
echo "=========================================="
echo ""
echo -e "${YELLOW}提示：${NC}"
echo "  1. 配置备份已保存到 .config-backups/ 目录"
echo "  2. 请确保 Cloudflare Tunnel 服务正在运行"
echo "  3. 使用 ./restart-backend.sh 重启后端服务"
echo "  4. 使用 ./restart-admin.sh 重启管理后台"
echo "  5. 在微信开发者工具中重新编译小程序"
echo "  6. 公网访问: https://admin.jianzhile.vip"
echo ""
echo -e "${YELLOW}检查 Cloudflare Tunnel 状态：${NC}"
if pgrep -f cloudflared > /dev/null; then
    echo -e "${GREEN}✓ Cloudflare Tunnel 正在运行${NC}"
else
    echo -e "${YELLOW}⚠ Cloudflare Tunnel 未运行，请先启动！${NC}"
    echo "  启动命令: cloudflared tunnel run"
fi
echo ""

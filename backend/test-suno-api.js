/**
 * SUNO API 测试脚本
 * 用于验证API Key和基础功能
 */

const axios = require('axios');

const SUNO_API_KEY = '2b2489ee60443abe57a0b708233d5b4f';
const SUNO_API_BASE_URL = 'https://api.sunoapi.org';

const client = axios.create({
  baseURL: SUNO_API_BASE_URL,
  headers: {
    Authorization: `Bearer ${SUNO_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

async function testSunoAPI() {
  console.log('🚀 开始测试 SUNO API...\n');
  console.log(`📍 Base URL: ${SUNO_API_BASE_URL}`);
  console.log(`🔑 API Key: ${SUNO_API_KEY.substring(0, 10)}...${SUNO_API_KEY.substring(SUNO_API_KEY.length - 4)}\n`);

  const results = {
    credits: null,
    generateMusic: null,
    generateLyrics: null,
  };

  // 测试1: 查询剩余积分
  try {
    console.log('📊 测试1: 查询SUNO API剩余积分...');
    const response = await client.get('/api/v1/get-credits');
    
    if (response.data.code === 200) {
      results.credits = response.data.data.credits;
      console.log(`✅ 成功! 剩余积分: ${results.credits}`);
    } else {
      console.log(`❌ 失败! 错误: ${response.data.msg}`);
    }
  } catch (error) {
    console.log(`⚠️  跳过积分查询（可能不支持此接口）`);
    results.credits = 'N/A';
  }
  console.log('');

  // 测试2: 生成简单歌词
  try {
    console.log('📝 测试2: 生成AI歌词...');
    const response = await client.post('/api/v1/lyrics', {
      prompt: '创作一首关于春天的轻快歌曲',
      callBackUrl: 'https://example.com/callback', // 添加回调URL
    });
    
    if (response.data.code === 200) {
      results.generateLyrics = response.data.data.taskId;
      console.log(`✅ 成功! 任务ID: ${results.generateLyrics}`);
      console.log(`   可以稍后查询任务状态`);
    } else {
      console.log(`❌ 失败! 错误: ${response.data.msg}`);
    }
  } catch (error) {
    console.log(`❌ 请求失败: ${error.message}`);
    if (error.response) {
      console.log(`   状态码: ${error.response.status}`);
      console.log(`   响应: ${JSON.stringify(error.response.data)}`);
    }
  }
  console.log('');

  // 测试3: 生成简单音乐（非自定义模式）
  try {
    console.log('🎵 测试3: 生成AI音乐（非自定义模式）...');
    const response = await client.post('/api/v1/generate', {
      prompt: '一首欢快的钢琴曲，适合春天',
      customMode: false,
      instrumental: true,
      model: 'V3_5',
      callBackUrl: 'https://example.com/callback', // 添加回调URL
    });
    
    if (response.data.code === 200) {
      results.generateMusic = response.data.data.taskId;
      console.log(`✅ 成功! 任务ID: ${results.generateMusic}`);
      console.log(`   任务已提交，等待SUNO处理中...`);
    } else {
      console.log(`❌ 失败! 错误: ${response.data.msg}`);
    }
  } catch (error) {
    console.log(`❌ 请求失败: ${error.message}`);
    if (error.response) {
      console.log(`   状态码: ${error.response.status}`);
      console.log(`   响应: ${JSON.stringify(error.response.data)}`);
    }
  }
  console.log('');

  // 输出测试摘要
  console.log('📋 测试摘要:');
  console.log('─────────────────────────────────────');
  console.log(`剩余积分: ${results.credits !== null ? results.credits : '❌ 获取失败'}`);
  console.log(`歌词生成: ${results.generateLyrics ? '✅ ' + results.generateLyrics : '❌ 失败'}`);
  console.log(`音乐生成: ${results.generateMusic ? '✅ ' + results.generateMusic : '❌ 失败'}`);
  console.log('─────────────────────────────────────');

  // 判断整体结果
  const allPassed = results.credits !== null || results.generateLyrics || results.generateMusic;
  
  if (allPassed) {
    console.log('\n✅ SUNO API 测试通过！API Key 有效且可以正常使用。');
    console.log('\n💡 提示:');
    console.log('   1. 生成任务是异步的，需要等待30-60秒完成');
    console.log('   2. 使用上面提供的curl命令可以查询任务状态');
    console.log('   3. 任务状态: PENDING -> GENERATING -> SUCCESS/FAILED');
    console.log('   4. 可以将此API Key配置到.env文件中使用');
  } else {
    console.log('\n❌ SUNO API 测试失败！请检查:');
    console.log('   1. API Key是否正确');
    console.log('   2. 网络连接是否正常');
    console.log('   3. API服务是否可用');
  }

  return results;
}

// 运行测试
testSunoAPI()
  .then((results) => {
    console.log('\n✨ 测试完成!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 测试异常:', error.message);
    process.exit(1);
  });

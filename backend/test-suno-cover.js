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
  console.log('========================================');
  console.log('🚀 Suno API 完整功能测试');
  console.log('========================================\n');

  try {
    // 测试1: 查询剩余积分
    console.log('📊 测试 1: 查询剩余积分');
    console.log('----------------------------------------');
    const creditsResponse = await client.get('/api/v1/generate/credit');
    console.log('✅ 请求成功!');
    console.log('响应数据:', JSON.stringify(creditsResponse.data, null, 2));
    console.log(`💰 剩余积分: ${creditsResponse.data.data || 0}\n`);

    if (!creditsResponse.data.data || creditsResponse.data.data <= 0) {
      console.log('⚠️  账户积分不足，无法进行音乐生成测试');
      return;
    }

    // 测试2: 生成简单音乐
    console.log('🎵 测试 2: 生成音乐（非自定义模式）');
    console.log('----------------------------------------');
    const generateRequest = {
      customMode: false,
      instrumental: false,
      model: 'V3_5',
      prompt: '一首轻快的钢琴曲，适合早晨听',
      callBackUrl: 'https://example.com/callback'
    };
    
    console.log('请求参数:', JSON.stringify(generateRequest, null, 2));
    const generateResponse = await client.post('/api/v1/generate', generateRequest);
    console.log('✅ 音乐生成任务创建成功!');
    console.log('响应数据:', JSON.stringify(generateResponse.data, null, 2));
    
    const musicTaskId = generateResponse.data.data.taskId;
    console.log(`🎼 音乐任务ID: ${musicTaskId}\n`);

    // 测试3: 查询音乐生成状态
    console.log('🔍 测试 3: 查询音乐生成状态');
    console.log('----------------------------------------');
    let musicStatus;
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
      attempts++;
      const statusResponse = await client.get('/api/v1/generate/record-info', {
        params: { taskId: musicTaskId }
      });
      
      musicStatus = statusResponse.data.data;
      console.log(`尝试 ${attempts}/${maxAttempts} - 状态: ${musicStatus.status}`);
      
      if (musicStatus.status === 'SUCCESS') {
        console.log('✅ 音乐生成成功!');
        console.log('音乐详情:', JSON.stringify(musicStatus.response?.data?.[0], null, 2));
        break;
      } else if (musicStatus.status === 'FAILED') {
        console.log('❌ 音乐生成失败:', musicStatus.errorMessage);
        return;
      }
      
      // 等待30秒后重试
      console.log('⏳ 等待30秒后重试...');
      await new Promise(resolve => setTimeout(resolve, 30000));
    }

    if (!musicStatus || musicStatus.status !== 'SUCCESS') {
      console.log('⚠️  音乐生成超时，跳过后续测试');
      return;
    }

    // 测试4: 生成音乐封面 (新功能!)
    console.log('\n🖼️  测试 4: 生成音乐封面 (Cover Suno - 新功能!)');
    console.log('----------------------------------------');
    const coverRequest = {
      taskId: musicTaskId,
      callBackUrl: 'https://example.com/cover-callback'
    };
    
    console.log('请求参数:', JSON.stringify(coverRequest, null, 2));
    const coverResponse = await client.post('/api/v1/suno/cover/generate', coverRequest);
    console.log('✅ 封面生成任务创建成功!');
    console.log('响应数据:', JSON.stringify(coverResponse.data, null, 2));
    
    const coverTaskId = coverResponse.data.data.taskId;
    console.log(`🎨 封面任务ID: ${coverTaskId}\n`);

    // 测试5: 查询封面生成状态
    console.log('🔍 测试 5: 查询封面生成状态');
    console.log('----------------------------------------');
    let coverStatus;
    attempts = 0;
    
    while (attempts < maxAttempts) {
      attempts++;
      const statusResponse = await client.get('/api/v1/suno/cover/record-info', {
        params: { taskId: coverTaskId }
      });
      
      coverStatus = statusResponse.data.data;
      
      if (!coverStatus) {
        console.log(`尝试 ${attempts}/${maxAttempts} - 数据为空，继续等待...`);
      } else {
        console.log(`尝试 ${attempts}/${maxAttempts} - 成功标志: ${coverStatus.successFlag}`);
        console.log('响应数据:', JSON.stringify(statusResponse.data, null, 2));
      }
      
      if (coverStatus && coverStatus.successFlag === 1) {
        console.log('✅ 封面生成成功!');
        console.log('封面图片:', coverStatus.response?.images);
        break;
      } else if (coverStatus && coverStatus.successFlag === 3) {
        console.log('❌ 封面生成失败:', coverStatus.errorMessage);
        return;
      }
      
      // 等待30秒后重试
      console.log('⏳ 等待30秒后重试...');
      await new Promise(resolve => setTimeout(resolve, 30000));
    }

    console.log('\n========================================');
    console.log('✅ 测试完成!');
    console.log('========================================');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.response) {
      console.error('错误响应:', JSON.stringify(error.response.data, null, 2));
      console.error('状态码:', error.response.status);
    }
  }
}

// 运行测试
testSunoAPI();

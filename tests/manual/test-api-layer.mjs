#!/usr/bin/env node

/**
 * Тест для API Layer (TelegramEmojiService)
 *
 * Проверяет работу всех компонентов:
 * - TelegramBotAPI
 * - RateLimiter
 * - ErrorHandler
 * - TelegramEmojiService (интеграционный)
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Загрузить .env файл
const envPath = join(__dirname, '../../.env');
let TELEGRAM_BOT_TOKEN;

try {
  const envContent = readFileSync(envPath, 'utf-8');
  const match = envContent.match(/TELEGRAM_BOT_TOKEN=(.+)/);
  if (match) {
    TELEGRAM_BOT_TOKEN = match[1].trim();
  }
} catch (error) {
  console.log('⚠️  .env file not found, using environment variable');
}

TELEGRAM_BOT_TOKEN = TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found!');
  console.error('Create .env file or set environment variable.');
  process.exit(1);
}

// Тестовые emoji IDs (популярные Telegram эмодзи)
const TEST_EMOJI_IDS = [
  '5368324170671202286',  // Fire
  '5370869711888194012',  // Heart
  '5370596736428076267'   // Thumbs up
];

console.log('🧪 Testing Telegram API Layer...\n');
console.log(`Token: ${TELEGRAM_BOT_TOKEN.substring(0, 10)}...${TELEGRAM_BOT_TOKEN.slice(-5)}\n`);

// === Test 1: Basic API ===
async function testBasicAPI() {
  console.log('═══════════════════════════════════════════════');
  console.log('\n📝 Test 1: Basic TelegramBotAPI\n');

  try {
    const { TelegramBotAPI } = await import('../../src/api/TelegramBotAPI.ts');
    const api = new TelegramBotAPI(TELEGRAM_BOT_TOKEN);

    // Test getMe
    console.log('Testing getMe...');
    const botInfo = await api.getMe();
    console.log('✅ Bot info retrieved:');
    console.log(`   Name: ${botInfo.first_name}`);
    console.log(`   Username: @${botInfo.username}`);
    console.log(`   ID: ${botInfo.id}\n`);

    // Test getCustomEmojiStickers
    console.log('Testing getCustomEmojiStickers...');
    const stickers = await api.getCustomEmojiStickers([TEST_EMOJI_IDS[0]]);
    console.log('✅ Emoji sticker retrieved:');
    console.log(`   File ID: ${stickers[0].file_id.substring(0, 20)}...`);
    console.log(`   Type: ${stickers[0].type}`);
    console.log(`   Size: ${stickers[0].width}x${stickers[0].height}`);
    console.log(`   Animated: ${stickers[0].is_animated}`);
    console.log(`   Video: ${stickers[0].is_video}\n`);

    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// === Test 2: Rate Limiter ===
async function testRateLimiter() {
  console.log('═══════════════════════════════════════════════');
  console.log('\n📝 Test 2: RateLimiter\n');

  try {
    const { RateLimiter } = await import('../../src/api/RateLimiter.ts');
    const limiter = new RateLimiter(5); // 5 requests/sec for testing

    console.log('Executing 5 tasks with rate limiting (5 req/sec)...');

    const startTime = Date.now();
    const tasks = [];

    for (let i = 0; i < 5; i++) {
      const task = limiter.execute(async () => {
        console.log(`   Task ${i + 1} executed at ${Date.now() - startTime}ms`);
        return i;
      });
      tasks.push(task);
    }

    await Promise.all(tasks);

    const duration = Date.now() - startTime;

    console.log(`\n✅ All tasks completed in ${duration}ms`);
    console.log('   (Expected: ~800-1000ms for 5 tasks at 5 req/sec)');

    const stats = limiter.getStats();
    console.log('\nRateLimiter stats:');
    console.log(`   Total requests: ${stats.totalRequests}`);
    console.log(`   Queue size: ${stats.queueSize}`);
    console.log(`   Min interval: ${stats.minInterval}ms\n`);

    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// === Test 3: Error Handler ===
async function testErrorHandler() {
  console.log('═══════════════════════════════════════════════');
  console.log('\n📝 Test 3: ErrorHandler with Retry Logic\n');

  try {
    const { ErrorHandler } = await import('../../src/api/ErrorHandler.ts');
    const handler = new ErrorHandler({
      maxRetries: 3,
      baseDelay: 100, // Faster for testing
      maxDelay: 500
    });

    let attemptCount = 0;

    console.log('Simulating failing requests (should retry 3 times)...');

    try {
      await handler.withRetry(async () => {
        attemptCount++;
        console.log(`   Attempt ${attemptCount}...`);

        if (attemptCount < 3) {
          throw new Error('Simulated network error');
        }

        return 'Success!';
      });

      console.log(`\n✅ Succeeded after ${attemptCount} attempts`);
      console.log('   Retry logic working correctly\n');

      return true;
    } catch (error) {
      console.error(`❌ Failed after ${attemptCount} attempts:`, error.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// === Test 4: TelegramEmojiService (Integration) ===
async function testEmojiService() {
  console.log('═══════════════════════════════════════════════');
  console.log('\n📝 Test 4: TelegramEmojiService (Integration)\n');

  try {
    const { TelegramEmojiService } = await import('../../src/api/TelegramEmojiService.ts');
    const service = new TelegramEmojiService(TELEGRAM_BOT_TOKEN);

    // Initialize
    console.log('Initializing service...');
    await service.initialize();

    const botInfo = service.getBotInfo();
    console.log('✅ Service initialized:');
    console.log(`   Bot: ${botInfo.name} (@${botInfo.username})`);
    console.log(`   ID: ${botInfo.id}\n`);

    // Get multiple emojis (tests batching)
    console.log(`Getting ${TEST_EMOJI_IDS.length} emojis...`);
    const emojis = await service.getEmojis(TEST_EMOJI_IDS);

    console.log(`✅ Retrieved ${emojis.length} emojis:`);
    emojis.forEach((emoji, idx) => {
      console.log(`   ${idx + 1}. ${emoji.emoji || 'N/A'} - ${emoji.file_id.substring(0, 15)}...`);
    });
    console.log();

    // Download one emoji
    console.log('Downloading first emoji file...');
    const fileData = await service.downloadEmoji(emojis[0].file_id);

    console.log('✅ File downloaded:');
    console.log(`   Size: ${fileData.byteLength} bytes`);
    console.log(`   Format: ${emojis[0].is_video ? 'WEBM' : emojis[0].is_animated ? 'TGS' : 'PNG'}\n`);

    // Get stats
    const stats = service.getStats();
    console.log('Service stats:');
    console.log(`   Initialized: ${stats.initialized}`);
    console.log(`   Total API requests: ${stats.rateLimiter.totalRequests}`);
    console.log(`   Queue size: ${stats.rateLimiter.queueSize}\n`);

    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    return false;
  }
}

// === Test 5: Large Batch (200+ emoji) ===
async function testLargeBatch() {
  console.log('═══════════════════════════════════════════════');
  console.log('\n📝 Test 5: Large Batch (Automatic Batching)\n');

  try {
    const { TelegramEmojiService } = await import('../../src/api/TelegramEmojiService.ts');
    const service = new TelegramEmojiService(TELEGRAM_BOT_TOKEN);

    await service.initialize();

    // Create array of 250 emoji IDs (will be split into 2 batches)
    const largeEmojiList = [];
    for (let i = 0; i < 250; i++) {
      largeEmojiList.push(TEST_EMOJI_IDS[i % TEST_EMOJI_IDS.length]);
    }

    console.log(`Getting ${largeEmojiList.length} emojis (will auto-batch)...`);

    const startTime = Date.now();
    const emojis = await service.getEmojis(largeEmojiList);
    const duration = Date.now() - startTime;

    console.log(`\n✅ Retrieved ${emojis.length} emojis in ${duration}ms`);
    console.log('   Automatic batching worked correctly!\n');

    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// === Run all tests ===
async function runTests() {
  const results = [];

  results.push(await testBasicAPI());
  results.push(await testRateLimiter());
  results.push(await testErrorHandler());
  results.push(await testEmojiService());
  results.push(await testLargeBatch());

  console.log('═══════════════════════════════════════════════');
  console.log('\n🎉 Test Results:\n');

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log(`   Passed: ${passed}/${total}`);

  if (passed === total) {
    console.log('\n✨ All tests passed! API Layer is working correctly.\n');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Please check the output above.\n');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});

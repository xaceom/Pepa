/**
 * Ручной тест Telegram Bot API
 *
 * Запуск: node tests/manual/test-api.mjs
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загрузить .env файл
function loadEnv() {
  const envPath = join(__dirname, '../../.env');
  try {
    const envContent = readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      process.env[key.trim()] = value.trim();
    }
  } catch (error) {
    console.error('Failed to load .env file:', error.message);
  }
}

loadEnv();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = 'https://api.telegram.org';

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in .env file');
  process.exit(1);
}

console.log('🤖 Testing Telegram Bot API...\n');
console.log(`Token: ${BOT_TOKEN.substring(0, 10)}...${BOT_TOKEN.substring(BOT_TOKEN.length - 5)}\n`);

/**
 * Тест 1: getMe - проверка валидности токена
 */
async function testGetMe() {
  console.log('📝 Test 1: getMe (checking token validity)');

  try {
    const response = await fetch(`${API_URL}/bot${BOT_TOKEN}/getMe`);
    const data = await response.json();

    if (data.ok) {
      console.log('✅ Token is valid!');
      console.log(`   Bot name: ${data.result.first_name}`);
      console.log(`   Username: @${data.result.username}`);
      console.log(`   Bot ID: ${data.result.id}\n`);
      return true;
    } else {
      console.log('❌ Token is invalid:', data.description);
      return false;
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
    return false;
  }
}

/**
 * Тест 2: getCustomEmojiStickers - получение информации об эмодзи
 */
async function testGetCustomEmojiStickers() {
  console.log('📝 Test 2: getCustomEmojiStickers');

  // Тестовый emoji ID (популярный emoji из Telegram)
  const testEmojiId = '5368324170671202286';

  try {
    const response = await fetch(
      `${API_URL}/bot${BOT_TOKEN}/getCustomEmojiStickers`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_emoji_ids: [testEmojiId] })
      }
    );

    const data = await response.json();

    if (data.ok && data.result.length > 0) {
      console.log('✅ Successfully fetched emoji info!');
      const emoji = data.result[0];
      console.log(`   File ID: ${emoji.file_id}`);
      console.log(`   Type: ${emoji.type}`);
      console.log(`   Size: ${emoji.width}x${emoji.height}`);
      console.log(`   Animated: ${emoji.is_animated}`);
      console.log(`   Video: ${emoji.is_video}`);
      console.log(`   File size: ${emoji.file_size || 'unknown'} bytes\n`);
      return emoji;
    } else {
      console.log('❌ Failed to fetch emoji:', data.description || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
    return null;
  }
}

/**
 * Тест 3: getFile - получение пути к файлу
 */
async function testGetFile(fileId) {
  console.log('📝 Test 3: getFile');

  try {
    const response = await fetch(
      `${API_URL}/bot${BOT_TOKEN}/getFile?file_id=${fileId}`
    );

    const data = await response.json();

    if (data.ok) {
      console.log('✅ Successfully got file info!');
      console.log(`   File path: ${data.result.file_path}`);
      console.log(`   File size: ${data.result.file_size || 'unknown'} bytes`);

      const downloadUrl = `${API_URL}/file/bot${BOT_TOKEN}/${data.result.file_path}`;
      console.log(`   Download URL: ${downloadUrl.substring(0, 50)}...\n`);

      return data.result;
    } else {
      console.log('❌ Failed to get file:', data.description);
      return null;
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
    return null;
  }
}

/**
 * Тест 4: Скачать файл эмодзи
 */
async function testDownloadFile(filePath) {
  console.log('📝 Test 4: Download emoji file');

  try {
    const downloadUrl = `${API_URL}/file/bot${BOT_TOKEN}/${filePath}`;
    const response = await fetch(downloadUrl);

    if (response.ok) {
      const buffer = await response.arrayBuffer();
      console.log('✅ Successfully downloaded emoji file!');
      console.log(`   Downloaded ${buffer.byteLength} bytes`);
      console.log(`   Format: ${filePath.endsWith('.tgs') ? 'TGS (Lottie)' : filePath.endsWith('.webm') ? 'WEBM (Video)' : 'Unknown'}\n`);
      return buffer;
    } else {
      console.log('❌ Failed to download file:', response.statusText);
      return null;
    }
  } catch (error) {
    console.log('❌ Download failed:', error.message);
    return null;
  }
}

/**
 * Запустить все тесты
 */
async function runAllTests() {
  console.log('═══════════════════════════════════════════════\n');

  // Тест 1: Проверка токена
  const tokenValid = await testGetMe();
  if (!tokenValid) {
    console.log('\n❌ Token validation failed. Aborting tests.\n');
    process.exit(1);
  }

  // Тест 2: Получение информации об эмодзи
  const emoji = await testGetCustomEmojiStickers();
  if (!emoji) {
    console.log('\n⚠️  Failed to get emoji info. Skipping remaining tests.\n');
    return;
  }

  // Тест 3: Получение пути к файлу
  const fileInfo = await testGetFile(emoji.file_id);
  if (!fileInfo) {
    console.log('\n⚠️  Failed to get file info. Skipping download test.\n');
    return;
  }

  // Тест 4: Скачивание файла
  const fileData = await testDownloadFile(fileInfo.file_path);

  console.log('═══════════════════════════════════════════════\n');

  if (fileData) {
    console.log('🎉 All tests passed successfully!\n');
    console.log('✨ Your Telegram Bot API is working correctly.');
    console.log('✨ You can now proceed with plugin development.\n');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.\n');
  }
}

// Запустить тесты
runAllTests().catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});

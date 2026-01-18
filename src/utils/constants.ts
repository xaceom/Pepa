/**
 * Константы для работы с Telegram Bot API
 */

// Telegram Bot API
export const TELEGRAM_BOT_API_URL = 'https://api.telegram.org';

// Лимиты API
export const MAX_EMOJI_PER_REQUEST = 200;
export const RATE_LIMIT_REQUESTS_PER_SECOND = 2;

// Кеш
export const DEFAULT_CACHE_SIZE_MB = 100;
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 часа
export const MEMORY_CACHE_MAX_ITEMS = 1000;

// Retry логика
export const MAX_RETRIES = 4;
export const RETRY_BASE_DELAY_MS = 2000; // 2 секунды
export const RETRY_MAX_DELAY_MS = 16000; // 16 секунд

// Performance таргеты
export const TARGET_TGS_RENDER_MS = 50;
export const TARGET_WEBM_RENDER_MS = 100;
export const TARGET_MEMORY_CACHE_HIT_MS = 10;

// Форматы эмодзи
export enum EmojiFormat {
  TGS = 'tgs',   // Telegram Animated Sticker (Lottie JSON)
  WEBM = 'webm', // Video format
  PNG = 'png'    // Static image fallback
}

// Типы стикеров Telegram
export enum StickerType {
  REGULAR = 'regular',
  MASK = 'mask',
  CUSTOM_EMOJI = 'custom_emoji'
}

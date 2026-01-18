/**
 * API Layer - Telegram Bot API Integration
 *
 * Этот модуль предоставляет полный набор инструментов для работы с Telegram Bot API:
 * - TelegramBotAPI: низкоуровневый API клиент
 * - RateLimiter: контроль частоты запросов
 * - ErrorHandler: retry logic с exponential backoff
 * - TelegramEmojiService: высокоуровневый интеграционный сервис (рекомендуется)
 *
 * @example
 * ```typescript
 * import { TelegramEmojiService } from './api';
 *
 * const service = new TelegramEmojiService(process.env.TELEGRAM_BOT_TOKEN);
 * await service.initialize();
 *
 * const emojis = await service.getEmojis(['emoji_id_1', 'emoji_id_2']);
 * const fileData = await service.downloadEmoji(emojis[0].file_id);
 * ```
 */

export { TelegramBotAPI } from './TelegramBotAPI';
export { RateLimiter } from './RateLimiter';
export { ErrorHandler, defaultErrorHandler } from './ErrorHandler';
export { TelegramEmojiService } from './TelegramEmojiService';

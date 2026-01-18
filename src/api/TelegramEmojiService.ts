import { TelegramBotAPI } from './TelegramBotAPI';
import { RateLimiter } from './RateLimiter';
import { ErrorHandler } from './ErrorHandler';
import { TelegramSticker } from '../types';
import { logger } from '../utils/logger';
import { MAX_EMOJI_PER_REQUEST } from '../utils/constants';

/**
 * Интеграционный сервис для работы с Telegram Emoji
 *
 * Объединяет TelegramBotAPI, RateLimiter и ErrorHandler
 * для удобного и надёжного доступа к Telegram custom emoji.
 *
 * Features:
 * - Автоматический rate limiting (2 req/sec)
 * - Автоматический retry с exponential backoff
 * - Автоматический batching для больших списков emoji
 * - Валидация Bot Token
 * - Подробное логирование
 *
 * @example
 * ```typescript
 * const service = new TelegramEmojiService(botToken);
 *
 * // Инициализация и проверка токена
 * await service.initialize();
 *
 * // Получить эмодзи (с автоматическим rate limiting и retry)
 * const stickers = await service.getEmojis(['id1', 'id2', 'id3']);
 *
 * // Скачать эмодзи файл
 * const fileData = await service.downloadEmoji(stickers[0].file_id);
 * ```
 */
export class TelegramEmojiService {
  private api: TelegramBotAPI;
  private rateLimiter: RateLimiter;
  private errorHandler: ErrorHandler;
  private initialized = false;
  private botInfo?: {
    id: number;
    username: string;
    name: string;
  };

  /**
   * Создать новый TelegramEmojiService
   *
   * @param botToken - Bot token от @BotFather
   */
  constructor(botToken: string) {
    this.api = new TelegramBotAPI(botToken);
    this.rateLimiter = new RateLimiter();
    this.errorHandler = new ErrorHandler();

    logger.info('TelegramEmojiService created', {
      token: this.api.getMaskedToken()
    });
  }

  /**
   * Инициализировать сервис и проверить Bot Token
   *
   * @throws Error если токен невалидный
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.debug('Service already initialized');
      return;
    }

    logger.info('Initializing TelegramEmojiService...');

    try {
      // Валидировать токен через getMe с retry
      const botInfo = await this.errorHandler.withRetry(() =>
        this.rateLimiter.execute(() => this.api.getMe())
      );

      this.botInfo = {
        id: botInfo.id,
        username: botInfo.username,
        name: botInfo.first_name
      };

      this.initialized = true;

      logger.info('TelegramEmojiService initialized successfully', {
        botName: this.botInfo.name,
        botUsername: this.botInfo.username,
        botId: this.botInfo.id
      });

    } catch (error) {
      logger.error('Failed to initialize TelegramEmojiService', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw new Error(
        `Failed to initialize: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Получить информацию о custom emoji по их ID
   *
   * Автоматически разбивает большие списки на батчи (по 200 ID)
   * и применяет rate limiting + retry logic.
   *
   * @param emojiIds - Массив ID эмодзи
   * @returns Массив объектов TelegramSticker
   * @throws Error если сервис не инициализирован или запрос failed
   */
  async getEmojis(emojiIds: string[]): Promise<TelegramSticker[]> {
    this.ensureInitialized();

    if (emojiIds.length === 0) {
      logger.warn('getEmojis called with empty array');
      return [];
    }

    logger.info('Getting emojis', { count: emojiIds.length });

    // Разбить на батчи если больше MAX_EMOJI_PER_REQUEST
    const batches = this.createBatches(emojiIds, MAX_EMOJI_PER_REQUEST);

    logger.debug('Split into batches', {
      totalEmojis: emojiIds.length,
      batchCount: batches.length,
      batchSize: MAX_EMOJI_PER_REQUEST
    });

    // Выполнить все батчи последовательно
    const results: TelegramSticker[] = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      logger.debug('Processing batch', {
        batch: i + 1,
        total: batches.length,
        size: batch.length
      });

      try {
        // Выполнить запрос с rate limiting и retry
        const stickers = await this.errorHandler.withRetry(() =>
          this.rateLimiter.execute(() =>
            this.api.getCustomEmojiStickers(batch)
          )
        );

        results.push(...stickers);

      } catch (error) {
        logger.error('Failed to get emoji batch', {
          batch: i + 1,
          total: batches.length,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        throw error;
      }
    }

    logger.info('Successfully retrieved emojis', {
      requested: emojiIds.length,
      received: results.length
    });

    return results;
  }

  /**
   * Скачать файл эмодзи по file_id
   *
   * Применяет rate limiting и retry logic.
   *
   * @param fileId - File ID из TelegramSticker объекта
   * @returns ArrayBuffer с данными файла (TGS/WEBM/PNG)
   * @throws Error если сервис не инициализирован или загрузка failed
   */
  async downloadEmoji(fileId: string): Promise<ArrayBuffer> {
    this.ensureInitialized();

    logger.debug('Downloading emoji', { fileId });

    try {
      // Выполнить загрузку с rate limiting и retry
      const fileData = await this.errorHandler.withRetry(() =>
        this.rateLimiter.execute(() => this.api.downloadFile(fileId))
      );

      logger.info('Emoji downloaded successfully', {
        fileId,
        size: fileData.byteLength
      });

      return fileData;

    } catch (error) {
      logger.error('Failed to download emoji', {
        fileId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  /**
   * Получить URL для скачивания файла эмодзи
   *
   * @param fileId - File ID из TelegramSticker объекта
   * @returns URL для загрузки файла
   * @throws Error если сервис не инициализирован
   */
  async getEmojiUrl(fileId: string): Promise<string> {
    this.ensureInitialized();

    logger.debug('Getting emoji URL', { fileId });

    try {
      const url = await this.errorHandler.withRetry(() =>
        this.rateLimiter.execute(() => this.api.getFileUrl(fileId))
      );

      logger.debug('Emoji URL retrieved', { fileId, url });

      return url;

    } catch (error) {
      logger.error('Failed to get emoji URL', {
        fileId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  /**
   * Получить информацию о боте
   *
   * @returns Информация о боте или undefined если не инициализирован
   */
  getBotInfo(): { id: number; username: string; name: string } | undefined {
    return this.botInfo;
  }

  /**
   * Проверить, инициализирован ли сервис
   *
   * @returns true если инициализирован, false иначе
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Получить статистику сервиса
   *
   * @returns Объект со статистикой
   */
  getStats(): {
    initialized: boolean;
    botInfo?: { id: number; username: string; name: string };
    rateLimiter: ReturnType<RateLimiter['getStats']>;
  } {
    return {
      initialized: this.initialized,
      botInfo: this.botInfo,
      rateLimiter: this.rateLimiter.getStats()
    };
  }

  /**
   * Обеспечить что сервис инициализирован
   *
   * @throws Error если сервис не инициализирован
   * @private
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        'TelegramEmojiService not initialized. Call initialize() first.'
      );
    }
  }

  /**
   * Разбить массив на батчи заданного размера
   *
   * @param array - Исходный массив
   * @param batchSize - Размер батча
   * @returns Массив батчей
   * @private
   */
  private createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];

    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }

    return batches;
  }

  /**
   * Очистить очередь запросов и сбросить статистику
   */
  reset(): void {
    this.rateLimiter.clear();
    this.rateLimiter.resetStats();

    logger.info('TelegramEmojiService reset');
  }

  /**
   * Обновить настройки rate limit
   *
   * @param requestsPerSecond - Новый лимит запросов в секунду
   */
  setRateLimit(requestsPerSecond: number): void {
    this.rateLimiter.setRateLimit(requestsPerSecond);

    logger.info('Rate limit updated', { requestsPerSecond });
  }
}

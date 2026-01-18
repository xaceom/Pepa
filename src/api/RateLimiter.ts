import { QueueItem } from '../types';
import { logger } from '../utils/logger';
import { RATE_LIMIT_REQUESTS_PER_SECOND } from '../utils/constants';

/**
 * Rate Limiter для контроля частоты запросов к Telegram Bot API
 *
 * Реализует очередь запросов с ограничением скорости,
 * чтобы не превысить лимиты Telegram API (обычно 30 req/sec, но мы используем 2 req/sec для безопасности)
 *
 * @example
 * ```typescript
 * const limiter = new RateLimiter(2); // 2 запроса в секунду
 *
 * const result = await limiter.execute(async () => {
 *   return await api.getCustomEmojiStickers(['id1', 'id2']);
 * });
 * ```
 */
export class RateLimiter {
  private queue: QueueItem<any>[] = [];
  private processing = false;
  private lastRequestTime = 0;
  private readonly minInterval: number; // Минимальный интервал между запросами (мс)
  private requestCount = 0; // Счётчик выполненных запросов

  /**
   * Создать новый RateLimiter
   *
   * @param requestsPerSecond - Максимальное количество запросов в секунду (по умолчанию из констант)
   */
  constructor(requestsPerSecond: number = RATE_LIMIT_REQUESTS_PER_SECOND) {
    if (requestsPerSecond <= 0) {
      throw new Error('requestsPerSecond must be positive');
    }

    this.minInterval = 1000 / requestsPerSecond;

    logger.debug('RateLimiter initialized', {
      requestsPerSecond,
      minInterval: this.minInterval
    });
  }

  /**
   * Выполнить задачу с учётом rate limiting
   *
   * @param task - Асинхронная функция для выполнения
   * @param priority - Приоритет задачи (больше = выше приоритет)
   * @returns Promise с результатом задачи
   */
  async execute<T>(task: () => Promise<T>, priority: number = 0): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // Добавить задачу в очередь
      this.queue.push({
        task,
        resolve,
        reject,
        priority
      });

      logger.debug('Task added to queue', {
        queueLength: this.queue.length,
        priority
      });

      // Запустить обработку очереди
      this.processQueue();
    });
  }

  /**
   * Обработать очередь запросов
   *
   * @private
   */
  private async processQueue(): Promise<void> {
    // Если уже обрабатываем или очередь пуста - выходим
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      // Сортировать очередь по приоритету (если есть)
      if (this.queue.some(item => item.priority !== undefined && item.priority > 0)) {
        this.queue.sort((a, b) => {
          const priorityA = a.priority ?? 0;
          const priorityB = b.priority ?? 0;
          return priorityB - priorityA; // Высший приоритет первым
        });
      }

      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;

      // Если прошло недостаточно времени - ждём
      if (timeSinceLastRequest < this.minInterval) {
        const waitTime = this.minInterval - timeSinceLastRequest;

        logger.debug('Rate limit: waiting', {
          waitTime,
          queueLength: this.queue.length
        });

        await this.sleep(waitTime);
      }

      // Взять первую задачу из очереди
      const item = this.queue.shift();
      if (!item) {
        break;
      }

      this.lastRequestTime = Date.now();
      this.requestCount++;

      logger.debug('Executing task from queue', {
        queueLength: this.queue.length,
        totalRequests: this.requestCount,
        priority: item.priority
      });

      try {
        const result = await item.task();
        item.resolve(result);

        logger.debug('Task completed successfully', {
          queueLength: this.queue.length
        });
      } catch (error) {
        logger.error('Task failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          queueLength: this.queue.length
        });

        item.reject(error as Error);
      }
    }

    this.processing = false;
  }

  /**
   * Приостановить выполнение на указанное время
   *
   * @param ms - Время в миллисекундах
   * @private
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Получить размер очереди
   *
   * @returns Количество задач в очереди
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Получить статистику RateLimiter
   *
   * @returns Объект со статистикой
   */
  getStats(): {
    queueSize: number;
    totalRequests: number;
    isProcessing: boolean;
    minInterval: number;
  } {
    return {
      queueSize: this.queue.length,
      totalRequests: this.requestCount,
      isProcessing: this.processing,
      minInterval: this.minInterval
    };
  }

  /**
   * Очистить очередь (отменить все ожидающие задачи)
   */
  clear(): void {
    const cancelledCount = this.queue.length;

    // Отклонить все задачи в очереди
    this.queue.forEach(item => {
      item.reject(new Error('Queue cleared'));
    });

    this.queue = [];

    logger.info('Queue cleared', { cancelledCount });
  }

  /**
   * Сбросить счётчик запросов
   */
  resetStats(): void {
    this.requestCount = 0;
    logger.debug('Stats reset');
  }

  /**
   * Установить новый лимит запросов в секунду
   *
   * @param requestsPerSecond - Новый лимит
   */
  setRateLimit(requestsPerSecond: number): void {
    if (requestsPerSecond <= 0) {
      throw new Error('requestsPerSecond must be positive');
    }

    this.minInterval = 1000 / requestsPerSecond;

    logger.info('Rate limit updated', {
      requestsPerSecond,
      minInterval: this.minInterval
    });
  }

  /**
   * Проверить, обрабатывается ли очередь в данный момент
   *
   * @returns true если обрабатывается, false иначе
   */
  isProcessing(): boolean {
    return this.processing;
  }

  /**
   * Дождаться завершения всех задач в очереди
   *
   * @param timeout - Максимальное время ожидания в мс (по умолчанию 30 секунд)
   * @returns Promise, который resolve когда очередь пуста
   */
  async waitUntilEmpty(timeout: number = 30000): Promise<void> {
    const startTime = Date.now();

    while (this.queue.length > 0 || this.processing) {
      if (Date.now() - startTime > timeout) {
        throw new Error(`Timeout waiting for queue to empty (${timeout}ms)`);
      }

      await this.sleep(100); // Проверять каждые 100мс
    }

    logger.debug('Queue is empty');
  }
}

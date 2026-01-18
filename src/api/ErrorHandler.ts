import { RetryOptions } from '../types';
import { logger } from '../utils/logger';
import {
  MAX_RETRIES,
  RETRY_BASE_DELAY_MS,
  RETRY_MAX_DELAY_MS
} from '../utils/constants';

/**
 * Error Handler с retry logic и exponential backoff
 *
 * Автоматически повторяет неудачные запросы с увеличивающейся задержкой.
 * Использует exponential backoff: 2s, 4s, 8s, 16s
 *
 * @example
 * ```typescript
 * const handler = new ErrorHandler();
 *
 * const result = await handler.withRetry(async () => {
 *   return await api.getCustomEmojiStickers(['id1']);
 * });
 * ```
 */
export class ErrorHandler {
  private readonly defaultOptions: RetryOptions;

  /**
   * Создать новый ErrorHandler
   *
   * @param options - Опции retry по умолчанию (необязательно)
   */
  constructor(options?: Partial<RetryOptions>) {
    this.defaultOptions = {
      maxRetries: options?.maxRetries ?? MAX_RETRIES,
      baseDelay: options?.baseDelay ?? RETRY_BASE_DELAY_MS,
      maxDelay: options?.maxDelay ?? RETRY_MAX_DELAY_MS
    };

    logger.debug('ErrorHandler initialized', this.defaultOptions);
  }

  /**
   * Выполнить функцию с retry logic
   *
   * @param fn - Асинхронная функция для выполнения
   * @param options - Опции retry (опционально, переопределяют дефолтные)
   * @returns Promise с результатом функции
   * @throws Последнюю ошибку, если все попытки неудачны
   */
  async withRetry<T>(
    fn: () => Promise<T>,
    options?: Partial<RetryOptions>
  ): Promise<T> {
    const opts: RetryOptions = {
      ...this.defaultOptions,
      ...options
    };

    let lastError: Error | undefined;
    let attempt = 0;

    while (attempt <= opts.maxRetries) {
      try {
        logger.debug('Executing attempt', {
          attempt: attempt + 1,
          maxRetries: opts.maxRetries + 1
        });

        const result = await fn();

        if (attempt > 0) {
          logger.info('Retry succeeded', {
            attempt: attempt + 1,
            totalAttempts: opts.maxRetries + 1
          });
        }

        return result;

      } catch (error) {
        lastError = error as Error;

        // Проверить, можно ли повторить запрос
        if (!this.isRetryable(error)) {
          logger.warn('Error is not retryable', {
            error: lastError.message,
            attempt: attempt + 1
          });
          throw lastError;
        }

        // Если это последняя попытка - бросить ошибку
        if (attempt >= opts.maxRetries) {
          logger.error('All retry attempts failed', {
            totalAttempts: attempt + 1,
            error: lastError.message
          });
          throw lastError;
        }

        // Вычислить задержку с exponential backoff
        const delay = this.calculateDelay(attempt, opts);

        logger.warn('Attempt failed, retrying', {
          attempt: attempt + 1,
          totalAttempts: opts.maxRetries + 1,
          delay,
          error: lastError.message
        });

        // Подождать перед следующей попыткой
        await this.sleep(delay);

        attempt++;
      }
    }

    // Это не должно произойти, но на всякий случай
    throw lastError || new Error('Unknown error during retry');
  }

  /**
   * Проверить, можно ли повторить запрос после данной ошибки
   *
   * @param error - Ошибка для проверки
   * @returns true если можно повторить, false иначе
   * @private
   */
  private isRetryable(error: any): boolean {
    // Сетевые ошибки - всегда retryable
    if (
      error.message?.includes('fetch failed') ||
      error.message?.includes('Network error') ||
      error.message?.includes('ECONNREFUSED') ||
      error.message?.includes('ETIMEDOUT') ||
      error.message?.includes('ENOTFOUND')
    ) {
      return true;
    }

    // Telegram API ошибки
    if (error.message?.includes('Telegram API error')) {
      // Извлечь код ошибки
      const match = error.message.match(/\[(\d+)\]/);
      if (match) {
        const errorCode = parseInt(match[1], 10);

        // 429 - Too Many Requests - retryable
        if (errorCode === 429) {
          return true;
        }

        // 5xx - Server errors - retryable
        if (errorCode >= 500 && errorCode < 600) {
          return true;
        }

        // 4xx (кроме 429) - Client errors - НЕ retryable
        // (неправильный токен, несуществующий файл и т.д.)
        if (errorCode >= 400 && errorCode < 500) {
          return false;
        }
      }
    }

    // По умолчанию - retryable (для неизвестных ошибок)
    return true;
  }

  /**
   * Вычислить задержку для следующей попытки (exponential backoff)
   *
   * Формула: min(baseDelay * 2^attempt, maxDelay)
   *
   * @param attempt - Номер попытки (0-based)
   * @param options - Опции retry
   * @returns Задержка в миллисекундах
   * @private
   */
  private calculateDelay(attempt: number, options: RetryOptions): number {
    // Exponential backoff: baseDelay * 2^attempt
    const exponentialDelay = options.baseDelay * Math.pow(2, attempt);

    // Ограничить максимальной задержкой
    const delay = Math.min(exponentialDelay, options.maxDelay);

    // Добавить небольшой jitter (±10%) чтобы избежать thundering herd
    const jitter = delay * 0.1 * (Math.random() * 2 - 1);

    return Math.round(delay + jitter);
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
   * Обернуть функцию для автоматического retry при ошибках
   *
   * @param fn - Функция для оборачивания
   * @param options - Опции retry
   * @returns Обёрнутая функция с retry logic
   *
   * @example
   * ```typescript
   * const handler = new ErrorHandler();
   * const getEmoji = handler.wrap(
   *   (ids) => api.getCustomEmojiStickers(ids),
   *   { maxRetries: 3 }
   * );
   *
   * const result = await getEmoji(['id1', 'id2']);
   * ```
   */
  wrap<TArgs extends any[], TResult>(
    fn: (...args: TArgs) => Promise<TResult>,
    options?: Partial<RetryOptions>
  ): (...args: TArgs) => Promise<TResult> {
    return async (...args: TArgs): Promise<TResult> => {
      return this.withRetry(() => fn(...args), options);
    };
  }

  /**
   * Получить текущие настройки retry
   *
   * @returns Объект с настройками
   */
  getOptions(): RetryOptions {
    return { ...this.defaultOptions };
  }

  /**
   * Обновить настройки retry по умолчанию
   *
   * @param options - Новые настройки (частичные)
   */
  updateOptions(options: Partial<RetryOptions>): void {
    Object.assign(this.defaultOptions, options);

    logger.info('ErrorHandler options updated', this.defaultOptions);
  }
}

/**
 * Глобальный экземпляр ErrorHandler с дефолтными настройками
 */
export const defaultErrorHandler = new ErrorHandler();

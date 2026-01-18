/**
 * TypeScript типы для плагина
 */

import { EmojiFormat, StickerType } from '../utils/constants';

/**
 * Telegram Sticker объект из Bot API
 * https://core.telegram.org/bots/api#sticker
 */
export interface TelegramSticker {
  file_id: string;
  file_unique_id: string;
  type: StickerType;
  width: number;
  height: number;
  is_animated: boolean;
  is_video: boolean;
  thumbnail?: {
    file_id: string;
    file_unique_id: string;
    width: number;
    height: number;
    file_size: number;
  };
  emoji?: string;
  set_name?: string;
  premium_animation?: any;
  mask_position?: any;
  custom_emoji_id?: string;
  needs_repainting?: boolean;
  file_size?: number;
}

/**
 * Telegram File объект из Bot API
 */
export interface TelegramFile {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  file_path?: string;
}

/**
 * Запись в кеше эмодзи
 */
export interface EmojiCacheEntry {
  id: string;
  data: ArrayBuffer;
  format: EmojiFormat;
  timestamp: number;
  metadata?: {
    width?: number;
    height?: number;
    emoji?: string;
    set_name?: string;
  };
}

/**
 * Элемент в очереди запросов
 */
export interface QueueItem<T> {
  task: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  priority?: number;
}

/**
 * Опции для retry логики
 */
export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

/**
 * Статистика кеша
 */
export interface CacheStats {
  memoryHits: number;
  memoryMisses: number;
  diskHits: number;
  diskMisses: number;
  totalSize: number;
  itemCount: number;
}

/**
 * Опции рендеринга эмодзи
 */
export interface RenderOptions {
  width?: number;
  height?: number;
  autoplay?: boolean;
  loop?: boolean;
  className?: string;
}

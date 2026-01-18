import { TELEGRAM_BOT_API_URL, MAX_EMOJI_PER_REQUEST } from '../utils/constants';
import { TelegramSticker, TelegramFile } from '../types';
import { logger } from '../utils/logger';

/**
 * Response from Telegram Bot API
 */
interface TelegramResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
}

/**
 * Bot information from getMe
 */
interface BotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  can_join_groups: boolean;
  can_read_all_group_messages: boolean;
  supports_inline_queries: boolean;
}

/**
 * Telegram Bot API Client
 *
 * Provides methods to interact with Telegram Bot API for fetching custom emoji.
 * Uses official Bot API (https://core.telegram.org/bots/api)
 *
 * @example
 * ```typescript
 * const api = new TelegramBotAPI(botToken);
 * const stickers = await api.getCustomEmojiStickers(['emoji_id_1', 'emoji_id_2']);
 * const fileData = await api.downloadFile(stickers[0].file_id);
 * ```
 */
export class TelegramBotAPI {
  private readonly baseUrl: string;
  private readonly botToken: string;

  /**
   * Create a new TelegramBotAPI instance
   * @param botToken - Bot token from @BotFather
   */
  constructor(botToken: string) {
    if (!botToken || botToken.trim() === '') {
      throw new Error('Bot token is required');
    }

    this.botToken = botToken.trim();
    this.baseUrl = `${TELEGRAM_BOT_API_URL}/bot${this.botToken}`;

    logger.debug('TelegramBotAPI initialized', { baseUrl: TELEGRAM_BOT_API_URL });
  }

  /**
   * Get bot information (useful for validating token)
   *
   * @returns Bot information
   * @throws Error if request fails or token is invalid
   *
   * @see https://core.telegram.org/bots/api#getme
   */
  async getMe(): Promise<BotInfo> {
    logger.debug('Getting bot info (getMe)');

    const response = await this.makeRequest<BotInfo>('getMe');

    logger.info('Bot info retrieved', {
      username: response.username,
      id: response.id
    });

    return response;
  }

  /**
   * Get information about custom emoji stickers by their IDs
   *
   * @param emojiIds - Array of custom emoji IDs (max 200)
   * @returns Array of sticker information
   * @throws Error if emojiIds array is too large or request fails
   *
   * @see https://core.telegram.org/bots/api#getcustomemojistickers
   */
  async getCustomEmojiStickers(emojiIds: string[]): Promise<TelegramSticker[]> {
    if (emojiIds.length === 0) {
      logger.warn('getCustomEmojiStickers called with empty array');
      return [];
    }

    if (emojiIds.length > MAX_EMOJI_PER_REQUEST) {
      throw new Error(
        `Maximum ${MAX_EMOJI_PER_REQUEST} emoji IDs per request (got ${emojiIds.length})`
      );
    }

    logger.debug('Getting custom emoji stickers', {
      count: emojiIds.length,
      ids: emojiIds.slice(0, 3) // Log first 3 IDs
    });

    const response = await this.makeRequest<TelegramSticker[]>('getCustomEmojiStickers', {
      custom_emoji_ids: emojiIds
    });

    logger.info('Custom emoji stickers retrieved', {
      requested: emojiIds.length,
      received: response.length
    });

    return response;
  }

  /**
   * Get file information by file ID
   *
   * @param fileId - File ID from sticker object
   * @returns File information including download path
   * @throws Error if request fails
   *
   * @see https://core.telegram.org/bots/api#getfile
   */
  async getFile(fileId: string): Promise<TelegramFile> {
    logger.debug('Getting file info', { fileId });

    const response = await this.makeRequest<TelegramFile>('getFile', {
      file_id: fileId
    });

    logger.debug('File info retrieved', {
      fileId,
      filePath: response.file_path,
      fileSize: response.file_size
    });

    return response;
  }

  /**
   * Download file by file ID
   *
   * @param fileId - File ID from sticker object
   * @returns File data as ArrayBuffer
   * @throws Error if request fails
   *
   * @example
   * ```typescript
   * const fileData = await api.downloadFile('ABC123...');
   * // fileData is ArrayBuffer with emoji data (TGS/WEBM/PNG)
   * ```
   */
  async downloadFile(fileId: string): Promise<ArrayBuffer> {
    logger.debug('Downloading file', { fileId });

    // 1. Get file path
    const fileInfo = await this.getFile(fileId);

    if (!fileInfo.file_path) {
      throw new Error(`No file_path for file_id: ${fileId}`);
    }

    // 2. Construct download URL
    const downloadUrl = `${TELEGRAM_BOT_API_URL}/file/bot${this.botToken}/${fileInfo.file_path}`;

    logger.debug('Downloading from URL', { url: downloadUrl });

    // 3. Download file
    const response = await fetch(downloadUrl);

    if (!response.ok) {
      throw new Error(
        `Download failed: ${response.status} ${response.statusText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();

    logger.info('File downloaded', {
      fileId,
      size: arrayBuffer.byteLength,
      path: fileInfo.file_path
    });

    return arrayBuffer;
  }

  /**
   * Get download URL for a file (without actually downloading)
   *
   * @param fileId - File ID from sticker object
   * @returns Download URL
   * @throws Error if request fails
   */
  async getFileUrl(fileId: string): Promise<string> {
    const fileInfo = await this.getFile(fileId);

    if (!fileInfo.file_path) {
      throw new Error(`No file_path for file_id: ${fileId}`);
    }

    return `${TELEGRAM_BOT_API_URL}/file/bot${this.botToken}/${fileInfo.file_path}`;
  }

  /**
   * Make a request to Telegram Bot API
   *
   * @param method - API method name
   * @param params - Request parameters (optional)
   * @returns API response data
   * @throws Error if request fails or response is not ok
   *
   * @private
   */
  private async makeRequest<T>(
    method: string,
    params?: Record<string, any>
  ): Promise<T> {
    const url = `${this.baseUrl}/${method}`;

    logger.debug('Making API request', { method, params });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: params ? JSON.stringify(params) : undefined
      });

      // Parse response
      const data: TelegramResponse<T> = await response.json();

      // Check if response is ok
      if (!data.ok) {
        const errorMsg = data.description || 'Unknown error';
        const errorCode = data.error_code || response.status;

        logger.error('API request failed', {
          method,
          errorCode,
          errorMsg
        });

        throw new Error(`Telegram API error [${errorCode}]: ${errorMsg}`);
      }

      if (data.result === undefined) {
        throw new Error('API response missing result field');
      }

      return data.result;

    } catch (error) {
      // Network error or JSON parse error
      if (error instanceof Error && error.message.startsWith('Telegram API error')) {
        throw error;
      }

      logger.error('Network or parse error', {
        method,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw new Error(
        `Network error while calling ${method}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Validate bot token by calling getMe
   *
   * @returns true if token is valid, false otherwise
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.getMe();
      return true;
    } catch (error) {
      logger.error('Token validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Get the bot token (masked for security)
   *
   * @returns Masked bot token (e.g., "123456789:AAF...2NIeo")
   */
  getMaskedToken(): string {
    if (this.botToken.length < 20) {
      return '***';
    }

    const parts = this.botToken.split(':');
    if (parts.length !== 2) {
      return '***';
    }

    const [id, token] = parts;
    const maskedToken = token.substring(0, 3) + '...' + token.substring(token.length - 5);

    return `${id}:${maskedToken}`;
  }
}

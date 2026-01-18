# 📋 План Разработки: Telegram Emoji Plugin для Obsidian

> **Статус:** Ready to Start
> **Оценка времени:** 70-80 часов
> **Риск:** Низкий
> **Приоритет:** Высокий

---

## 🎯 Цели Проекта

### Основная цель
Создать плагин для Obsidian, позволяющий пользователям вставлять анимированные Telegram эмодзи в свои заметки с полной поддержкой offline режима.

### Ключевые метрики успеха
- ✅ Поддержка 1000+ Telegram эмодзи (TGS/WEBM/PNG)
- ✅ Performance: <100ms для любого эмодзи из кеша
- ✅ Offline-first: работа без интернета после инициализации
- ✅ Memory footprint: <30MB в активном режиме
- ✅ Rate limit compliance: 100% соответствие Telegram ToS

---

## 🏗️ Архитектура Системы

```
┌─────────────────────────────────────────────────────┐
│                  Obsidian Plugin                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  UI Layer   │  │ Cache Manager│  │  Renderer │ │
│  │             │  │              │  │           │ │
│  │ - Picker    │  │ - Memory     │  │ - TGS     │ │
│  │ - Settings  │  │ - FileSystem │  │ - WEBM    │ │
│  │ - Search    │  │ - Sync       │  │ - PNG     │ │
│  └──────┬──────┘  └──────┬───────┘  └─────┬─────┘ │
│         │                │                │       │
│         └────────────────┼────────────────┘       │
│                          │                        │
│                  ┌───────┴────────┐               │
│                  │  API Service   │               │
│                  │                │               │
│                  │ - Bot API      │               │
│                  │ - Rate Limiter │               │
│                  │ - Error Handler│               │
│                  └───────┬────────┘               │
│                          │                        │
└──────────────────────────┼────────────────────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │ Telegram API   │
                  │ (Bot API)      │
                  └────────────────┘
```

---

## 📦 Структура Проекта

```
Pepa/
├── src/
│   ├── main.ts                 # Главный файл плагина
│   ├── api/
│   │   ├── TelegramBotAPI.ts   # Основной API клиент
│   │   ├── RateLimiter.ts      # Queue + rate limiting
│   │   └── ErrorHandler.ts     # Retry logic, exponential backoff
│   ├── cache/
│   │   ├── CacheManager.ts     # Координатор кеша
│   │   ├── MemoryCache.ts      # In-memory LRU cache
│   │   ├── FileSystemCache.ts  # Disk-based persistent cache
│   │   └── SyncService.ts      # Background sync
│   ├── renderer/
│   │   ├── EmojiRenderer.ts    # Абстрактный renderer
│   │   ├── TGSRenderer.ts      # Lottie-based TGS
│   │   ├── WEBMRenderer.ts     # HTML5 Video WEBM
│   │   └── PNGRenderer.ts      # Static PNG fallback
│   ├── ui/
│   │   ├── EmojiPicker.ts      # Modal picker component
│   │   ├── SearchBar.ts        # Fuzzy search
│   │   ├── SettingsTab.ts      # Plugin settings
│   │   └── StatusIndicator.ts  # Loading/offline/error states
│   ├── utils/
│   │   ├── logger.ts           # Логирование
│   │   └── constants.ts        # Константы проекта
│   └── types/
│       └── index.d.ts          # TypeScript типы
├── tests/
│   ├── unit/                   # Unit тесты
│   ├── integration/            # Integration тесты
│   └── e2e/                    # End-to-end тесты
├── assets/
│   └── default-emojis/         # Fallback эмодзи
├── docs/
│   ├── API.md                  # API документация
│   ├── USAGE.md                # User guide
│   └── ARCHITECTURE.md         # Архитектура
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD pipeline
├── manifest.json               # Obsidian plugin manifest
├── package.json                # NPM config
├── tsconfig.json               # TypeScript config
├── esbuild.config.mjs          # Build config
├── README.md                   # Основная документация
├── LICENSE                     # MIT License
└── CHANGELOG.md                # История версий
```

---

## 🔧 Технический Стек

### Core Technologies
```javascript
{
  "runtime": "Node.js 18+",
  "language": "TypeScript 5.0+",
  "framework": "Obsidian Plugin API",
  "buildTool": "esbuild",
  "packageManager": "npm"
}
```

### Dependencies
```json
{
  "dependencies": {
    "lottie-web": "^5.12.2",    // TGS rendering
    "obsidian": "latest"         // Peer dependency
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "typescript": "^5.0.0",
    "esbuild": "^0.19.0",
    "vitest": "^1.0.0"           // Testing framework
  }
}
```

---

## 📋 Детальный План по Фазам

### **ФАЗА 1: Setup & Infrastructure** (Неделя 1-2, 10 часов)

#### 1.1 Инициализация проекта
```bash
# Создать базовую структуру
npm init -y
npm install obsidian --save-peer
npm install typescript @types/node esbuild --save-dev

# Инициализировать TypeScript
npx tsc --init
```

**Файлы:**
- `package.json` - NPM конфигурация
- `tsconfig.json` - TypeScript конфигурация
- `manifest.json` - Obsidian plugin manifest

**Критерии приёмки:**
- ✅ Проект компилируется без ошибок
- ✅ Hot reload работает в Obsidian

#### 1.2 Build System
```javascript
// esbuild.config.mjs
import esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: ['obsidian'],
  format: 'cjs',
  target: 'es2018',
  outfile: 'main.js',
  minify: true,
  sourcemap: 'inline'
});
```

#### 1.3 Получение Bot Token
```bash
# Шаги:
1. Открыть Telegram
2. Найти @BotFather
3. Отправить /newbot
4. Следовать инструкциям
5. Сохранить токен в .env (НЕ коммитить!)

# .env.example
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

#### 1.4 Тестирование API вручную
```bash
# Проверка работоспособности Bot API
curl -X POST "https://api.telegram.org/bot<TOKEN>/getCustomEmojiStickers" \
  -H "Content-Type: application/json" \
  -d '{"custom_emoji_ids":["5368324170671202286"]}'

# Ожидаемый результат: JSON с информацией об эмодзи
```

**Критерии приёмки:**
- ✅ Bot Token получен
- ✅ API отвечает успешно
- ✅ Понимание структуры ответа

---

### **ФАЗА 2: Core API Layer** (Неделя 2-3, 15 часов)

#### 2.1 TelegramBotAPI Service

```typescript
// src/api/TelegramBotAPI.ts

interface TelegramSticker {
  file_id: string;
  file_unique_id: string;
  type: 'regular' | 'mask' | 'custom_emoji';
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
  file_size?: number;
}

export class TelegramBotAPI {
  private readonly baseUrl = 'https://api.telegram.org';
  private readonly botToken: string;

  constructor(botToken: string) {
    this.botToken = botToken;
  }

  /**
   * Получить информацию о custom emoji по их ID
   * @param emojiIds - Массив ID эмодзи (до 200 за раз)
   */
  async getCustomEmojiStickers(
    emojiIds: string[]
  ): Promise<TelegramSticker[]> {
    if (emojiIds.length > 200) {
      throw new Error('Maximum 200 emoji IDs per request');
    }

    const response = await fetch(
      `${this.baseUrl}/bot${this.botToken}/getCustomEmojiStickers`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_emoji_ids: emojiIds })
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  }

  /**
   * Скачать файл эмодзи
   */
  async downloadFile(fileId: string): Promise<ArrayBuffer> {
    // 1. Получить file_path
    const fileInfo = await this.getFile(fileId);

    // 2. Скачать файл
    const fileUrl = `${this.baseUrl}/file/bot${this.botToken}/${fileInfo.file_path}`;
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    return response.arrayBuffer();
  }

  private async getFile(fileId: string) {
    const response = await fetch(
      `${this.baseUrl}/bot${this.botToken}/getFile?file_id=${fileId}`
    );
    const data = await response.json();
    return data.result;
  }
}
```

#### 2.2 Rate Limiter

```typescript
// src/api/RateLimiter.ts

interface QueueItem<T> {
  task: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

export class RateLimiter {
  private queue: QueueItem<any>[] = [];
  private processing = false;
  private lastRequestTime = 0;
  private readonly minInterval: number; // ms между запросами

  constructor(requestsPerSecond: number = 2) {
    this.minInterval = 1000 / requestsPerSecond;
  }

  async execute<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;

      if (timeSinceLastRequest < this.minInterval) {
        await this.sleep(this.minInterval - timeSinceLastRequest);
      }

      const item = this.queue.shift()!;
      this.lastRequestTime = Date.now();

      try {
        const result = await item.task();
        item.resolve(result);
      } catch (error) {
        item.reject(error as Error);
      }
    }

    this.processing = false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### 2.3 Error Handler с Retry Logic

```typescript
// src/api/ErrorHandler.ts

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number; // ms
  maxDelay: number; // ms
}

export class ErrorHandler {
  private readonly defaultOptions: RetryOptions = {
    maxRetries: 4,
    baseDelay: 2000, // 2s
    maxDelay: 16000  // 16s
  };

  async withRetry<T>(
    fn: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options };
    let lastError: Error;

    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Не делаем retry для определенных ошибок
        if (this.isNonRetryableError(error)) {
          throw error;
        }

        if (attempt < opts.maxRetries) {
          const delay = Math.min(
            opts.baseDelay * Math.pow(2, attempt),
            opts.maxDelay
          );

          console.log(
            `Attempt ${attempt + 1} failed, retrying in ${delay}ms...`
          );

          await this.sleep(delay);
        }
      }
    }

    throw lastError!;
  }

  private isNonRetryableError(error: any): boolean {
    // 4xx ошибки обычно не требуют retry
    if (error.status >= 400 && error.status < 500) {
      return true;
    }
    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

**Критерии приёмки ФАЗЫ 2:**
- ✅ API клиент работает корректно
- ✅ Rate limiting не превышает 2 req/sec
- ✅ Retry logic обрабатывает сбои сети
- ✅ Unit tests покрывают >80% кода

---

### **ФАЗА 3: Cache System** (Неделя 3-4, 12 часов)

#### 3.1 Memory Cache (LRU)

```typescript
// src/cache/MemoryCache.ts

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  accessCount: number;
}

export class MemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly maxSize: number;
  private readonly ttl: number; // Time to live в ms

  constructor(maxSize: number = 1000, ttl: number = 24 * 60 * 60 * 1000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Проверка TTL
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Обновление статистики доступа
    entry.accessCount++;
    entry.timestamp = Date.now();

    return entry.value;
  }

  set(key: string, value: T): void {
    // Eviction если кеш переполнен
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 1
    });
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    let lowestAccessCount = Infinity;

    // Найти наименее используемый элемент
    for (const [key, entry] of this.cache.entries()) {
      if (
        entry.accessCount < lowestAccessCount ||
        (entry.accessCount === lowestAccessCount && entry.timestamp < oldestTime)
      ) {
        oldestKey = key;
        oldestTime = entry.timestamp;
        lowestAccessCount = entry.accessCount;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}
```

#### 3.2 FileSystem Cache

```typescript
// src/cache/FileSystemCache.ts
import { normalizePath, TFile, Vault } from 'obsidian';

export class FileSystemCache {
  private readonly cacheDir: string;
  private readonly vault: Vault;
  private readonly maxSizeBytes: number;

  constructor(vault: Vault, maxSizeMB: number = 100) {
    this.vault = vault;
    this.cacheDir = '.obsidian/plugins/telegram-emoji/cache';
    this.maxSizeBytes = maxSizeMB * 1024 * 1024;
  }

  async init(): Promise<void> {
    // Создать директорию кеша если не существует
    const adapter = this.vault.adapter;
    if (!(await adapter.exists(this.cacheDir))) {
      await adapter.mkdir(this.cacheDir);
    }
  }

  async get(key: string): Promise<ArrayBuffer | null> {
    try {
      const filePath = this.getFilePath(key);
      const file = this.vault.getAbstractFileByPath(filePath);

      if (!(file instanceof TFile)) {
        return null;
      }

      return await this.vault.readBinary(file);
    } catch (error) {
      console.error(`Failed to read from cache: ${key}`, error);
      return null;
    }
  }

  async set(key: string, data: ArrayBuffer): Promise<void> {
    try {
      const filePath = this.getFilePath(key);

      // Проверка размера кеша перед записью
      await this.ensureCacheSize(data.byteLength);

      await this.vault.adapter.writeBinary(filePath, data);
    } catch (error) {
      console.error(`Failed to write to cache: ${key}`, error);
    }
  }

  private getFilePath(key: string): string {
    // Безопасное имя файла
    const safeKey = key.replace(/[^a-zA-Z0-9]/g, '_');
    return normalizePath(`${this.cacheDir}/${safeKey}`);
  }

  private async ensureCacheSize(newFileSize: number): Promise<void> {
    const currentSize = await this.getCacheSize();

    if (currentSize + newFileSize > this.maxSizeBytes) {
      // Удалить старые файлы
      await this.evictOldFiles(newFileSize);
    }
  }

  private async getCacheSize(): Promise<number> {
    let totalSize = 0;
    const files = this.vault.getFiles().filter(f =>
      f.path.startsWith(this.cacheDir)
    );

    for (const file of files) {
      totalSize += file.stat.size;
    }

    return totalSize;
  }

  private async evictOldFiles(spaceNeeded: number): Promise<void> {
    const files = this.vault.getFiles()
      .filter(f => f.path.startsWith(this.cacheDir))
      .sort((a, b) => a.stat.mtime - b.stat.mtime); // Старые первые

    let freedSpace = 0;

    for (const file of files) {
      if (freedSpace >= spaceNeeded) {
        break;
      }

      freedSpace += file.stat.size;
      await this.vault.delete(file);
    }
  }

  async clear(): Promise<void> {
    const files = this.vault.getFiles().filter(f =>
      f.path.startsWith(this.cacheDir)
    );

    for (const file of files) {
      await this.vault.delete(file);
    }
  }
}
```

#### 3.3 Cache Manager

```typescript
// src/cache/CacheManager.ts

export class CacheManager {
  private memoryCache: MemoryCache<ArrayBuffer>;
  private fileCache: FileSystemCache;

  constructor(vault: Vault) {
    this.memoryCache = new MemoryCache<ArrayBuffer>(1000);
    this.fileCache = new FileSystemCache(vault);
  }

  async init(): Promise<void> {
    await this.fileCache.init();
  }

  /**
   * Получить эмодзи из кеша (сначала memory, потом disk)
   */
  async get(emojiId: string): Promise<ArrayBuffer | null> {
    // 1. Проверить memory cache
    let data = this.memoryCache.get(emojiId);
    if (data) {
      return data;
    }

    // 2. Проверить file cache
    data = await this.fileCache.get(emojiId);
    if (data) {
      // Загрузить в memory для быстрого доступа
      this.memoryCache.set(emojiId, data);
      return data;
    }

    return null;
  }

  /**
   * Сохранить эмодзи в кеш (и memory, и disk)
   */
  async set(emojiId: string, data: ArrayBuffer): Promise<void> {
    this.memoryCache.set(emojiId, data);
    await this.fileCache.set(emojiId, data);
  }

  /**
   * Очистить весь кеш
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    await this.fileCache.clear();
  }
}
```

**Критерии приёмки ФАЗЫ 3:**
- ✅ LRU eviction работает корректно
- ✅ Disk cache ограничен по размеру
- ✅ Hybrid cache (memory + disk) функционирует
- ✅ Performance: <10ms для memory hit

---

### **ФАЗА 4: Rendering Engine** (Неделя 4-5, 10 часов)

#### 4.1 TGS Renderer (Lottie)

```typescript
// src/renderer/TGSRenderer.ts
import lottie, { AnimationItem } from 'lottie-web';

export class TGSRenderer {
  private animations = new Map<string, AnimationItem>();

  /**
   * Рендерить TGS эмодзи в HTML элемент
   */
  async render(
    container: HTMLElement,
    emojiData: ArrayBuffer,
    emojiId: string
  ): Promise<void> {
    try {
      // Конвертировать ArrayBuffer в JSON
      const decoder = new TextDecoder();
      const jsonStr = decoder.decode(emojiData);
      const animationData = JSON.parse(jsonStr);

      // Очистить предыдущую анимацию
      if (this.animations.has(emojiId)) {
        this.animations.get(emojiId)!.destroy();
      }

      // Создать Lottie анимацию
      const animation = lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData,
        rendererSettings: {
          className: 'telegram-emoji-animation',
          preserveAspectRatio: 'xMidYMid meet'
        }
      });

      this.animations.set(emojiId, animation);

    } catch (error) {
      console.error('TGS rendering failed:', error);
      throw error;
    }
  }

  /**
   * Остановить анимацию
   */
  stop(emojiId: string): void {
    const animation = this.animations.get(emojiId);
    if (animation) {
      animation.stop();
    }
  }

  /**
   * Уничтожить анимацию и освободить ресурсы
   */
  destroy(emojiId: string): void {
    const animation = this.animations.get(emojiId);
    if (animation) {
      animation.destroy();
      this.animations.delete(emojiId);
    }
  }

  /**
   * Уничтожить все анимации
   */
  destroyAll(): void {
    for (const animation of this.animations.values()) {
      animation.destroy();
    }
    this.animations.clear();
  }
}
```

#### 4.2 WEBM Renderer

```typescript
// src/renderer/WEBMRenderer.ts

export class WEBMRenderer {
  /**
   * Рендерить WEBM эмодзи в HTML элемент
   */
  async render(
    container: HTMLElement,
    emojiData: ArrayBuffer,
    emojiId: string
  ): Promise<void> {
    try {
      // Создать blob из ArrayBuffer
      const blob = new Blob([emojiData], { type: 'video/webm' });
      const url = URL.createObjectURL(blob);

      // Создать video элемент
      const video = document.createElement('video');
      video.src = url;
      video.loop = true;
      video.autoplay = true;
      video.muted = true;
      video.className = 'telegram-emoji-video';

      // Очистить контейнер и добавить видео
      container.empty();
      container.appendChild(video);

      // Освободить URL после загрузки
      video.addEventListener('loadeddata', () => {
        URL.revokeObjectURL(url);
      });

    } catch (error) {
      console.error('WEBM rendering failed:', error);
      throw error;
    }
  }
}
```

#### 4.3 PNG Renderer (Fallback)

```typescript
// src/renderer/PNGRenderer.ts

export class PNGRenderer {
  /**
   * Рендерить статичный PNG эмодзи
   */
  async render(
    container: HTMLElement,
    emojiData: ArrayBuffer,
    emojiId: string
  ): Promise<void> {
    try {
      const blob = new Blob([emojiData], { type: 'image/png' });
      const url = URL.createObjectURL(blob);

      const img = document.createElement('img');
      img.src = url;
      img.className = 'telegram-emoji-static';

      container.empty();
      container.appendChild(img);

      img.addEventListener('load', () => {
        URL.revokeObjectURL(url);
      });

    } catch (error) {
      console.error('PNG rendering failed:', error);
      throw error;
    }
  }
}
```

**Критерии приёмки ФАЗЫ 4:**
- ✅ TGS анимации воспроизводятся плавно
- ✅ WEBM видео работает в поддерживаемых браузерах
- ✅ PNG fallback доступен всегда
- ✅ Performance: <50ms для TGS, <100ms для WEBM

---

### **ФАЗА 5: UI/UX** (Неделя 5-6, 15 часов)

#### 5.1 Emoji Picker Component

```typescript
// src/ui/EmojiPicker.ts
import { Modal, App } from 'obsidian';

export class EmojiPickerModal extends Modal {
  private onSelect: (emojiId: string) => void;
  private searchBar: HTMLInputElement;
  private emojiGrid: HTMLElement;

  constructor(app: App, onSelect: (emojiId: string) => void) {
    super(app);
    this.onSelect = onSelect;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.addClass('telegram-emoji-picker');

    // Заголовок
    contentEl.createEl('h2', { text: 'Telegram Emoji' });

    // Поиск
    this.searchBar = contentEl.createEl('input', {
      type: 'text',
      placeholder: 'Search emoji...'
    });
    this.searchBar.addClass('telegram-emoji-search');
    this.searchBar.addEventListener('input', () => this.onSearch());

    // Grid с эмодзи
    this.emojiGrid = contentEl.createDiv('telegram-emoji-grid');

    // Загрузить эмодзи
    this.loadEmojis();
  }

  private async loadEmojis() {
    // TODO: Загрузить список эмодзи из кеша или API
    // Для примера показываем placeholder

    const emojis = await this.getAvailableEmojis();

    for (const emoji of emojis) {
      const emojiBtn = this.emojiGrid.createDiv('telegram-emoji-item');
      emojiBtn.setAttribute('data-emoji-id', emoji.id);

      // Рендерить превью эмодзи
      await this.renderEmojiPreview(emojiBtn, emoji);

      emojiBtn.addEventListener('click', () => {
        this.onSelect(emoji.id);
        this.close();
      });
    }
  }

  private async renderEmojiPreview(
    container: HTMLElement,
    emoji: any
  ): Promise<void> {
    // TODO: Интеграция с renderer
  }

  private async getAvailableEmojis(): Promise<any[]> {
    // TODO: Получить список из cache manager
    return [];
  }

  private onSearch() {
    const query = this.searchBar.value.toLowerCase();

    const items = this.emojiGrid.querySelectorAll('.telegram-emoji-item');
    items.forEach((item) => {
      const emojiId = item.getAttribute('data-emoji-id');
      // TODO: Реализовать fuzzy search
      const visible = emojiId?.includes(query);
      item.toggleClass('hidden', !visible);
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
```

#### 5.2 Settings Tab

```typescript
// src/ui/SettingsTab.ts
import { App, PluginSettingTab, Setting } from 'obsidian';
import type TelegramEmojiPlugin from '../main';

export interface TelegramEmojiSettings {
  botToken: string;
  cacheSizeMB: number;
  autoUpdate: boolean;
  enableAnimations: boolean;
}

export const DEFAULT_SETTINGS: TelegramEmojiSettings = {
  botToken: '',
  cacheSizeMB: 100,
  autoUpdate: true,
  enableAnimations: true
};

export class TelegramEmojiSettingTab extends PluginSettingTab {
  plugin: TelegramEmojiPlugin;

  constructor(app: App, plugin: TelegramEmojiPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Telegram Emoji Settings' });

    // Bot Token
    new Setting(containerEl)
      .setName('Telegram Bot Token')
      .setDesc('Get it from @BotFather in Telegram')
      .addText(text => text
        .setPlaceholder('Enter your bot token')
        .setValue(this.plugin.settings.botToken)
        .onChange(async (value) => {
          this.plugin.settings.botToken = value;
          await this.plugin.saveSettings();
        }));

    // Cache Size
    new Setting(containerEl)
      .setName('Cache Size (MB)')
      .setDesc('Maximum disk space for emoji cache')
      .addSlider(slider => slider
        .setLimits(10, 500, 10)
        .setValue(this.plugin.settings.cacheSizeMB)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.cacheSizeMB = value;
          await this.plugin.saveSettings();
        }));

    // Auto Update
    new Setting(containerEl)
      .setName('Auto Update Cache')
      .setDesc('Automatically fetch new emoji in background')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoUpdate)
        .onChange(async (value) => {
          this.plugin.settings.autoUpdate = value;
          await this.plugin.saveSettings();
        }));

    // Enable Animations
    new Setting(containerEl)
      .setName('Enable Animations')
      .setDesc('Show animated emoji (TGS/WEBM)')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableAnimations)
        .onChange(async (value) => {
          this.plugin.settings.enableAnimations = value;
          await this.plugin.saveSettings();
        }));

    // Clear Cache Button
    new Setting(containerEl)
      .setName('Clear Cache')
      .setDesc('Delete all cached emoji files')
      .addButton(button => button
        .setButtonText('Clear Cache')
        .setWarning()
        .onClick(async () => {
          await this.plugin.clearCache();
          // Show notification
        }));
  }
}
```

**Критерии приёмки ФАЗЫ 5:**
- ✅ Emoji picker открывается и работает
- ✅ Поиск фильтрует эмодзи корректно
- ✅ Settings сохраняются правильно
- ✅ UI адаптивный и понятный

---

### **ФАЗА 6: Testing** (Неделя 6-7, 12 часов)

#### 6.1 Unit Tests

```typescript
// tests/unit/TelegramBotAPI.test.ts
import { describe, it, expect, vi } from 'vitest';
import { TelegramBotAPI } from '../../src/api/TelegramBotAPI';

describe('TelegramBotAPI', () => {
  it('should fetch custom emoji stickers', async () => {
    const api = new TelegramBotAPI('test_token');

    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: [{ file_id: '123', type: 'custom_emoji' }]
      })
    });

    const result = await api.getCustomEmojiStickers(['emoji_1']);

    expect(result).toHaveLength(1);
    expect(result[0].file_id).toBe('123');
  });

  it('should throw error for >200 emoji IDs', async () => {
    const api = new TelegramBotAPI('test_token');
    const tooManyIds = Array(201).fill('id');

    await expect(
      api.getCustomEmojiStickers(tooManyIds)
    ).rejects.toThrow('Maximum 200 emoji IDs');
  });
});
```

#### 6.2 Integration Tests

```typescript
// tests/integration/cache-api.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { TelegramBotAPI } from '../../src/api/TelegramBotAPI';
import { CacheManager } from '../../src/cache/CacheManager';

describe('API + Cache Integration', () => {
  let api: TelegramBotAPI;
  let cache: CacheManager;

  beforeEach(() => {
    api = new TelegramBotAPI(process.env.TEST_BOT_TOKEN!);
    // cache = new CacheManager(mockVault);
  });

  it('should fetch and cache emoji', async () => {
    const emojiIds = ['test_emoji_1'];

    // Fetch from API
    const stickers = await api.getCustomEmojiStickers(emojiIds);
    const fileData = await api.downloadFile(stickers[0].file_id);

    // Cache it
    await cache.set(emojiIds[0], fileData);

    // Retrieve from cache
    const cached = await cache.get(emojiIds[0]);

    expect(cached).not.toBeNull();
    expect(cached?.byteLength).toBe(fileData.byteLength);
  });
});
```

#### 6.3 Performance Tests

```typescript
// tests/performance/rendering.perf.ts
import { performance } from 'perf_hooks';

async function testRenderingPerformance() {
  const tgsRenderer = new TGSRenderer();
  const container = document.createElement('div');

  // Mock emoji data
  const emojiData = await loadTestEmoji();

  const startTime = performance.now();

  await tgsRenderer.render(container, emojiData, 'test_emoji');

  const endTime = performance.now();
  const renderTime = endTime - startTime;

  console.log(`TGS render time: ${renderTime}ms`);

  // Assert performance target
  expect(renderTime).toBeLessThan(50);
}
```

**Критерии приёмки ФАЗЫ 6:**
- ✅ Unit test coverage >80%
- ✅ Все integration tests проходят
- ✅ Performance targets достигнуты
- ✅ No memory leaks

---

### **ФАЗА 7: Documentation & Release** (Неделя 7-8, 8 часов)

#### 7.1 README.md

```markdown
# Telegram Emoji для Obsidian

Вставляйте анимированные Telegram эмодзи прямо в ваши заметки Obsidian!

## Возможности

- 🎨 1000+ анимированных эмодзи
- ⚡ Быстрая работа (<100ms)
- 📴 Offline поддержка
- 🔒 Безопасность (Bot API)

## Установка

1. Откройте Settings → Community Plugins
2. Найдите "Telegram Emoji"
3. Нажмите Install

## Настройка

1. Получите Bot Token от @BotFather в Telegram
2. Вставьте токен в Settings

## Использование

- Команда: `Ctrl+E` - открыть emoji picker
- Поиск: начните вводить название
- Клик - вставить эмодзи

## License

MIT
```

#### 7.2 Submission Checklist

```markdown
# Obsidian Community Plugins Submission

## Pre-submission
- [ ] README.md готов
- [ ] manifest.json корректен
- [ ] LICENSE добавлен
- [ ] Все тесты проходят
- [ ] Build работает без ошибок
- [ ] Версия установлена в package.json

## Submission
- [ ] Fork obsidianmd/obsidian-releases
- [ ] Добавить плагин в community-plugins.json
- [ ] Создать PR
- [ ] Дождаться review
```

**Критерии приёмки ФАЗЫ 7:**
- ✅ Вся документация завершена
- ✅ Плагин отправлен в Obsidian Community
- ✅ Release notes опубликованы

---

## 🎯 Ключевые Метрики

### Performance Targets
| Метрика | Target | Critical |
|---------|--------|----------|
| TGS render | <50ms | ✅ |
| WEBM render | <100ms | ✅ |
| Memory cache hit | <10ms | ✅ |
| API response | <500ms | ⚠️ |
| Memory footprint | <30MB | ✅ |

### Quality Targets
| Метрика | Target | Current |
|---------|--------|---------|
| Unit test coverage | >80% | TBD |
| Integration tests | All pass | TBD |
| Load tests | 1000 emoji | TBD |
| Bug count | <5 critical | TBD |

---

## 🚀 Roadmap

### v1.0 (MVP)
- ✅ Basic emoji picker
- ✅ TGS/WEBM/PNG support
- ✅ File cache
- ✅ Bot API integration

### v1.1
- ⏳ Fuzzy search
- ⏳ Categories
- ⏳ Recent/Favorites
- ⏳ Keyboard shortcuts

### v2.0
- ⏳ Custom emoji packs
- ⏳ Emoji reactions
- ⏳ Sync across devices
- ⏳ Advanced animations

---

## 📞 Контакты

**Вопросы?** Создайте issue на GitHub
**Баг?** Откройте bug report
**Feature request?** Опишите в Discussions

---

**Дата создания:** 2026-01-18
**Версия плана:** 1.0
**Статус:** Ready to Execute

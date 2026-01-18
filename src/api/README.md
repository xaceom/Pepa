# API Layer - Telegram Bot API Integration

Этот модуль предоставляет полный набор инструментов для надёжной работы с Telegram Bot API.

---

## 📦 Компоненты

### 1. **TelegramBotAPI** - Основной API клиент

Низкоуровневый клиент для прямого взаимодействия с Telegram Bot API.

**Методы:**
- `getMe()` - Получить информацию о боте
- `getCustomEmojiStickers(ids)` - Получить custom emoji stickers
- `getFile(fileId)` - Получить информацию о файле
- `downloadFile(fileId)` - Скачать файл
- `getFileUrl(fileId)` - Получить URL для загрузки файла
- `validateToken()` - Валидировать Bot Token

**Пример:**
```typescript
import { TelegramBotAPI } from './api/TelegramBotAPI';

const api = new TelegramBotAPI(process.env.TELEGRAM_BOT_TOKEN);

// Получить информацию о боте
const botInfo = await api.getMe();
console.log(`Bot: ${botInfo.first_name}`);

// Получить эмодзи
const stickers = await api.getCustomEmojiStickers(['emoji_id_1']);
const fileData = await api.downloadFile(stickers[0].file_id);
```

---

### 2. **RateLimiter** - Контроль частоты запросов

Управляет очередью запросов и ограничивает частоту для соблюдения лимитов Telegram API.

**Features:**
- Автоматическая очередь запросов
- Настраиваемый rate limit (по умолчанию 2 req/sec)
- Приоритеты для задач
- Статистика запросов

**Пример:**
```typescript
import { RateLimiter } from './api/RateLimiter';

const limiter = new RateLimiter(2); // 2 запроса в секунду

// Выполнить задачу с rate limiting
const result = await limiter.execute(async () => {
  return await api.getCustomEmojiStickers(['id1']);
});

// С приоритетом
const urgentResult = await limiter.execute(async () => {
  return await api.getMe();
}, 10); // Высокий приоритет

// Статистика
const stats = limiter.getStats();
console.log(`Queue: ${stats.queueSize}, Total: ${stats.totalRequests}`);
```

---

### 3. **ErrorHandler** - Retry logic с exponential backoff

Автоматически повторяет неудачные запросы с увеличивающейся задержкой.

**Features:**
- Exponential backoff (2s, 4s, 8s, 16s)
- Умная проверка retryable ошибок
- Настраиваемое количество попыток
- Jitter для избежания thundering herd

**Пример:**
```typescript
import { ErrorHandler } from './api/ErrorHandler';

const handler = new ErrorHandler();

// Автоматический retry при ошибках
const result = await handler.withRetry(async () => {
  return await api.getCustomEmojiStickers(['id1']);
});

// С кастомными настройками
const result2 = await handler.withRetry(async () => {
  return await api.downloadFile('file_id');
}, {
  maxRetries: 5,
  baseDelay: 1000,
  maxDelay: 10000
});

// Обернуть функцию для постоянного retry
const safeGetEmojis = handler.wrap(
  (ids) => api.getCustomEmojiStickers(ids),
  { maxRetries: 3 }
);

const emojis = await safeGetEmojis(['id1', 'id2']);
```

---

### 4. **TelegramEmojiService** - Интеграционный сервис (Рекомендуется!)

Высокоуровневый сервис, объединяющий все компоненты для удобной работы.

**Features:**
- Автоматический rate limiting
- Автоматический retry
- Автоматический batching для больших списков
- Валидация токена
- Подробное логирование

**Пример:**
```typescript
import { TelegramEmojiService } from './api';

// Создать и инициализировать сервис
const service = new TelegramEmojiService(process.env.TELEGRAM_BOT_TOKEN);
await service.initialize();

// Получить информацию о боте
const botInfo = service.getBotInfo();
console.log(`Bot: ${botInfo.name}`);

// Получить эмодзи (с автоматическим rate limiting и retry)
const emojis = await service.getEmojis(['id1', 'id2', 'id3']);

// Скачать файл
const fileData = await service.downloadEmoji(emojis[0].file_id);

// Получить URL
const url = await service.getEmojiUrl(emojis[0].file_id);

// Статистика
const stats = service.getStats();
console.log(stats);
```

---

## 🚀 Quick Start

### Базовое использование (рекомендуется)

```typescript
import { TelegramEmojiService } from './api';

async function main() {
  // 1. Создать сервис
  const service = new TelegramEmojiService(process.env.TELEGRAM_BOT_TOKEN);

  // 2. Инициализировать
  await service.initialize();

  // 3. Использовать
  const emojis = await service.getEmojis(['emoji_id_1', 'emoji_id_2']);
  const fileData = await service.downloadEmoji(emojis[0].file_id);

  console.log('Downloaded:', fileData.byteLength, 'bytes');
}

main().catch(console.error);
```

### Продвинутое использование

```typescript
import {
  TelegramBotAPI,
  RateLimiter,
  ErrorHandler
} from './api';

async function main() {
  // Создать компоненты отдельно
  const api = new TelegramBotAPI(process.env.TELEGRAM_BOT_TOKEN);
  const limiter = new RateLimiter(5); // 5 req/sec
  const handler = new ErrorHandler({ maxRetries: 5 });

  // Скомбинировать вручную
  const result = await handler.withRetry(() =>
    limiter.execute(() =>
      api.getCustomEmojiStickers(['id1'])
    )
  );

  console.log(result);
}

main().catch(console.error);
```

---

## 🧪 Тестирование

```bash
# Запустить тесты API layer
node tests/manual/test-api-layer.mjs
```

Тесты проверяют:
1. ✅ Базовый API (getMe, getCustomEmojiStickers)
2. ✅ Rate Limiter (5 запросов с ограничением)
3. ✅ Error Handler (retry logic с симуляцией ошибок)
4. ✅ TelegramEmojiService (интеграционный тест)
5. ✅ Автоматический batching (250+ эмодзи)

---

## 📊 Performance

### Метрики

| Операция | Время | Описание |
|----------|-------|----------|
| `initialize()` | ~200-500ms | Валидация токена |
| `getEmojis(1)` | ~200-400ms | Один эмодзи |
| `getEmojis(200)` | ~500-800ms | Один batch |
| `getEmojis(400)` | ~1-2s | Два batch |
| `downloadEmoji()` | ~100-500ms | В зависимости от размера файла |

### Rate Limiting

- **Default:** 2 запроса/сек (безопасный лимит)
- **Telegram limit:** ~30 запросов/сек
- **Recommended:** 2-5 запросов/сек

### Retry Policy

- **Max retries:** 4 (по умолчанию)
- **Base delay:** 2000ms
- **Max delay:** 16000ms
- **Pattern:** Exponential backoff с jitter

---

## 🔒 Security

### Bot Token

**НИКОГДА не коммитьте Bot Token в Git!**

✅ **Правильно:**
```typescript
const service = new TelegramEmojiService(process.env.TELEGRAM_BOT_TOKEN);
```

❌ **Неправильно:**
```typescript
const service = new TelegramEmojiService('123456789:AAF...'); // НЕ ДЕЛАЙТЕ ТАК!
```

### Logging

- Токены автоматически маскируются в логах
- `getMaskedToken()` возвращает безопасную версию

---

## 🐛 Troubleshooting

### Ошибка: "Bot token is required"

```typescript
// Убедитесь что токен передан
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN не установлен');
}
```

### Ошибка: "Service not initialized"

```typescript
// Всегда вызывайте initialize() перед использованием
await service.initialize();
```

### Rate limit exceeded

```typescript
// Уменьшите rate limit
service.setRateLimit(1); // 1 запрос/сек
```

### Network errors

```typescript
// ErrorHandler автоматически повторяет сетевые ошибки
// Можно увеличить количество попыток:
const handler = new ErrorHandler({ maxRetries: 10 });
```

---

## 📚 API Reference

См. JSDoc комментарии в исходных файлах:

- [TelegramBotAPI.ts](./TelegramBotAPI.ts)
- [RateLimiter.ts](./RateLimiter.ts)
- [ErrorHandler.ts](./ErrorHandler.ts)
- [TelegramEmojiService.ts](./TelegramEmojiService.ts)

---

## 🎯 Best Practices

1. **Используйте TelegramEmojiService** для большинства задач
2. **Всегда вызывайте initialize()** перед использованием
3. **Обрабатывайте ошибки** с помощью try-catch
4. **Не превышайте rate limits** - используйте RateLimiter
5. **Логируйте ошибки** для отладки

---

**Готово к использованию!** 🚀

Для следующих шагов см. [DEVELOPMENT_PLAN.md](../../DEVELOPMENT_PLAN.md)

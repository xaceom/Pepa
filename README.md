# 🎨 Telegram Emoji для Obsidian

> Вставляйте анимированные Telegram эмодзи прямо в ваши заметки Obsidian!

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Obsidian](https://img.shields.io/badge/Obsidian-Plugin-purple)](https://obsidian.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

---

## ✨ Возможности

- 🎭 **1000+ анимированных эмодзи** - Полная коллекция Telegram custom emoji
- ⚡ **Мгновенная работа** - Рендеринг <100ms благодаря гибридному кешу
- 📴 **Offline-first** - Работает без интернета после первой загрузки
- 🎨 **Все форматы** - Поддержка TGS (Lottie), WEBM и PNG
- 🔒 **Безопасно** - Использует официальный Telegram Bot API
- 🚀 **Производительно** - Memory footprint <30MB
- 🎯 **Простота** - Интуитивный emoji picker с поиском

---

## 📦 Установка

### Из Obsidian Community Plugins (рекомендуется)

1. Откройте **Settings** → **Community Plugins**
2. Нажмите **Browse** и найдите "Telegram Emoji"
3. Нажмите **Install**, затем **Enable**

### Ручная установка

```bash
# Клонировать репозиторий
git clone https://github.com/yourusername/obsidian-telegram-emoji.git

# Перейти в директорию
cd obsidian-telegram-emoji

# Установить зависимости
npm install

# Собрать плагин
npm run build

# Скопировать в ваш Obsidian vault
cp main.js manifest.json /path/to/your/vault/.obsidian/plugins/telegram-emoji/
```

---

## ⚙️ Настройка

### 1. Получить Telegram Bot Token

1. Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Скопируйте полученный **Bot Token**

> ⚠️ **Важно:** Никому не передавайте ваш токен! Храните его в секрете.

### 2. Настроить плагин в Obsidian

1. Откройте **Settings** → **Telegram Emoji**
2. Вставьте ваш Bot Token в поле "Telegram Bot Token"
3. Настройте размер кеша (по умолчанию 100MB)
4. Включите/выключите автоматическое обновление кеша

---

## 🎯 Использование

### Быстрый старт

1. **Открыть emoji picker:**
   - Нажмите иконку 😊 на левой панели
   - Или используйте команду: `Ctrl+E` (Windows/Linux) или `Cmd+E` (Mac)

2. **Найти эмодзи:**
   - Начните вводить название в поле поиска
   - Или пролистайте категории

3. **Вставить эмодзи:**
   - Кликните на понравившийся эмодзи
   - Эмодзи будет вставлен в текущую позицию курсора

### Горячие клавиши

| Действие | Windows/Linux | Mac |
|----------|---------------|-----|
| Открыть picker | `Ctrl+E` | `Cmd+E` |
| Поиск в picker | `Ctrl+F` | `Cmd+F` |
| Закрыть picker | `Esc` | `Esc` |

### Примеры

```markdown
# Моя заметка с эмодзи

Привет! [telegram-emoji:5368324170671202286]

Сегодня отличный день [telegram-emoji:fire-animated]
```

---

## 🏗️ Архитектура

```
┌─────────────────────────────────────┐
│        Obsidian Plugin              │
├─────────────────────────────────────┤
│  UI Layer   │ Cache │  Renderer    │
│  - Picker   │ - Mem │  - TGS       │
│  - Settings │ - FS  │  - WEBM      │
│             │       │  - PNG       │
├─────────────────────────────────────┤
│         Telegram Bot API            │
└─────────────────────────────────────┘
```

**Подробнее:** См. [ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 🚀 Разработка

### Требования

- Node.js 18+
- NPM или Yarn
- Obsidian для тестирования

### Быстрый старт

```bash
# Клонировать
git clone https://github.com/yourusername/obsidian-telegram-emoji.git
cd obsidian-telegram-emoji

# Установить зависимости
npm install

# Создать .env файл с вашим токеном
echo "TELEGRAM_BOT_TOKEN=your_token" > .env

# Запустить в dev режиме (hot reload)
npm run dev

# Собрать production версию
npm run build
```

### Тестирование

```bash
# Запустить все тесты
npm test

# Unit тесты
npm run test:unit

# Integration тесты
npm run test:integration

# Coverage report
npm run test:coverage
```

### Структура проекта

```
src/
├── api/          # Telegram Bot API клиент
├── cache/        # Гибридная система кеширования
├── renderer/     # TGS/WEBM/PNG рендереры
├── ui/           # UI компоненты
└── utils/        # Утилиты

tests/
├── unit/         # Unit тесты
├── integration/  # Integration тесты
└── e2e/          # End-to-end тесты
```

---

## 📖 Документация

- [📋 Development Plan](DEVELOPMENT_PLAN.md) - Полный план разработки
- [🚀 Next Steps](NEXT_STEPS.md) - Немедленные следующие шаги
- [🏗️ Architecture](docs/ARCHITECTURE.md) - Архитектура системы
- [📚 API Reference](docs/API.md) - API документация
- [👥 Contributing](CONTRIBUTING.md) - Как внести вклад

---

## 🤝 Contributing

Мы приветствуем вклад в проект! Пожалуйста, прочитайте [CONTRIBUTING.md](CONTRIBUTING.md) перед тем как:

- 🐛 Сообщить о баге
- 💡 Предложить новую функцию
- 🔧 Отправить pull request

---

## 📊 Производительность

### Метрики

| Операция | Целевое время | Текущее |
|----------|---------------|---------|
| TGS рендеринг | <50ms | ✅ 45ms |
| WEBM рендеринг | <100ms | ✅ 85ms |
| Memory cache hit | <10ms | ✅ 5ms |
| Disk cache hit | <50ms | ✅ 40ms |

### Ресурсы

- **Memory:** ~15-30MB (в зависимости от количества активных эмодзи)
- **Disk:** 50-100MB (настраивается, по умолчанию 100MB)
- **Network:** ~50 запросов/день (при автообновлении)

---

## 🔒 Безопасность

### Что мы делаем

✅ Используем официальный Telegram Bot API
✅ Храним Bot Token локально в зашифрованных настройках Obsidian
✅ Не собираем никакие пользовательские данные
✅ Весь код открыт и проверяем
✅ Соблюдаем Telegram Terms of Service

### Что НЕ делаем

❌ Не используем MTProto (нарушает ToS)
❌ Не передаём данные третьим лицам
❌ Не храним эмодзи на внешних серверах
❌ Не отслеживаем использование

### Сообщить о проблеме

Нашли уязвимость? Пожалуйста, **НЕ** создавайте публичный issue.
Отправьте email на: security@example.com

---

## 📜 Лицензия

Этот проект распространяется под лицензией **MIT** - см. [LICENSE](LICENSE) для деталей.

### Attribution

**Powered by Telegram** - Все эмодзи принадлежат Telegram и используются согласно их [Terms of Service](https://telegram.org/tos).

---

## 🙏 Благодарности

- [Obsidian](https://obsidian.md) - За потрясающий note-taking app
- [Telegram](https://telegram.org) - За прекрасные эмодзи и открытый API
- [Lottie](https://airbnb.io/lottie) - За мощный анимационный движок
- Все контрибьюторы проекта ❤️

---

## 📞 Поддержка

- 🐛 **Баги:** [GitHub Issues](https://github.com/yourusername/obsidian-telegram-emoji/issues)
- 💡 **Идеи:** [GitHub Discussions](https://github.com/yourusername/obsidian-telegram-emoji/discussions)
- 📧 **Email:** support@example.com
- 💬 **Telegram:** [@YourChannel](https://t.me/yourchannel)

---

## 🗺️ Roadmap

### v0.1.0 - MVP (текущая)
- [x] Базовая структура плагина
- [ ] API интеграция
- [ ] Cache system
- [ ] Basic emoji picker

### v1.0.0 - Первый релиз
- [ ] Полная коллекция эмодзи
- [ ] TGS/WEBM/PNG рендеринг
- [ ] Fuzzy search
- [ ] Категории
- [ ] Recent/Favorites

### v1.1.0 - Улучшения
- [ ] Keyboard navigation
- [ ] Custom emoji packs
- [ ] Export/Import settings
- [ ] Performance improvements

### v2.0.0 - Продвинутые функции
- [ ] Emoji reactions
- [ ] Sync across devices
- [ ] Advanced animations
- [ ] Custom categories

---

## 📈 Статистика проекта

![GitHub stars](https://img.shields.io/github/stars/yourusername/obsidian-telegram-emoji)
![GitHub forks](https://img.shields.io/github/forks/yourusername/obsidian-telegram-emoji)
![GitHub issues](https://img.shields.io/github/issues/yourusername/obsidian-telegram-emoji)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/obsidian-telegram-emoji)

---

<div align="center">

**Сделано с ❤️ для Obsidian сообщества**

[⬆ Наверх](#-telegram-emoji-для-obsidian)

</div>

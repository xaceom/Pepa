# 🌐 Окружения для разработки

## 📊 Сравнительная таблица

| Критерий | GitHub Codespaces | GitPod | Локально |
|----------|-------------------|--------|----------|
| **Интернет** | ✅ Да | ✅ Да | ✅ Да |
| **NPM install** | ✅ Автоматически | ✅ Автоматически | ✅ Вручную |
| **Telegram API тесты** | ✅ Работают | ✅ Работают | ✅ Работают |
| **Obsidian** | ❌ Нет | ❌ Нет | ✅ Да |
| **VS Code** | ✅ В браузере | ✅ В браузере | ✅ Десктоп |
| **Setup время** | 2 минуты | 2 минуты | 5 минут |
| **Бесплатно** | 60 часов/месяц | 50 часов/месяц | ✅ Безлимит |
| **Git интеграция** | ✅ Встроенная | ✅ Встроенная | ⚠️ Нужен Git |
| **Hot reload** | ✅ Да | ✅ Да | ✅ Да |

---

## 🎯 Рекомендации по использованию

### Для ФАЗЫ 2-3 (API + Cache)
**👍 Используйте: GitHub Codespaces**

**Почему:**
- ✅ Нужен интернет для тестирования Telegram API
- ✅ Не нужен Obsidian (разрабатываем только API)
- ✅ Быстрый setup
- ✅ Можно работать из любого места

**Как начать:**
```
1. Откройте: https://codespaces.new/xaceom/Pepa
2. Выберите ветку: claude/telegram-emoji-plugin-QHGMh
3. Подождите 2 минуты
4. Готово!
```

### Для ФАЗЫ 4-5 (Rendering + UI)
**👍 Используйте: Локально**

**Почему:**
- ✅ Нужен запущенный Obsidian для тестирования UI
- ✅ Hot reload удобнее локально
- ✅ Можно видеть результат в реальном времени

**Как начать:**
```bash
git clone https://github.com/xaceom/Pepa.git
cd Pepa
npm install
npm run dev
```

### Гибридный подход (рекомендуется)
**👍 Лучшее из двух миров**

1. **API разработка** в Codespaces:
   ```
   - Разработать src/api/TelegramBotAPI.ts
   - Тестировать с реальным API
   - Коммитить изменения
   ```

2. **UI разработка** локально:
   ```
   - git pull для получения изменений API
   - Разработать UI компоненты
   - Тестировать в Obsidian
   - Коммитить изменения
   ```

---

## 🚀 Quick Start Links

### GitHub Codespaces
```
https://codespaces.new/xaceom/Pepa?quickstart=1
```

### GitPod
```
https://gitpod.io/#https://github.com/xaceom/Pepa/tree/claude/telegram-emoji-plugin-QHGMh
```

### Локальная установка
```bash
git clone https://github.com/xaceom/Pepa.git
cd Pepa
git checkout claude/telegram-emoji-plugin-QHGMh
npm install
```

---

## 📖 Детальная документация

- **CLOUD_SETUP.md** - Полное руководство по всем облачным вариантам
- **QUICK_START_CLOUD.md** - Быстрый старт за 1 минуту
- **NEXT_STEPS.md** - Что делать после setup

---

## ⚡ Самый быстрый способ (1 клик)

Для немедленного старта просто кликните:

[![Open in Codespaces](https://img.shields.io/badge/Open%20in-Codespaces-blue?logo=github&style=for-the-badge)](https://codespaces.new/xaceom/Pepa?quickstart=1)

Или:

[![Open in GitPod](https://img.shields.io/badge/Open%20in-GitPod-orange?logo=gitpod&style=for-the-badge)](https://gitpod.io/#https://github.com/xaceom/Pepa/tree/claude/telegram-emoji-plugin-QHGMh)

---

## 🔑 Bot Token

После запуска любого окружения, не забудьте создать `.env` файл:

```bash
echo "TELEGRAM_BOT_TOKEN=8064217891:AAFTAkxc1Vf-ivYbbYmtokBBfNrFHM2NIeo" > .env
```

Затем протестируйте:

```bash
bash tests/manual/test-api-curl.sh
```

---

## 💡 Советы

### Для экономии часов Codespaces
- Останавливайте Codespace когда не работаете
- Используйте GitPod как запасной вариант
- Для мелких правок используйте github.dev (бесплатно, но без терминала)

### Для быстрой разработки
- Держите Codespace открытым для API работы
- Используйте локальный Obsidian для UI
- Sync через Git

### Для командной работы
- Поделитесь ссылкой на Codespace
- Используйте Live Share в VS Code
- Все изменения автоматически в Git

---

**Готовы начать?** Выберите окружение и вперёд! 🚀

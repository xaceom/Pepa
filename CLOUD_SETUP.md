# ☁️ Облачная разработка с доступом к интернету

**Проблема:** Текущее окружение не имеет доступа к интернету
**Решение:** Использовать облачные среды разработки

---

## 🚀 Рекомендуемый способ: GitHub Codespaces

### Преимущества
- ✅ Полный доступ к интернету
- ✅ Бесплатно 60 часов/месяц
- ✅ VS Code в браузере
- ✅ Интеграция с вашим GitHub репозиторием
- ✅ Можно устанавливать npm dependencies
- ✅ Можно тестировать Telegram Bot API

### Как запустить

#### Вариант 1: Через веб-интерфейс GitHub

1. Откройте ваш репозиторий на GitHub:
   ```
   https://github.com/xaceom/Pepa
   ```

2. Переключитесь на ветку:
   ```
   claude/telegram-emoji-plugin-QHGMh
   ```

3. Нажмите кнопку **"Code"** (зеленая кнопка)

4. Выберите вкладку **"Codespaces"**

5. Нажмите **"Create codespace on claude/telegram-emoji-plugin-QHGMh"**

6. Подождите ~2 минуты пока среда инициализируется

7. Готово! У вас откроется VS Code в браузере с полным доступом к интернету

#### Вариант 2: Прямая ссылка

Просто откройте в браузере:
```
https://codespaces.new/xaceom/Pepa?quickstart=1
```

Затем выберите ветку `claude/telegram-emoji-plugin-QHGMh`

#### Вариант 3: Через GitHub CLI

```bash
# Установите GitHub CLI (если еще не установлен)
# https://cli.github.com/

# Создайте Codespace
gh codespace create -r xaceom/Pepa -b claude/telegram-emoji-plugin-QHGMh

# Подключитесь к Codespace
gh codespace code
```

### После запуска Codespace

```bash
# 1. Dependencies уже должны быть установлены (см. .devcontainer/devcontainer.json)
# Если нет, выполните:
npm install

# 2. Создайте .env файл с вашим Bot Token
cat > .env <<EOF
TELEGRAM_BOT_TOKEN=8064217891:AAFTAkxc1Vf-ivYbbYmtokBBfNrFHM2NIeo
EOF

# 3. Протестируйте Telegram API
bash tests/manual/test-api-curl.sh

# Или Node.js версию:
node tests/manual/test-api.mjs

# 4. Соберите проект
npm run build

# 5. Запустите dev режим
npm run dev
```

### Ожидаемый результат API теста

```bash
🤖 Testing Telegram Bot API...

Token: 8064217891...2NIeo

═══════════════════════════════════════════════

📝 Test 1: getMe (checking token validity)
✅ Token is valid!
   Bot name: YourBotName
   Username: @your_bot_username
   Bot ID: 1234567890

📝 Test 2: getCustomEmojiStickers
✅ Successfully fetched emoji info!
   File ID: CAACAgIAAxkBAAIBc...
   Type: custom_emoji
   Size: 512x512
   Animated: true
   Video: false
   File size: 15234 bytes

📝 Test 3: getFile
✅ Successfully got file info!
   File path: stickers/file_123.tgs
   File size: 15234 bytes
   Download URL: https://api.telegram.org/file/bot8064217891...

📝 Test 4: Download emoji file
✅ Successfully downloaded emoji file!
   Downloaded 15234 bytes
   Format: TGS (Lottie)

═══════════════════════════════════════════════

🎉 All tests passed successfully!

✨ Your Telegram Bot API is working correctly.
✨ You can now proceed with plugin development.
```

---

## 🌟 Альтернатива: GitPod

### Как запустить

1. Откройте в браузере:
   ```
   https://gitpod.io/#https://github.com/xaceom/Pepa/tree/claude/telegram-emoji-plugin-QHGMh
   ```

2. Авторизуйтесь через GitHub

3. Подождите инициализации

4. Готово!

### Бесплатный план GitPod
- 50 часов/месяц
- До 4 параллельных workspace

---

## ⚡ Быстрое тестирование: StackBlitz

Для быстрого тестирования API (без полной разработки):

1. Откройте:
   ```
   https://stackblitz.com/github/xaceom/Pepa/tree/claude/telegram-emoji-plugin-QHGMh
   ```

2. Создайте `.env` файл

3. Запустите:
   ```bash
   node tests/manual/test-api.mjs
   ```

**Ограничение:** StackBlitz работает не со всеми Node.js модулями

---

## 🏠 Локальная разработка

Если хотите работать локально на своем компьютере:

### Требования
- Node.js 18+ ([скачать](https://nodejs.org/))
- Git ([скачать](https://git-scm.com/))
- Obsidian ([скачать](https://obsidian.md/))

### Шаги

```bash
# 1. Клонируйте репозиторий
git clone https://github.com/xaceom/Pepa.git
cd Pepa

# 2. Переключитесь на ветку разработки
git checkout claude/telegram-emoji-plugin-QHGMh

# 3. Установите зависимости
npm install

# 4. Создайте .env файл
cat > .env <<EOF
TELEGRAM_BOT_TOKEN=8064217891:AAFTAkxc1Vf-ivYbbYmtokBBfNrFHM2NIeo
EOF

# 5. Протестируйте API
bash tests/manual/test-api-curl.sh

# 6. Соберите проект
npm run build

# 7. Скопируйте в Obsidian vault
# Замените /path/to/vault на ваш путь
mkdir -p "/path/to/vault/.obsidian/plugins/telegram-emoji"
cp main.js manifest.json "/path/to/vault/.obsidian/plugins/telegram-emoji/"

# 8. Перезапустите Obsidian и включите плагин в Settings
```

### Dev режим с hot reload

```bash
# Запустите в одном терминале
npm run dev

# При каждом изменении файлов, main.js будет автоматически пересобираться
# Перезагружайте плагин в Obsidian (Ctrl+R или Cmd+R)
```

---

## 🔑 Важно: Bot Token

### В облачных средах

⚠️ **НЕ коммитьте .env файл!**

Создавайте `.env` вручную каждый раз:

```bash
echo "TELEGRAM_BOT_TOKEN=8064217891:AAFTAkxc1Vf-ivYbbYmtokBBfNrFHM2NIeo" > .env
```

Или используйте Environment Variables в настройках Codespace/GitPod:

**GitHub Codespaces:**
1. Settings → Codespaces → Secrets
2. New secret: `TELEGRAM_BOT_TOKEN`
3. Value: `8064217891:AAFTAkxc1Vf-ivYbbYmtokBBfNrFHM2NIeo`

**GitPod:**
1. User Settings → Variables
2. New Variable: `TELEGRAM_BOT_TOKEN`
3. Value: `8064217891:AAFTAkxc1Vf-ivYbbYmtokBBfNrFHM2NIeo`

---

## 📊 Сравнение вариантов

| Вариант | Интернет | NPM | API тесты | Obsidian | Бесплатно | Время setup |
|---------|----------|-----|-----------|----------|-----------|-------------|
| **GitHub Codespaces** | ✅ | ✅ | ✅ | ❌* | 60h/мес | 2 мин |
| **GitPod** | ✅ | ✅ | ✅ | ❌* | 50h/мес | 2 мин |
| **StackBlitz** | ✅ | ⚠️ | ⚠️ | ❌ | ✅ | 30 сек |
| **Локально** | ✅ | ✅ | ✅ | ✅ | ✅ | 5 мин |

*_Для тестирования в Obsidian нужно копировать собранный плагин в локальный vault_

---

## 🎯 Рекомендуемый workflow

### Для разработки API части (ФАЗА 2-3):
**Используйте GitHub Codespaces** ✅
- Полный доступ к интернету
- Можно тестировать Telegram API
- Можно устанавливать dependencies
- Удобная интеграция с Git

### Для разработки UI и тестирования в Obsidian (ФАЗА 4-5):
**Используйте локальную разработку** ✅
- Можно запускать Obsidian
- Hot reload с `npm run dev`
- Полный контроль над окружением

### Гибридный подход (рекомендуется):
1. **API разработка** → GitHub Codespaces
2. **Build** → `npm run build` в Codespaces
3. **Скачать** → `main.js` и `manifest.json`
4. **Тестирование** → Локальный Obsidian

---

## 🚀 Быстрый старт (1 минута)

```bash
# 1. Откройте в браузере:
https://codespaces.new/xaceom/Pepa

# 2. Выберите ветку: claude/telegram-emoji-plugin-QHGMh

# 3. В терминале Codespace:
echo "TELEGRAM_BOT_TOKEN=8064217891:AAFTAkxc1Vf-ivYbbYmtokBBfNrFHM2NIeo" > .env
bash tests/manual/test-api-curl.sh

# 4. Если тест прошёл - начинайте ФАЗУ 2!
```

---

## 📞 Помощь

**Проблемы с Codespaces?**
- [GitHub Codespaces Docs](https://docs.github.com/en/codespaces)
- [Troubleshooting](https://docs.github.com/en/codespaces/troubleshooting)

**Проблемы с GitPod?**
- [GitPod Docs](https://www.gitpod.io/docs)

**Проблемы с API тестами?**
- Проверьте Bot Token
- Проверьте интернет соединение
- См. [Telegram Bot API Docs](https://core.telegram.org/bots/api)

---

**Готовы начать?** 🚀

Выберите один из вариантов выше и продолжайте разработку с доступом к интернету!

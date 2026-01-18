# ⚡ Быстрый старт в облаке (1 минута)

## 🎯 Самый быстрый способ

### 1️⃣ Откройте GitHub Codespaces

Просто кликните на эту ссылку:

```
https://codespaces.new/xaceom/Pepa
```

### 2️⃣ Выберите ветку

В появившемся окне выберите:
```
Branch: claude/telegram-emoji-plugin-QHGMh
```

### 3️⃣ Дождитесь инициализации

Подождите ~2 минуты, пока среда настраивается.

Dependencies (`npm install`) установятся автоматически!

### 4️⃣ Настройте Bot Token

В терминале Codespace выполните:

```bash
echo "TELEGRAM_BOT_TOKEN=8064217891:AAFTAkxc1Vf-ivYbbYmtokBBfNrFHM2NIeo" > .env
```

### 5️⃣ Протестируйте API

```bash
bash tests/manual/test-api-curl.sh
```

Если увидите ✅ - все работает!

### 6️⃣ Начинайте разработку!

```bash
# Собрать проект
npm run build

# Запустить dev режим
npm run dev

# Начать ФАЗУ 2
# Создайте файл src/api/TelegramBotAPI.ts
```

---

## 🔗 Полезные ссылки

**Документация:**
- [CLOUD_SETUP.md](CLOUD_SETUP.md) - Полная инструкция по всем вариантам
- [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) - План разработки ФАЗЫ 2
- [NEXT_STEPS.md](NEXT_STEPS.md) - Что делать дальше

**Облачные среды:**
- GitHub Codespaces: https://codespaces.new/xaceom/Pepa
- GitPod: https://gitpod.io/#https://github.com/xaceom/Pepa

**API документация:**
- Telegram Bot API: https://core.telegram.org/bots/api
- Custom Emoji: https://core.telegram.org/bots/api#getcustomemojistickers

---

## ✅ Чеклист

Перед началом разработки убедитесь:

- [ ] Codespace запущен
- [ ] Dependencies установлены (`npm install` выполнен)
- [ ] Bot Token в .env файле
- [ ] API тест прошёл успешно
- [ ] `npm run build` работает
- [ ] Прочитан DEVELOPMENT_PLAN.md

---

## 🎉 Готово!

Теперь у вас есть:
- ✅ Полный доступ к интернету
- ✅ Рабочая Node.js среда
- ✅ Все dependencies установлены
- ✅ Telegram API работает
- ✅ VS Code в браузере

**Начинайте ФАЗУ 2: Core API Layer!**

См. DEVELOPMENT_PLAN.md стр. 15-25 для деталей.

---

_Время setup: ~3 минуты_
_Бесплатно: 60 часов/месяц_
_Всё что нужно: Браузер + GitHub аккаунт_

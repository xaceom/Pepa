#!/bin/bash

# Ручной тест Telegram Bot API с использованием curl
# Запуск: bash tests/manual/test-api-curl.sh

# Загрузить токен из .env
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
  echo "❌ TELEGRAM_BOT_TOKEN not found in .env file"
  exit 1
fi

API_URL="https://api.telegram.org"

echo "🤖 Testing Telegram Bot API..."
echo ""
echo "Token: ${TELEGRAM_BOT_TOKEN:0:10}...${TELEGRAM_BOT_TOKEN: -5}"
echo ""
echo "═══════════════════════════════════════════════"
echo ""

# Тест 1: getMe
echo "📝 Test 1: getMe (checking token validity)"
response=$(curl -s "${API_URL}/bot${TELEGRAM_BOT_TOKEN}/getMe")

if echo "$response" | grep -q '"ok":true'; then
  echo "✅ Token is valid!"
  bot_name=$(echo "$response" | grep -o '"first_name":"[^"]*"' | cut -d'"' -f4)
  username=$(echo "$response" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
  echo "   Bot name: $bot_name"
  echo "   Username: @$username"
else
  echo "❌ Token is invalid"
  echo "$response"
  exit 1
fi

echo ""

# Тест 2: getCustomEmojiStickers
echo "📝 Test 2: getCustomEmojiStickers"
test_emoji_id="5368324170671202286"

response=$(curl -s -X POST "${API_URL}/bot${TELEGRAM_BOT_TOKEN}/getCustomEmojiStickers" \
  -H "Content-Type: application/json" \
  -d "{\"custom_emoji_ids\":[\"$test_emoji_id\"]}")

if echo "$response" | grep -q '"ok":true'; then
  echo "✅ Successfully fetched emoji info!"
  file_id=$(echo "$response" | grep -o '"file_id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "   File ID: $file_id"
else
  echo "❌ Failed to fetch emoji"
  echo "$response"
fi

echo ""
echo "═══════════════════════════════════════════════"
echo ""
echo "🎉 Tests completed!"
echo ""
echo "✨ To test manually, you can use:"
echo "   curl https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe"
echo ""

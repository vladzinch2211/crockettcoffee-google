# Google Customer Reviews - Быстрый старт 🚀

## Что это делает?

Показывает Google Customer Reviews виджет на странице "Спасибо за покупку" в Shopify магазине.

## Быстрая установка (5 минут)

### 1. Измени Google Merchant ID

```bash
# Открой файл и замени дефолтный ID на свой
code extensions/google-reviews-pixel/src/index.js
# Измени строку 13:
const merchantId = settings.merchant_id || "ВАШ_GOOGLE_MERCHANT_ID";
```

### 2. Деплой

```bash
npm run deploy
```

Выбери:
- ✅ `thank-you-google-reviews` extension
- ✅ `google-reviews-pixel` extension
- ✅ Deploy app configuration

### 3. Активируй в Shopify Admin

**Checkout Customization:**
1. Settings → Checkout → **Customize**
2. Перейди на **Thank You Page**
3. Добавь блок: **thank-you-google-reviews**
4. Сохрани

**Customer Events (Web Pixel):**
1. Settings → Customer events
2. Найди **google-reviews-pixel**
3. Включи (toggle on)
4. Настрой (опционально):
   - Merchant ID: твой Google ID
   - Delivery Days: 7
   - Widget Style: CENTER_DIALOG

### 4. Тестируй

1. Создай тестовый заказ
2. Пройди checkout
3. На Thank You Page должен появиться:
   - 📋 Информационный баннер
   - 💬 Google Reviews popup виджет

## Проверка работы

### ✅ Что должно быть видно:

**На Thank You Page:**
- Баннер с текстом "Помогите нам стать лучше!"
- Google виджет с предложением оставить отзыв

**В DevTools (F12) Console:**
```
"Google Customer Reviews Pixel loaded"
```

**В DevTools Network:**
- Загрузка `platform.js` от Google
- Запросы к Google Survey API

## Основные файлы

```
extensions/
├── thank-you-google-reviews/     👈 UI баннер на Thank You Page
│   └── src/ThankYou.jsx
│
├── google-reviews-pixel/          👈 Загрузка Google скрипта
│   └── src/index.js
│
shopify.app.toml                   👈 Конфигурация (App Proxy, scopes)
```

## Troubleshooting

### Виджет не появляется?

```bash
# 1. Проверь что extensions активированы
Settings → Checkout → Customize
Settings → Customer events

# 2. Проверь Console в браузере (F12)
# Должно быть: "Google Customer Reviews Pixel loaded"

# 3. Проверь Merchant ID
# В extensions/google-reviews-pixel/src/index.js
```

### Нужна помощь?

📖 Полная документация: `GOOGLE_REVIEWS_SETUP.md`

## Development режим

```bash
# Запуск в dev режиме
npm run dev

# Открой в браузере URL который покажет CLI
# Обычно: https://xxxxxxxx.cloudflare.dev
```

## Деплой на продакшен

```bash
npm run deploy
```

---

**Вопросы?** Читай полную документацию в `GOOGLE_REVIEWS_SETUP.md`

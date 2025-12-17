# Google Customer Reviews - Инструкция по настройке

## Что было реализовано

Интеграция Google Customer Reviews для Shopify магазина через:

1. **Thank You Page Extension** (`thank-you-google-reviews`) - показывает информационный баннер на странице благодарности
2. **Web Pixel Extension** (`google-reviews-pixel`) - автоматически загружает и инициализирует Google Customer Reviews виджет
3. **App Proxy** - настроен endpoint для будущих запросов (опционально)

## Структура проекта

```
extensions/
├── thank-you-google-reviews/     # UI Extension для Thank You Page
│   ├── src/ThankYou.jsx          # React компонент с информационным баннером
│   ├── shopify.extension.toml    # Конфигурация
│   └── package.json
│
├── google-reviews-pixel/          # Web Pixel для загрузки Google скрипта
│   ├── src/index.js              # JavaScript код для загрузки Google виджета
│   └── shopify.extension.toml    # Конфигурация с настройками
│
app/routes/
└── proxy.$.jsx                    # Backend endpoint для App Proxy (опционально)
```

## Как это работает

### 1. Thank You Page Extension
- Показывается на странице благодарности после покупки
- Отображает дружелюбный баннер о том, что покупатель получит приглашение оставить отзыв
- Использует нативные компоненты Shopify UI Extensions

### 2. Web Pixel
- Автоматически загружается на Thank You Page
- Слушает событие `checkout_completed`
- Динамически загружает Google Platform API (`https://apis.google.com/js/platform.js`)
- Инициализирует Google Customer Reviews виджет с данными заказа:
  - Order ID
  - Email покупателя
  - Страна доставки
  - Расчетная дата доставки
  - Список товаров с GTIN (barcode)

### 3. Настройки виджета

В `shopify.extension.toml` для Web Pixel настроены параметры:

```toml
[[settings.fields]]
key = "merchant_id"
type = "single_line_text_field"
name = "Google Merchant ID"
description = "Your Google Merchant Center ID (e.g., 5338616603)"

[[settings.fields]]
key = "delivery_days"
type = "number_integer"
name = "Estimated Delivery Days"
description = "Number of days to add to order date for estimated delivery"
default = 7

[[settings.fields]]
key = "opt_in_style"
type = "single_line_text_field"
name = "Widget Style"
description = "CENTER_DIALOG, BOTTOM_RIGHT_DIALOG, or BOTTOM_LEFT_DIALOG"
default = "CENTER_DIALOG"
```

## Деплой и установка

### Шаг 1: Обновить Google Merchant ID

Открой `extensions/google-reviews-pixel/src/index.js` и измени дефолтное значение:

```javascript
const merchantId = settings.merchant_id || "5338616603"; // Твой Google Merchant ID
```

### Шаг 2: Деплой приложения

```bash
cd crockettcoffee-google
npm run deploy
```

Выбери:
- Extensions для деплоя: **оба** (thank-you-google-reviews и google-reviews-pixel)
- App configuration: **yes**

### Шаг 3: Активация в магазине

1. Зайди в **Shopify Admin → Settings → Checkout**
2. Найди раздел **Order status page** или **Checkout customization**
3. Нажми **Customize**
4. В редакторе checkout:
   - Найди секцию **Thank You Page**
   - Добавь блок **thank-you-google-reviews**
   - Настрой позицию (обычно в конце страницы)
5. **Сохрани изменения**

### Шаг 4: Настройка Web Pixel

1. Зайди в **Shopify Admin → Settings → Customer events**
2. Найди **google-reviews-pixel**
3. Нажми **Edit settings**
4. Введи:
   - **Google Merchant ID**: твой ID из Google Merchant Center
   - **Estimated Delivery Days**: количество дней (например, 7)
   - **Widget Style**: CENTER_DIALOG, BOTTOM_RIGHT_DIALOG или BOTTOM_LEFT_DIALOG
5. **Сохрани настройки**

## Тестирование

### 1. Тестовый заказ

1. Создай тестовый заказ в магазине (используй Shopify Payments test mode)
2. Пройди весь процесс checkout
3. После оплаты попадешь на Thank You Page
4. Проверь:
   - ✅ Отображается информационный баннер о Google Reviews
   - ✅ Появляется popup виджет Google Customer Reviews

### 2. Проверка в DevTools

1. Открой **Developer Tools** (F12)
2. Во вкладке **Console** проверь:
   - `"Google Customer Reviews Pixel loaded"` - Web Pixel загрузился
   - Нет ошибок загрузки скрипта Google Platform API
3. Во вкладке **Network**:
   - Проверь загрузку `platform.js` от Google
   - Проверь запросы к Google Survey Opt-in API

### 3. Проверка App Proxy (опционально)

```bash
# Тестовый запрос
curl "https://your-shop.myshopify.com/apps/google-reviews/test"

# Ожидаемый ответ:
{
  "success": true,
  "message": "Google Reviews App Proxy is working!",
  "timestamp": "2025-12-17T..."
}
```

## Настройка в продакшене

### 1. Убедись, что у тебя есть Google Merchant Center аккаунт
- Зарегистрируйся на https://merchants.google.com
- Получи свой Merchant ID
- Настрой Customer Reviews program

### 2. Обнови Merchant ID в коде или через UI
- Через настройки Web Pixel в Shopify Admin (рекомендуется)
- Или в коде `extensions/google-reviews-pixel/src/index.js`

### 3. Настрой GTIN/Barcode для товаров
- В Shopify Admin для каждого товара добавь **Barcode**
- Google использует GTIN для идентификации товаров
- Это поможет показывать отзывы на конкретные товары

## Полезные ссылки

- [Google Customer Reviews Documentation](https://support.google.com/merchants/answer/7124319)
- [Shopify Checkout UI Extensions](https://shopify.dev/docs/api/checkout-ui-extensions)
- [Shopify Web Pixels](https://shopify.dev/docs/apps/marketing/pixels)
- [Google Merchant Center](https://merchants.google.com)

## Troubleshooting

### Виджет не появляется

1. **Проверь Web Pixel активирован**
   - Settings → Customer events → google-reviews-pixel должен быть включен

2. **Проверь Console в DevTools**
   - Должно быть "Google Customer Reviews Pixel loaded"
   - Не должно быть ошибок от Google API

3. **Проверь Merchant ID**
   - Убедись что ID правильный и аккаунт активен

### Виджет показывается, но не собирает отзывы

1. **Проверь настройки Google Merchant Center**
   - Customer Reviews program должен быть активирован
   - Магазин должен быть верифицирован

2. **Проверь GTIN/Barcode**
   - Товары должны иметь корректные barcode
   - Google может требовать GTIN для некоторых категорий

### Баннер не показывается на Thank You Page

1. **Проверь что Extension активирован**
   - Settings → Checkout → Customize
   - Блок thank-you-google-reviews должен быть добавлен

2. **Проверь позиционирование**
   - Попробуй переместить блок в другое место
   - Убедись что нет конфликтов с другими extensions

## Следующие шаги (опционально)

### 1. Админ-панель для настроек
Создать UI в Shopify App для управления:
- Google Merchant ID
- Delivery days
- Widget style
- Включение/выключение виджета

### 2. Analytics
Добавить отслеживание:
- Сколько виджетов было показано
- Сколько отзывов было собрано
- Конверсию opt-in

### 3. A/B тестирование
- Разные стили виджета
- Разные тексты в информационном баннере
- Разное позиционирование на странице

---

## Контакты и поддержка

Если возникли вопросы:
1. Проверь логи в Developer Tools
2. Проверь настройки в Google Merchant Center
3. Проверь что все extensions активированы в Shopify Admin

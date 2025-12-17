// Google Customer Reviews Web Pixel
// Загружается на Thank You Page и показывает виджет для сбора отзывов

// Инициализация Web Pixel
analytics.subscribe("checkout_completed", async (event) => {
  try {
    const checkout = event.data.checkout;

    // Настройки (хардкод, позже можно добавить UI для изменения)
    const merchantId = "5338616603"; // Твой Google Merchant ID
    const deliveryDays = 7; // Количество дней до доставки
    const optInStyle = "CENTER_DIALOG"; // Стиль виджета

    // Расчет estimated delivery date
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
    const estimatedDeliveryDate = deliveryDate.toISOString().split('T')[0];

    // Получаем товары с GTIN
    const products = [];
    if (checkout.lineItems && Array.isArray(checkout.lineItems)) {
      checkout.lineItems.forEach(item => {
        if (item.variant?.barcode || item.variant?.sku) {
          products.push({
            gtin: item.variant?.barcode || item.variant?.sku
          });
        }
      });
    }

    // Используем browser API для доступа к window
    const orderId = checkout.order?.id || checkout.token;
    const email = checkout.email;
    const deliveryCountry = checkout.shippingAddress?.countryCode || "US";

    // Загружаем Google скрипт через browser API
    browser.execute(() => {
      // Этот код выполняется в браузере
      const merchantId = "{{merchantId}}";
      const orderId = "{{orderId}}";
      const email = "{{email}}";
      const deliveryCountry = "{{deliveryCountry}}";
      const estimatedDeliveryDate = "{{estimatedDeliveryDate}}";
      const productsJson = '{{productsJson}}';
      const optInStyle = "{{optInStyle}}";

      const products = JSON.parse(productsJson);

      // Загружаем Google Platform script
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/platform.js?onload=renderGoogleSurvey';
      script.async = true;
      script.defer = true;

      // Callback после загрузки скрипта
      window.renderGoogleSurvey = function() {
        if (window.gapi && window.gapi.load) {
          window.gapi.load('surveyoptin', function() {
            window.gapi.surveyoptin.render({
              merchant_id: merchantId,
              order_id: orderId,
              email: email,
              delivery_country: deliveryCountry,
              estimated_delivery_date: estimatedDeliveryDate,
              products: products,
              opt_in_style: optInStyle
            });
          });
        }
      };

      // Добавляем скрипт на страницу
      document.head.appendChild(script);
    }, {
      merchantId: merchantId,
      orderId: orderId,
      email: email,
      deliveryCountry: deliveryCountry,
      estimatedDeliveryDate: estimatedDeliveryDate,
      productsJson: JSON.stringify(products),
      optInStyle: optInStyle
    });

  } catch (error) {
    console.error("Google Reviews Pixel Error:", error);
  }
});

// Логирование для отладки
console.log("Google Customer Reviews Pixel loaded");

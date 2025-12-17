// Страница для отображения Google Customer Reviews виджета
// Открывается когда пользователь нажимает кнопку "Оставить отзыв"

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  // Получаем параметры из URL
  const orderId = url.searchParams.get("order_id") || "";
  const email = url.searchParams.get("email") || "";
  const deliveryCountry = url.searchParams.get("delivery_country") || "US";
  const estimatedDeliveryDate = url.searchParams.get("estimated_delivery_date") || "";

  // HTML страница с Google виджетом
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Leave a Review</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      font-size: 24px;
      margin-bottom: 10px;
    }
    p {
      color: #666;
      line-height: 1.6;
    }
    #google-reviews-container {
      margin-top: 20px;
      min-height: 200px;
    }
    .loading {
      text-align: center;
      color: #999;
      padding: 20px;
    }
    .debug-info {
      margin-top: 20px;
      padding: 15px;
      background: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 12px;
      color: #666;
    }
    .debug-info h3 {
      margin-top: 0;
      font-size: 14px;
      color: #333;
    }
    .debug-info pre {
      background: #fff;
      padding: 10px;
      border-radius: 3px;
      overflow-x: auto;
    }
    .error {
      color: #d00;
      padding: 10px;
      background: #fee;
      border: 1px solid #d00;
      border-radius: 4px;
      margin-top: 10px;
    }
    .success {
      color: #0a0;
      padding: 10px;
      background: #efe;
      border: 1px solid #0a0;
      border-radius: 4px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Thank you for your purchase!</h1>
    <p>
      Your opinion matters to us. Please take a moment to leave a review about your purchase.
    </p>

    <div id="google-reviews-container">
      <div class="loading">Загрузка виджета Google...</div>
    </div>

    <div class="debug-info">
      <h3>Debug Information:</h3>
      <div id="debug-content">Initializing...</div>
    </div>
  </div>

  <!-- Google Platform API -->
  <script src="https://apis.google.com/js/platform.js?onload=renderOptIn" async defer></script>

  <!-- Initialize Google Customer Reviews -->
  <script>
    function showDebug(message, isError) {
      const debugContent = document.getElementById('debug-content');
      const timestamp = new Date().toLocaleTimeString();
      const className = isError ? 'error' : 'success';
      debugContent.innerHTML += '<div class="' + className + '">[' + timestamp + '] ' + message + '</div>';
      console.log(message);
    }

    window.onerror = function(msg, url, lineNo, columnNo, error) {
      showDebug('JavaScript Error: ' + msg, true);
      return false;
    };

    window.renderOptIn = function() {
      showDebug('renderOptIn function called');

      // Get parameters from URL
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('order_id');
      const email = urlParams.get('email');
      const deliveryCountry = urlParams.get('delivery_country') || 'US';
      const estimatedDeliveryDate = urlParams.get('estimated_delivery_date');

      // Show parameters
      const params = {
        orderId: orderId,
        email: email,
        deliveryCountry: deliveryCountry,
        estimatedDeliveryDate: estimatedDeliveryDate
      };
      showDebug('Parameters: ' + JSON.stringify(params, null, 2));

      if (!orderId || !email) {
        showDebug('ERROR: Missing required parameters (orderId or email)', true);
        document.getElementById('google-reviews-container').innerHTML =
          '<div class="error">Cannot load widget: Missing order ID or email</div>';
        return;
      }

      let products = [];
      try {
        const productsParam = urlParams.get('products');
        if (productsParam) {
          const productsList = JSON.parse(productsParam);
          products = productsList.map(gtin => ({ gtin: gtin }));
          showDebug('Products: ' + products.length + ' items');
        }
      } catch (e) {
        showDebug('Error parsing products: ' + e.message, true);
      }

      showDebug('Checking window.gapi...');
      if (!window.gapi) {
        showDebug('ERROR: Google API not loaded', true);
        return;
      }

      showDebug('Loading surveyoptin...');

      // Load Google Survey Opt-in
      try {
        window.gapi.load('surveyoptin', function() {
          showDebug('surveyoptin loaded, rendering widget...');

          const config = {
            "merchant_id": 5338616603,
            "order_id": orderId,
            "email": email,
            "delivery_country": deliveryCountry,
            "estimated_delivery_date": estimatedDeliveryDate,
            "products": products,
            "opt_in_style": "CENTER_DIALOG"
          };

          showDebug('Widget config: ' + JSON.stringify(config, null, 2));

          try {
            window.gapi.surveyoptin.render(config);

            // Update loading message
            document.getElementById('google-reviews-container').innerHTML =
              '<div class="success">✓ Google Customer Reviews widget has been initialized. ' +
              'You should see a dialog or survey form appear on the page.</div>';

            showDebug('✓ Widget render() called successfully');
          } catch (renderError) {
            showDebug('ERROR rendering widget: ' + renderError.message, true);
            document.getElementById('google-reviews-container').innerHTML =
              '<div class="error">Error rendering widget: ' + renderError.message + '</div>';
          }
        });
      } catch (loadError) {
        showDebug('ERROR loading surveyoptin: ' + loadError.message, true);
      }
    }

    // Timeout check
    setTimeout(function() {
      if (document.getElementById('google-reviews-container').querySelector('.loading')) {
        showDebug('WARNING: Widget still loading after 10 seconds', true);
      }
    }, 10000);
  </script>
</body>
</html>
  `;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
};

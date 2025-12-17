import {
  reactExtension,
  BlockStack,
  Text,
  Banner,
  Button,
  useApi,
  useEmail,
  useSubscription,
} from "@shopify/ui-extensions-react/checkout";
import { useMemo } from "react";

// Thank You Page Extension - Google Customer Reviews
export default reactExtension("purchase.thank-you.block.render", () => (
  <GoogleReviewsWidget />
));

function GoogleReviewsWidget() {
  const { shop, shippingAddress, lines, orderConfirmation, buyerIdentity } = useApi();

  // Use useSubscription to read reactive values
  const orderData = useSubscription(orderConfirmation);
  const emailData = useSubscription(buyerIdentity?.email);

  console.log("=== FULL API DEBUG ===");
  console.log("orderData from subscription:", orderData);
  console.log("emailData from subscription:", emailData);
  console.log("shippingAddress:", shippingAddress);
  console.log("lines:", lines);

  // Generate review URL
  const reviewUrl = useMemo(() => {
    try {
      console.log("=== useMemo EXECUTING ===");
      console.log("orderData in useMemo:", orderData);
      console.log("emailData in useMemo:", emailData);

      // Extract order ID from orderData subscription
      let orderId = "";
      if (orderData) {
        // orderData has keys: order, number, isFirstOrder
        // Use 'number' for the order confirmation number
        orderId = orderData.number || orderData.order?.id?.split("/").pop() || "";
        console.log("Extracted orderId:", orderId);
      } else {
        console.log("orderData is falsy");
      }

      // Email from emailData subscription
      const userEmail = emailData || "";
      console.log("userEmail:", userEmail);

      // Extract delivery country from shippingAddress
      let deliveryCountry = "US";
      if (shippingAddress?.countryCode) {
        deliveryCountry = shippingAddress.countryCode;
      }

      console.log("Final extracted data:", {
        orderId: orderId,
        orderIdType: typeof orderId,
        orderIdLength: orderId.length,
        email: userEmail,
        emailType: typeof userEmail,
        emailLength: userEmail.length,
        deliveryCountry
      });

      // If we don't have required data, return null
      if (!orderId || !userEmail) {
        console.error("FAILED: Missing required data:", {
          orderId,
          orderIdCheck: !orderId,
          email: userEmail,
          emailCheck: !userEmail
        });
        return null;
      }

      console.log("PASSED: All required data present");

      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 7);
      const estimatedDeliveryDate = deliveryDate.toISOString().split("T")[0];

      const products = [];
      // lines might be a reactive object, need to check if it's actually an array
      if (lines && Array.isArray(lines)) {
        lines.forEach((item) => {
          if (item.merchandise?.barcode || item.merchandise?.sku) {
            products.push(item.merchandise?.barcode || item.merchandise?.sku);
          }
        });
      } else {
        console.log("lines is not an array:", lines);
      }

      // Build URL
      return `https://${shop.myshopifyDomain}/apps/google-reviews/widget?order_id=${orderId}&email=${encodeURIComponent(userEmail)}&delivery_country=${deliveryCountry}&estimated_delivery_date=${estimatedDeliveryDate}&products=${encodeURIComponent(JSON.stringify(products))}`;
    } catch (error) {
      console.error("Error creating review URL:", error);
      return null;
    }
  }, [shop, orderData, emailData, shippingAddress, lines]);

  // Extract actual values for debugging
  const orderIdRaw = orderData?.number || orderData?.order?.id?.split("/").pop() || "UNDEFINED";
  const emailRaw = emailData || "UNDEFINED";

  // Show all available API data for debugging
  const debugInfo = {
    hasOrderData: !!orderData,
    hasEmailData: !!emailData,
    hasShippingAddress: !!shippingAddress,
    hasLines: !!lines,
    orderDataKeys: orderData ? Object.keys(orderData).join(", ") : "N/A",
    orderIdValue: String(orderIdRaw),
    emailValue: String(emailRaw),
    emailType: typeof emailRaw
  };

  // Always render the block
  return (
    <BlockStack spacing="base" border="base" padding="base" cornerRadius="base">
      <Banner status="info">
        <BlockStack spacing="tight">
          <Text size="medium" emphasis="bold">
            How did you like the checkout experience?
          </Text>
          <Text size="small">Each review helps to improve our store.</Text>
        </BlockStack>
      </Banner>

      <Button
        kind="primary"
        to={reviewUrl || "#"}
        target="_blank"
        disabled={!reviewUrl}
      >
        Leave a Review
      </Button>

      <BlockStack spacing="tight">
        <Text size="small" emphasis="bold">Debug Info:</Text>
        <Text size="small">Has orderData: {debugInfo.hasOrderData ? "Yes" : "No"}</Text>
        <Text size="small">Has emailData: {debugInfo.hasEmailData ? "Yes" : "No"}</Text>
        <Text size="small">Has shippingAddress: {debugInfo.hasShippingAddress ? "Yes" : "No"}</Text>
        <Text size="small">Has lines: {debugInfo.hasLines ? "Yes" : "No"}</Text>
        {orderData && <Text size="small">orderData keys: {debugInfo.orderDataKeys}</Text>}
        <Text size="small">orderId value: {debugInfo.orderIdValue}</Text>
        <Text size="small">email value: {debugInfo.emailValue}</Text>
        <Text size="small">email type: {debugInfo.emailType}</Text>
        <Text size="small">reviewUrl: {reviewUrl || "NULL"}</Text>
      </BlockStack>
    </BlockStack>
  );
}

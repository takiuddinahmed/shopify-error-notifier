// app/routes/webhooks.tsx
import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("=== WEBHOOK ROUTE HIT ===");
  console.log("Request URL:", request.url);
  console.log("Request method:", request.method);

  try {
    const { payload, topic, shop, session, admin } =
      await authenticate.webhook(request);
    console.log("Webhook authenticated successfully");
    console.log("Topic:", topic);
    console.log("Shop:", shop);
    console.log("Payload:", payload);
    console.log("Session:", session);
    console.log("Admin:", admin);
    switch (topic) {
      case "PRODUCTS_CREATE":
        console.log("Product created:", payload);
        break;
      case "PRODUCTS_UPDATE":
        console.log("Product updated:", payload);
        break;
      case "ORDERS_PAID":
        console.log("Order paid:", payload);
        break;
      case "CUSTOMERS_CREATE":
        console.log("Customer created:", payload);
        break;
    }
  } catch (error) {
    console.error("Webhook authentication error:", error);
  }

  return new Response();
};

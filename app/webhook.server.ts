// app/webhooks.server.ts
import { DeliveryMethod } from "@shopify/shopify-api";
import { authenticate } from "./shopify.server";

export async function registerWebhooks(session) {
  const { api } = await authenticate.admin(session);

  // Get your app URL from environment variables
  const appUrl = process.env.APP_URL || process.env.SHOPIFY_APP_URL;

  if (!appUrl) {
    console.error(
      "Missing APP_URL environment variable for webhook registration",
    );
    return;
  }

  try {
    // Register for product creation events
    await api.webhooks.register({
      path: "/webhooks",
      topic: "PRODUCTS_CREATE",
      deliveryMethod: DeliveryMethod.Http,
      webhookSubscription: {
        callbackUrl: `${appUrl}/webhooks`,
        format: "JSON",
      },
    });

    // Register for product update events
    await api.webhooks.register({
      path: "/webhooks",
      topic: "PRODUCTS_UPDATE",
      deliveryMethod: DeliveryMethod.Http,
      webhookSubscription: {
        callbackUrl: `${appUrl}/webhooks`,
        format: "JSON",
      },
    });

    console.log("Webhooks registered successfully");
  } catch (error) {
    console.error("Error registering webhooks:", error);
  }
}

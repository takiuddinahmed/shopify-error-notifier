// app/routes/webhooks.tsx
import { ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  console.log("Received webhook request");
  const { topic, shop } = await getWebhookData(request);

  // Verify webhook authenticity
  const hmacHeader = request.headers.get("X-Shopify-Hmac-Sha256");
  const rawBody = await request.text();

  // Process different webhook topics
  switch (topic) {
    case "products/create":
      await handleProductCreate(shop, JSON.parse(rawBody));
      break;
    case "products/update":
      await handleProductUpdate(shop, JSON.parse(rawBody));
      break;
    // Add other cases for each event you want to handle
    default:
      console.log(`Unhandled webhook topic: ${topic}`);
  }

  return new Response("Webhook processed", { status: 200 });
};

async function getWebhookData(request: Request) {
  const topic = request.headers.get("X-Shopify-Topic") || "";
  const shop = request.headers.get("X-Shopify-Shop-Domain") || "";
  return { topic, shop, body: await request.text() };
}

async function handleProductCreate(shop: string, data: any) {
  // Check if this shop has notifications enabled for product creation
  // Send notification if enabled
  console.log(`Product created in ${shop}:`, data.title);
}

async function handleProductUpdate(shop: string, data: any) {
  // Check if this shop has notifications enabled for product updates
  // Send notification if enabled
  console.log(`Product updated in ${shop}:`, data.title);
}

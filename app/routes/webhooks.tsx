// app/routes/webhooks.tsx
import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { AlertConfigurationService } from "app/services/base.server";
import { AlertType } from "@prisma/client";

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("=== WEBHOOK ROUTE HIT ===");
  const alertService = new AlertConfigurationService();

  try {
    const { payload, topic, shop, session, admin } =
      await authenticate.webhook(request);
    const shopId = session?.shop;

    switch (topic) {
      case "PRODUCTS_CREATE":
        if (shopId) {
          await alertService.handleSendAlert(
            shopId,
            AlertType.PRODUCTS_CREATE,
            "A new product has been created",
          );
        }
        console.log("Product created:");
        break;
      case "PRODUCTS_UPDATE":
        if (shopId) {
          await alertService.handleSendAlert(
            shopId,
            AlertType.PRODUCTS_UPDATE,
            "A product has been updated",
          );
        }
        console.log("Product updated:");
        break;
      case "PRODUCTS_DELETE":
        if (shopId) {
          await alertService.handleSendAlert(
            shopId,
            AlertType.PRODUCTS_DELETE,
            "A product has been deleted",
          );
        }
        console.log("Product deleted:");
        break;
      case "ORDERS_PAID":
        if (shopId) {
          await alertService.handleSendAlert(
            shopId,
            AlertType.CHECK_OUT,
            "An order has been paid",
          );
        }
        console.log("Order paid:");
        break;
      case "CUSTOMERS_CREATE":
        if (shopId) {
          await alertService.handleSendAlert(
            shopId,
            AlertType.SIGN_UP,
            "A new customer has been created",
          );
        }
        console.log("Customer created:");
        break;
      case "SYSTEM_ISSUE":
        if (shopId) {
          await alertService.handleSendAlert(
            shopId,
            AlertType.SYSTEM_ISSUE,
            "A system issue has been detected",
          );
        }
        console.log("System issue detected:");
        break;
    }
  } catch (error) {
    console.error("Webhook authentication error:", error);
  }

  return new Response();
};

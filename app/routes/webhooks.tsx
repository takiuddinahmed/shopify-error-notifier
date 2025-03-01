// app/routes/webhooks.tsx
import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { AlertConfigurationService } from "app/services/base.server";
import { AlertType } from "@prisma/client";
import {
  AlertTemplateService,
  type AlertTemplateData,
} from "app/services/alert-template.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("=== WEBHOOK ROUTE HIT ===");
  const alertService = new AlertConfigurationService();
  const templateService = new AlertTemplateService();

  try {
    const { payload, topic, shop, session, admin } =
      await authenticate.webhook(request);

    const shopId = session?.shop;
    if (!shopId) {
      console.log("No shop ID available in session");
      return new Response();
    }

    // Create template data with shop info
    const templateData: AlertTemplateData = {
      shopName: shop || "Your Shop",
    };

    switch (topic) {
      case "PRODUCTS_CREATE": {
        const product = payload;
        if (product?.title) {
          templateData.productTitle = product.title;
        }

        const message = templateService.getTemplateForAlertType(
          AlertType.PRODUCTS_CREATE,
          templateData,
        );

        await alertService.handleSendAlert(
          shopId,
          AlertType.PRODUCTS_CREATE,
          message,
        );
        console.log("Product created notification sent");
        break;
      }

      case "PRODUCTS_UPDATE": {
        const product = payload;
        if (product?.title) {
          templateData.productTitle = product.title;
        }

        const message = templateService.getTemplateForAlertType(
          AlertType.PRODUCTS_UPDATE,
          templateData,
        );

        await alertService.handleSendAlert(
          shopId,
          AlertType.PRODUCTS_UPDATE,
          message,
        );
        console.log("Product updated notification sent");
        break;
      }

      case "PRODUCTS_DELETE": {
        const message = templateService.getTemplateForAlertType(
          AlertType.PRODUCTS_DELETE,
          templateData,
        );

        await alertService.handleSendAlert(
          shopId,
          AlertType.PRODUCTS_DELETE,
          message,
        );
        console.log("Product deleted notification sent");
        break;
      }

      case "ORDERS_PAID": {
        const order = payload;
        if (order?.id) {
          templateData.orderId = order.id.toString();
        }

        const message = templateService.getTemplateForAlertType(
          AlertType.CHECK_OUT,
          templateData,
        );

        await alertService.handleSendAlert(
          shopId,
          AlertType.CHECK_OUT,
          message,
        );
        console.log("Order paid notification sent");
        break;
      }

      case "CUSTOMERS_CREATE": {
        const customer = payload;
        if (customer?.firstName) {
          templateData.customerName =
            customer.firstName +
            (customer.lastName ? ` ${customer.lastName}` : "");
        }

        const message = templateService.getTemplateForAlertType(
          AlertType.SIGN_UP,
          templateData,
        );

        await alertService.handleSendAlert(shopId, AlertType.SIGN_UP, message);
        console.log("Customer created notification sent");
        break;
      }

      case "SYSTEM_ISSUE": {
        const error = payload;
        if (error?.message) {
          templateData.errorMessage = error.message;
        }

        const message = templateService.getTemplateForAlertType(
          AlertType.SYSTEM_ISSUE,
          templateData,
        );

        await alertService.handleSendAlert(
          shopId,
          AlertType.SYSTEM_ISSUE,
          message,
        );
        console.log("System issue notification sent");
        break;
      }
    }
  } catch (error) {
    console.error("Webhook authentication error:", error);
  }

  return new Response();
};

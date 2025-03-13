// app/routes/webhooks.tsx
import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { AlertConfigurationService } from "app/services/base.server";
import { AlertType } from "@prisma/client";
import {
  AlertTemplateService,
  type AlertTemplateData,
} from "app/services/alert-template.server";
import logger from "app/utils/logger";
import { AlertTypes } from "app/types/allAlerts";

export const action = async ({ request }: ActionFunctionArgs) => {
  logger.debug("Webhook route triggered", { method: request.method });
  const alertService = new AlertConfigurationService();
  const templateService = new AlertTemplateService();

  try {
    const { payload, topic, shop, session } =
      await authenticate.webhook(request);
    const shopId = session?.shop;

    logger.info("Webhook received", {
      topic,
      shop: shop?.replace(".myshopify.com", ""),
      payloadType: typeof payload,
    });

    if (!shopId) {
      logger.warn("Webhook request missing shop ID", {
        shop,
        topic,
        hasSession: !!session,
      });
      return new Response(null, { status: 200 });
    }

    const templateData: AlertTemplateData = {
      shopName: shop?.replace(".myshopify.com", "") || "Your Shop",
    };

    switch (topic) {
      case "PRODUCTS_CREATE": {
        const product = payload;
        logger.debug("Processing PRODUCTS_CREATE webhook", {
          productId: product?.id,
          shopId,
        });

        if (product?.title) {
          templateData.productTitle = product.title;
        }
        if (product?.id && shop) {
          const storeName = shop.split(".")[0];
          templateData.productUrl = `https://admin.shopify.com/store/${storeName}/products/${product.id}`;
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
        logger.info("Product created alert processed", {
          shopId,
          productId: product?.id,
          messageLength: message.length,
        });
        break;
      }

      case "PRODUCTS_UPDATE": {
        const product = payload;
        logger.debug("Processing PRODUCTS_UPDATE webhook", {
          productId: product?.id,
          shopId,
        });

        if (product?.title) {
          templateData.productTitle = product.title;
        }
        if (product?.id && shop) {
          const storeName = shop.split(".")[0];
          templateData.productUrl = `https://admin.shopify.com/store/${storeName}/products/${product.id}`;
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
        logger.info("Product updated alert processed", {
          shopId,
          productId: product?.id,
          messageLength: message.length,
        });
        break;
      }

      case "PRODUCTS_DELETE": {
        logger.debug("Processing PRODUCTS_DELETE webhook", { shopId });
        const message = templateService.getTemplateForAlertType(
          AlertType.PRODUCTS_DELETE,
          templateData,
        );

        await alertService.handleSendAlert(
          shopId,
          AlertType.PRODUCTS_DELETE,
          message,
        );
        logger.info("Product deleted alert processed", {
          shopId,
          messageLength: message.length,
        });
        break;
      }

      case "ORDERS_PAID": {
        const order = payload;
        logger.debug("Processing ORDERS_PAID webhook", {
          orderId: order?.id,
          shopId,
        });

        if (order?.id) {
          templateData.orderId = order.id.toString();
        }

        const message = templateService.getTemplateForAlertType(
          AlertType.CHECK_OUT,
          templateData,
        );

        await alertService.handleSendAlert(
          shopId,
          AlertTypes.CHECK_OUT,
          message,
        );
        logger.info("Order paid alert processed", {
          shopId,
          orderId: order?.id,
          messageLength: message.length,
        });
        break;
      }

      case "CUSTOMERS_CREATE": {
        const customer = payload;
        logger.debug("Processing CUSTOMERS_CREATE webhook", {
          customerId: customer?.id,
          shopId,
        });

        if (customer?.firstName) {
          templateData.customerName =
            customer.firstName +
            (customer.lastName ? ` ${customer.lastName}` : "");
        }

        const message = templateService.getTemplateForAlertType(
          AlertType.SIGN_UP,
          templateData,
        );

        await alertService.handleSendAlert(shopId, AlertTypes.SIGN_UP, message);
        logger.info("Customer created alert processed", {
          shopId,
          customerId: customer?.id,
          messageLength: message.length,
        });
        break;
      }

      case "SYSTEM_ISSUE": {
        const error = payload;
        logger.warn("Processing SYSTEM_ISSUE webhook", {
          shopId,
          errorType: error?.type,
        });

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
        logger.error("System issue alert processed", {
          shopId,
          errorMessage: error?.message,
          messageLength: message.length,
        });
        break;
      }

      default:
        logger.warn("Unhandled webhook topic received", { topic, shopId });
    }
  } catch (error) {
    logger.error("Webhook processing failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
  }

  return new Response(null, { status: 200 });
};

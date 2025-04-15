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
      // Product related webhooks
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

      // Order related webhooks
      case "ORDERS_CREATE": {
        const order = payload;
        logger.debug("Processing ORDERS_CREATE webhook", {
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
          AlertType.CHECK_OUT,
          message,
        );
        logger.info("Order created alert processed", {
          shopId,
          orderId: order?.id,
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
          AlertType.CHECK_OUT,
          message,
        );
        logger.info("Order paid alert processed", {
          shopId,
          orderId: order?.id,
          messageLength: message.length,
        });
        break;
      }

      case "ORDERS_UPDATED": {
        const order = payload;
        logger.debug("Processing ORDERS_UPDATED webhook", {
          orderId: order?.id,
          shopId,
        });

        if (order?.id) {
          templateData.orderId = order.id.toString();
        }

        const message = templateService.getTemplateForAlertType(
          "ORDERS_UPDATED" as AlertType,
          templateData,
        );

        await alertService.handleSendAlert(
          shopId,
          "ORDERS_UPDATED" as AlertType,
          message,
        );
        logger.info("Order updated alert processed", {
          shopId,
          orderId: order?.id,
          messageLength: message.length,
        });
        break;
      }

      case "ORDERS_CANCELLED": {
        const order = payload;
        logger.debug("Processing ORDERS_CANCELLED webhook", {
          orderId: order?.id,
          shopId,
        });

        if (order?.id) {
          templateData.orderId = order.id.toString();
        }
        templateData.additionalInfo = "Order has been cancelled";

        const message = templateService.getTemplateForAlertType(
          "ORDERS_CANCELLED" as AlertType,
          templateData,
        );

        await alertService.handleSendAlert(
          shopId,
          "ORDERS_CANCELLED" as AlertType,
          message,
        );
        logger.info("Order cancelled alert processed", {
          shopId,
          orderId: order?.id,
          messageLength: message.length,
        });
        break;
      }

      case "ORDERS_FULFILLED": {
        const order = payload;
        logger.debug("Processing ORDERS_FULFILLED webhook", {
          orderId: order?.id,
          shopId,
        });

        if (order?.id) {
          templateData.orderId = order.id.toString();
        }
        templateData.additionalInfo = "Order has been fulfilled";

        const message = templateService.getTemplateForAlertType(
          "ORDERS_FULFILLED" as AlertType,
          templateData,
        );

        await alertService.handleSendAlert(
          shopId,
          "ORDERS_FULFILLED" as AlertType,
          message,
        );
        logger.info("Order fulfilled alert processed", {
          shopId,
          orderId: order?.id,
          messageLength: message.length,
        });
        break;
      }

      // Customer related webhooks
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

        await alertService.handleSendAlert(shopId, AlertType.SIGN_UP, message);
        logger.info("Customer created alert processed", {
          shopId,
          customerId: customer?.id,
          messageLength: message.length,
        });
        break;
      }

      case "CUSTOMERS_UPDATE": {
        const customer = payload;
        logger.debug("Processing CUSTOMERS_UPDATE webhook", {
          customerId: customer?.id,
          shopId,
        });

        if (customer?.firstName) {
          templateData.customerName =
            customer.firstName +
            (customer.lastName ? ` ${customer.lastName}` : "");
        }

        const message = templateService.getTemplateForAlertType(
          AlertType.SIGN_IN,
          templateData,
        );

        await alertService.handleSendAlert(shopId, AlertType.SIGN_IN, message);
        logger.info("Customer updated alert processed", {
          shopId,
          customerId: customer?.id,
          messageLength: message.length,
        });
        break;
      }

      case "CUSTOMERS_DELETE": {
        const customer = payload;
        logger.debug("Processing CUSTOMERS_DELETE webhook", {
          customerId: customer?.id,
          shopId,
        });

        if (customer?.firstName) {
          templateData.customerName =
            customer.firstName +
            (customer.lastName ? ` ${customer.lastName}` : "");
        }
        templateData.additionalInfo = "Customer has been deleted";

        const message = templateService.getTemplateForAlertType(
          "CUSTOMERS_DELETE" as AlertType,
          templateData,
        );

        await alertService.handleSendAlert(
          shopId,
          "CUSTOMERS_DELETE" as AlertType,
          message,
        );
        logger.info("Customer deleted alert processed", {
          shopId,
          customerId: customer?.id,
          messageLength: message.length,
        });
        break;
      }

      case "CUSTOMERS_REDACT": {
        const customer = payload;
        logger.debug("Processing CUSTOMERS_REDACT webhook", {
          customerId: customer?.id,
          shopId,
        });

        templateData.additionalInfo =
          "Customer data requested for redaction due to privacy concerns";

        const message = templateService.getTemplateForAlertType(
          "CUSTOMERS_REDACT" as AlertType,
          templateData,
        );

        await alertService.handleSendAlert(
          shopId,
          "CUSTOMERS_REDACT" as AlertType,
          message,
        );
        logger.info("Customer redaction alert processed", {
          shopId,
          customerId: customer?.id,
          messageLength: message.length,
        });
        break;
      }

      // Checkout related webhooks
      case "CHECKOUTS_CREATE": {
        const checkout = payload;
        logger.debug("Processing CHECKOUTS_CREATE webhook", {
          checkoutId: checkout?.id,
          shopId,
        });

        if (checkout?.id) {
          templateData.orderId = checkout.id.toString();
        }
        templateData.additionalInfo = "New checkout has been initiated";

        const message = templateService.getTemplateForAlertType(
          "CHECKOUTS_CREATE" as AlertType,
          templateData,
        );

        await alertService.handleSendAlert(
          shopId,
          "CHECKOUTS_CREATE" as AlertType,
          message,
        );
        logger.info("Checkout created alert processed", {
          shopId,
          checkoutId: checkout?.id,
          messageLength: message.length,
        });
        break;
      }

      case "CHECKOUTS_UPDATE": {
        const checkout = payload;
        logger.debug("Processing CHECKOUTS_UPDATE webhook", {
          checkoutId: checkout?.id,
          shopId,
        });

        if (checkout?.id) {
          templateData.orderId = checkout.id.toString();
        }
        templateData.additionalInfo = "Checkout has been updated";

        const message = templateService.getTemplateForAlertType(
          "CHECKOUTS_UPDATE" as AlertType,
          templateData,
        );

        await alertService.handleSendAlert(
          shopId,
          "CHECKOUTS_UPDATE" as AlertType,
          message,
        );
        logger.info("Checkout updated alert processed", {
          shopId,
          checkoutId: checkout?.id,
          messageLength: message.length,
        });
        break;
      }

      // Inventory related webhooks
      case "INVENTORY_LEVELS_UPDATE": {
        const inventory = payload;
        logger.debug("Processing INVENTORY_LEVELS_UPDATE webhook", {
          inventoryItemId: inventory?.inventory_item_id,
          shopId,
        });

        templateData.additionalInfo = `Inventory level updated. New available: ${inventory?.available || "unknown"}`;

        const message = templateService.getTemplateForAlertType(
          "INVENTORY_LEVELS_UPDATE" as AlertType,
          templateData,
        );

        await alertService.handleSendAlert(
          shopId,
          "INVENTORY_LEVELS_UPDATE" as AlertType,
          message,
        );
        logger.info("Inventory updated alert processed", {
          shopId,
          inventoryItemId: inventory?.inventory_item_id,
          messageLength: message.length,
        });
        break;
      }

      // Theme related webhooks
      case "THEMES_CREATE": {
        const theme = payload;
        logger.debug("Processing THEMES_CREATE webhook", {
          themeId: theme?.id,
          shopId,
        });

        templateData.additionalInfo = `Theme "${theme?.name || "Unknown"}" has been created`;

        const message = templateService.getTemplateForAlertType(
          "THEMES_CREATE" as AlertType,
          templateData,
        );

        await alertService.handleSendAlert(
          shopId,
          "THEMES_CREATE" as AlertType,
          message,
        );
        logger.info("Theme created alert processed", {
          shopId,
          themeId: theme?.id,
          messageLength: message.length,
        });
        break;
      }

      case "THEMES_UPDATE": {
        const theme = payload;
        logger.debug("Processing THEMES_UPDATE webhook", {
          themeId: theme?.id,
          shopId,
        });

        templateData.additionalInfo = `Theme "${theme?.name || "Unknown"}" has been updated`;

        const message = templateService.getTemplateForAlertType(
          "THEMES_UPDATE" as AlertType,
          templateData,
        );

        await alertService.handleSendAlert(
          shopId,
          "THEMES_UPDATE" as AlertType,
          message,
        );
        logger.info("Theme updated alert processed", {
          shopId,
          themeId: theme?.id,
          messageLength: message.length,
        });
        break;
      }

      case "THEMES_DELETE": {
        const theme = payload;
        logger.debug("Processing THEMES_DELETE webhook", {
          themeId: theme?.id,
          shopId,
        });

        templateData.additionalInfo = `Theme "${theme?.name || "Unknown"}" has been deleted`;

        const message = templateService.getTemplateForAlertType(
          "THEMES_DELETE" as AlertType,
          templateData,
        );

        await alertService.handleSendAlert(
          shopId,
          "THEMES_DELETE" as AlertType,
          message,
        );
        logger.info("Theme deleted alert processed", {
          shopId,
          themeId: theme?.id,
          messageLength: message.length,
        });
        break;
      }

      case "THEMES_PUBLISH": {
        const theme = payload;
        logger.debug("Processing THEMES_PUBLISH webhook", {
          themeId: theme?.id,
          shopId,
        });

        templateData.additionalInfo = `Theme "${theme?.name || "Unknown"}" has been published`;

        const message = templateService.getTemplateForAlertType(
          "THEMES_PUBLISH" as AlertType,
          templateData,
        );

        await alertService.handleSendAlert(
          shopId,
          "THEMES_PUBLISH" as AlertType,
          message,
        );
        logger.info("Theme published alert processed", {
          shopId,
          themeId: theme?.id,
          messageLength: message.length,
        });
        break;
      }

      // Shop related webhooks
      case "SHOP_UPDATE": {
        logger.debug("Processing SHOP_UPDATE webhook", {
          shopId,
        });

        templateData.additionalInfo = "Shop details have been updated";

        const message = templateService.getTemplateForAlertType(
          "SHOP_UPDATE" as AlertType,
          templateData,
        );

        await alertService.handleSendAlert(
          shopId,
          "SHOP_UPDATE" as AlertType,
          message,
        );
        logger.info("Shop update alert processed", {
          shopId,
          messageLength: message.length,
        });
        break;
      }

      // System related webhooks
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

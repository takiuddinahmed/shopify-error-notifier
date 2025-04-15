// app/services/alert-template.server.ts
import type { AlertType } from "@prisma/client";

export interface AlertTemplateData {
  shopName?: string;
  productTitle?: string;
  productId?: string;
  productUrl?: string;
  orderId?: string;
  customerName?: string;
  customerEmail?: string;
  errorMessage?: string;
  additionalInfo?: string;
}

export class AlertTemplateService {
  getTemplateForAlertType(
    alertType: AlertType,
    data: AlertTemplateData = {},
  ): string {
    // Get current timestamp formatted nicely
    const timestamp = new Date().toLocaleString();

    // Common format for all messages
    const baseMessage = (title: string, details: string) => {
      return `🔔 <b>${title}</b>\n\n${details}\n\n<i>Time: ${timestamp}</i>`;
    };

    switch (alertType) {
      // Product related alerts
      case "PRODUCTS_CREATE":
        return baseMessage(
          "New Product Created",
          `A new product${data.productTitle ? ` <b>"${data.productTitle}"</b>` : ""} has been created${
            data.shopName ? ` in shop "${data.shopName}"` : ""
          }.${data.productUrl ? `\n\n<a href="${data.productUrl}">View Product</a>` : ""}${
            data.additionalInfo ? `\n\n${data.additionalInfo}` : ""
          }`,
        );

      case "PRODUCTS_UPDATE":
        return baseMessage(
          "Product Updated",
          `A product${data.productTitle ? ` <b>"${data.productTitle}"</b>` : ""} has been updated${
            data.shopName ? ` in shop "${data.shopName}"` : ""
          }.${data.productUrl ? `\n\n<a href="${data.productUrl}">View Product</a>` : ""}${
            data.additionalInfo ? `\n\n${data.additionalInfo}` : ""
          }`,
        );

      case "PRODUCTS_DELETE":
        return baseMessage(
          "Product Deleted",
          `A product has been deleted${data.shopName ? ` from shop "${data.shopName}"` : ""}.${
            data.additionalInfo ? `\n\n${data.additionalInfo}` : ""
          }`,
        );

      // Inventory alerts
      case "INVENTORY_LEVELS_UPDATE" as AlertType:
        return baseMessage(
          "Inventory Updated",
          `Inventory levels have been updated${
            data.shopName ? ` in shop "${data.shopName}"` : ""
          }.${data.additionalInfo ? `\n\n${data.additionalInfo}` : ""}`,
        );

      // Customer related alerts
      case "SIGN_UP":
        return baseMessage(
          "New Customer Registration",
          `A new customer${data.customerName ? ` <b>${data.customerName}</b>` : ""} has registered${
            data.shopName ? ` at "${data.shopName}"` : ""
          }.${data.additionalInfo ? `\n\n${data.additionalInfo}` : ""}`,
        );

      case "SIGN_IN":
        return baseMessage(
          "Customer Sign In",
          `Customer${data.customerName ? ` <b>${data.customerName}</b>` : ""} has signed in${
            data.shopName ? ` to "${data.shopName}"` : ""
          }.${data.additionalInfo ? `\n\n${data.additionalInfo}` : ""}`,
        );

      case "CUSTOMERS_DELETE" as AlertType:
        return baseMessage(
          "Customer Deleted",
          `A customer${data.customerName ? ` <b>${data.customerName}</b>` : ""} has been deleted${
            data.shopName ? ` from "${data.shopName}"` : ""
          }.${data.additionalInfo ? `\n\n${data.additionalInfo}` : ""}`,
        );

      case "CUSTOMERS_REDACT" as AlertType:
        return baseMessage(
          "Customer Data Redaction",
          `Customer data redaction has been requested${
            data.shopName ? ` for "${data.shopName}"` : ""
          }.${data.additionalInfo ? `\n\n${data.additionalInfo}` : ""}`,
        );

      // Order related alerts
      case "CHECK_OUT":
        return baseMessage(
          "New Order Placed",
          `A new order${data.orderId ? ` (#${data.orderId})` : ""} has been placed${data.shopName ? ` at "${data.shopName}"` : ""}.${
            data.additionalInfo ? `\n\n${data.additionalInfo}` : ""
          }`,
        );

      case "ORDERS_UPDATED" as AlertType:
        return baseMessage(
          "Order Updated",
          `Order${data.orderId ? ` #${data.orderId}` : ""} has been updated${
            data.shopName ? ` at "${data.shopName}"` : ""
          }.${data.additionalInfo ? `\n\n${data.additionalInfo}` : ""}`,
        );

      case "ORDERS_CANCELLED" as AlertType:
        return baseMessage(
          "Order Cancelled",
          `Order${data.orderId ? ` #${data.orderId}` : ""} has been cancelled${
            data.shopName ? ` at "${data.shopName}"` : ""
          }.${data.additionalInfo ? `\n\n${data.additionalInfo}` : ""}`,
        );

      case "ORDERS_FULFILLED" as AlertType:
        return baseMessage(
          "Order Fulfilled",
          `Order${data.orderId ? ` #${data.orderId}` : ""} has been fulfilled${
            data.shopName ? ` at "${data.shopName}"` : ""
          }.${data.additionalInfo ? `\n\n${data.additionalInfo}` : ""}`,
        );

      // Checkout related alerts
      case "CHECKOUTS_CREATE" as AlertType:
        return baseMessage(
          "Checkout Started",
          `A new checkout session${data.orderId ? ` (#${data.orderId})` : ""} has been started${
            data.shopName ? ` at "${data.shopName}"` : ""
          }.${data.additionalInfo ? `\n\n${data.additionalInfo}` : ""}`,
        );

      case "CHECKOUTS_UPDATE" as AlertType:
        return baseMessage(
          "Checkout Updated",
          `Checkout session${data.orderId ? ` (#${data.orderId})` : ""} has been updated${
            data.shopName ? ` at "${data.shopName}"` : ""
          }.${data.additionalInfo ? `\n\n${data.additionalInfo}` : ""}`,
        );

      // Theme related alerts
      case "THEMES_CREATE" as AlertType:
        return baseMessage(
          "Theme Created",
          `A new theme has been created${
            data.shopName ? ` for "${data.shopName}"` : ""
          }.${data.additionalInfo ? `\n\n${data.additionalInfo}` : ""}`,
        );

      case "THEMES_UPDATE" as AlertType:
        return baseMessage(
          "Theme Updated",
          `A theme has been updated${
            data.shopName ? ` for "${data.shopName}"` : ""
          }.${data.additionalInfo ? `\n\n${data.additionalInfo}` : ""}`,
        );

      case "THEMES_DELETE" as AlertType:
        return baseMessage(
          "Theme Deleted",
          `A theme has been deleted${
            data.shopName ? ` from "${data.shopName}"` : ""
          }.${data.additionalInfo ? `\n\n${data.additionalInfo}` : ""}`,
        );

      case "THEMES_PUBLISH" as AlertType:
        return baseMessage(
          "Theme Published",
          `A theme has been published${
            data.shopName ? ` for "${data.shopName}"` : ""
          }.${data.additionalInfo ? `\n\n${data.additionalInfo}` : ""}`,
        );

      // Shop related alerts
      case "SHOP_UPDATE" as AlertType:
        return baseMessage(
          "Shop Updated",
          `Shop details have been updated${
            data.shopName ? ` for "${data.shopName}"` : ""
          }.${data.additionalInfo ? `\n\n${data.additionalInfo}` : ""}`,
        );

      // System related alerts
      case "SYSTEM_ISSUE":
        return baseMessage(
          "System Issue Detected",
          `A system issue has been detected${data.shopName ? ` for "${data.shopName}"` : ""}.${
            data.errorMessage
              ? `\n\n<b>Error details:</b>\n${data.errorMessage}`
              : ""
          }${data.additionalInfo ? `\n\n${data.additionalInfo}` : ""}`,
        );

      default:
        return baseMessage(
          "Alert Notification",
          `An alert has been triggered for your shop${data.shopName ? ` "${data.shopName}"` : ""}.${
            data.additionalInfo ? `\n\n${data.additionalInfo}` : ""
          }`,
        );
    }
  }

  // Helper method to format metadata for the message
  formatMetadata(metadata: Record<string, any>): string {
    if (Object.keys(metadata).length === 0) {
      return "";
    }

    let formatted = "\n\n<b>Additional Information:</b>";
    for (const [key, value] of Object.entries(metadata)) {
      formatted += `\n<b>${key}:</b> ${value}`;
    }

    return formatted;
  }
}

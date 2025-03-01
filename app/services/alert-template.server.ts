// app/services/alert-template.server.ts
import type { AlertType } from "@prisma/client";

export interface AlertTemplateData {
  shopName?: string;
  productTitle?: string;
  productId?: string;
  orderId?: string;
  customerName?: string;
  customerEmail?: string;
  errorMessage?: string;
  // Add other relevant template data fields as needed
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
      case "PRODUCTS_CREATE":
        return baseMessage(
          "New Product Created",
          `A new product${data.productTitle ? ` <b>"${data.productTitle}"</b>` : ""} has been created${
            data.shopName ? ` in shop "${data.shopName}"` : ""
          }.`,
        );

      case "PRODUCTS_UPDATE":
        return baseMessage(
          "Product Updated",
          `A product${data.productTitle ? ` <b>"${data.productTitle}"</b>` : ""} has been updated${
            data.shopName ? ` in shop "${data.shopName}"` : ""
          }.`,
        );

      case "PRODUCTS_DELETE":
        return baseMessage(
          "Product Deleted",
          `A product has been deleted${data.shopName ? ` from shop "${data.shopName}"` : ""}.`,
        );

      case "SIGN_UP":
        return baseMessage(
          "New Customer Registration",
          `A new customer${data.customerName ? ` <b>${data.customerName}</b>` : ""} has registered${
            data.shopName ? ` at "${data.shopName}"` : ""
          }.`,
        );

      case "SIGN_IN":
        return baseMessage(
          "Customer Sign In",
          `Customer${data.customerName ? ` <b>${data.customerName}</b>` : ""} has signed in${
            data.shopName ? ` to "${data.shopName}"` : ""
          }.`,
        );

      case "CHECK_OUT":
        return baseMessage(
          "New Order Placed",
          `A new order has been placed${data.shopName ? ` at "${data.shopName}"` : ""}.`,
        );

      case "SYSTEM_ISSUE":
        return baseMessage(
          "System Issue Detected",
          `A system issue has been detected${data.shopName ? ` for "${data.shopName}"` : ""}.${
            data.errorMessage
              ? `\n\n<b>Error details:</b>\n${data.errorMessage}`
              : ""
          }`,
        );

      default:
        return baseMessage(
          "Alert Notification",
          `An alert has been triggered for your shop${data.shopName ? ` "${data.shopName}"` : ""}.`,
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

import { AlertType } from "app/components/AllAlertMessage/AlertMessageList";
import prisma from "app/db.server";

interface AlertConfiguration {
  shopId: string;
  productCreate: boolean;
  productUpdate: boolean;
  productDelete: boolean;
  signup: boolean;
  signin: boolean;
  checkout: boolean;
  systemIssue: boolean;
}

interface AlertMessage {
  id: string;
  shopId: string;
  alertType: AlertType;
  message: string;
  status: "Success" | "Error";
  errorMessage?: string;
  createdAt: Date;
}

interface PublishAlertParams {
  shopId: string;
  alertType: AlertType;
  message: string;
  metadata?: Record<string, any>;
}

export class BaseAlertService {
  // Get combined configuration for a shop
  static async getShopConfiguration(shopId: string) {
    const [alertConfig, receiverConfig] = await Promise.all([
      prisma.configuration.findUnique({
        where: { shopId },
      }),
      prisma.receiverConfiguration.findUnique({
        where: { shopId },
      }),
    ]);

    return {
      alertConfig,
      receiverConfig,
    };
  }

  // Check if an alert type is enabled for a shop
  static async isAlertEnabled(
    shopId: string,
    alertType: AlertType,
  ): Promise<boolean> {
    const { alertConfig } = await this.getShopConfiguration(shopId);
    if (!alertConfig) return false;

    const configMap: Record<AlertType, keyof AlertConfiguration> = {
      PRODUCT_CREATED: "productCreate",
      PRODUCT_UPDATED: "productUpdate",
      PRODUCT_DELETED: "productDelete",
      SIGN_IN: "signin",
      SIGN_UP: "signup",
      CHECK_OUT: "checkout",
      SYSTEM_ISSUE: "systemIssue",
    };

    return alertConfig[configMap[alertType]] ?? false;
  }

  // Publish an alert based on configurations
  static async publishAlert({
    shopId,
    alertType,
    message,
    metadata = {},
  }: PublishAlertParams): Promise<AlertMessage> {
    // Check if alert type is enabled
    const isEnabled = await this.isAlertEnabled(shopId, alertType);
    if (!isEnabled) {
      throw new Error(
        `Alert type ${alertType} is not enabled for shop ${shopId}`,
      );
    }

    // Get receiver configuration
    const { receiverConfig } = await this.getShopConfiguration(shopId);

    // Create alert message record
    const alertMessage = await prisma.alertMessage.create({
      data: {
        shopId,
        alertType,
        message,
        status: "Success",
      },
    });

    // Send to configured platforms
    try {
      if (receiverConfig?.isTelegramEnabled) {
        await this.sendTelegramAlert({
          message,
          botToken: receiverConfig.telegramBotToken!,
          chatIds: receiverConfig.telegramReceiverChatIds!.split(","),
          metadata,
        });
      }

      return alertMessage;
    } catch (error) {
      // Update alert message with error status
      await prisma.alertMessage.update({
        where: { id: alertMessage.id },
        data: {
          status: "Error",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        },
      });

      throw error;
    }
  }

  // Resend a specific alert
  static async resendAlert(alertId: string): Promise<AlertMessage> {
    const existingAlert = await prisma.alertMessage.findUnique({
      where: { id: alertId },
    });

    if (!existingAlert) {
      throw new Error(`Alert with ID ${alertId} not found`);
    }

    return this.publishAlert({
      shopId: existingAlert.shopId,
      alertType: existingAlert.alertType as AlertType,
      message: existingAlert.message,
    });
  }

  // Send alert to Telegram
  private static async sendTelegramAlert({
    message,
    botToken,
    chatIds,
    metadata,
  }: {
    message: string;
    botToken: string;
    chatIds: string[];
    metadata: Record<string, any>;
  }) {
    const formattedMessage = this.formatTelegramMessage(message, metadata);

    await Promise.all(
      chatIds.map(async (chatId) => {
        const response = await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: formattedMessage,
              parse_mode: "HTML",
            }),
          },
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Telegram API error: ${JSON.stringify(error)}`);
        }
      }),
    );
  }

  // Format message for Telegram
  private static formatTelegramMessage(
    message: string,
    metadata: Record<string, any>,
  ): string {
    let formatted = `🔔 <b>New Alert</b>\n\n${message}`;

    if (Object.keys(metadata).length > 0) {
      formatted += "\n\n<b>Additional Information:</b>";
      for (const [key, value] of Object.entries(metadata)) {
        formatted += `\n<b>${key}:</b> ${value}`;
      }
    }

    return formatted;
  }
}

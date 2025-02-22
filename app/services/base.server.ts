import type { AlertType } from "app/types/allAlerts";
import prisma from "app/db.server";
import type { ReceiverConfiguration } from "@prisma/client";

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

// interface ReceiverConfiguration {
//   receiverPlatform: boolean;
//   telegramBotToken?: string;
//   telegramReceiverChatIds?: string;
// }

export class AlertConfigurationService {
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

    return (alertConfig[configMap[alertType]] as boolean) ?? false;
  }

  // Get receiver configuration for a shop
  static async getReceiverConfiguration(
    shopId: string,
  ): Promise<ReceiverConfiguration | null> {
    const { receiverConfig } = await this.getShopConfiguration(shopId);
    return receiverConfig;
  }

  // Helper method to check if Telegram is enabled for a shop
  static async receiverPlatform(shopId: string): Promise<boolean> {
    const receiverConfig = await this.getReceiverConfiguration(shopId);
    return !!receiverConfig?.receiverPlatform;
  }

  // Get Telegram configuration if enabled
  static async getTelegramConfig(shopId: string) {
    const receiverConfig = await this.getReceiverConfiguration(shopId);

    if (!receiverConfig?.receiverPlatform) {
      return null;
    }

    return {
      botToken: receiverConfig.telegramBotToken,
      chatIds: receiverConfig.telegramReceiverChatIds?.split(",") || [],
    };
  }
}

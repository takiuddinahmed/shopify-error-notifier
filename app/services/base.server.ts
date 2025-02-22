import type { AlertType } from "app/types/allAlerts";
import prisma from "app/db.server";
import type { ReceiverConfiguration } from "@prisma/client";
import { TelegramPublisherService } from "./publisher.server";

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

  // Helper method to check if receiver platform is enabled for a shop
  static async receiverPlatform(shopId: string): Promise<boolean> {
    const receiverConfig = await this.getReceiverConfiguration(shopId);
    return !!receiverConfig?.receiverPlatform;
  }

  // Get Telegram configuration if enabled
  static async getTelegramConfig(shopId: string) {
    const receiverConfig = await this.getReceiverConfiguration(shopId);

    if (
      !receiverConfig?.receiverPlatform ||
      !receiverConfig?.telegramBotToken ||
      !receiverConfig?.telegramReceiverChatIds
    ) {
      return null;
    }

    return {
      botToken: receiverConfig.telegramBotToken,
      chatIds: receiverConfig.telegramReceiverChatIds?.split(",") || [],
    };
  }

  // Main method to handle alert workflow
  static async handleSendAlert(
    shopId: string,
    alertType: AlertType,
    message?: string,
  ): Promise<void> {
    try {
      // Step 1: Check if alert is enabled for this shop and alert type
      const isEnabled = await this.isAlertEnabled(shopId, alertType);
      if (!isEnabled) {
        console.log(`Alert type ${alertType} is disabled for shop ${shopId}`);
        return;
      }

      // Step 2: Get receiver configuration and check if platform is enabled
      const receiverConfig = await this.getReceiverConfiguration(shopId);
      if (!receiverConfig?.receiverPlatform) {
        console.log(`No receiver platform enabled for shop ${shopId}`);
        return;
      }

      // Step 3: Route to appropriate publisher service based on platform
      if (receiverConfig.receiverPlatform === "telegram") {
        const telegramConfig = await this.getTelegramConfig(shopId);

        const generatedMessage = {
          message: message || "An alert has been triggered",
          metadata: {},
        };

        if (telegramConfig) {
          await Promise.all(
            telegramConfig.chatIds.map((chatId) =>
              TelegramPublisherService.publishToTelegram(
                generatedMessage,
                telegramConfig,
              ),
            ),
          );
        }
      } else {
        throw new Error("Unsupported receiver platform");
      }
    } catch (error) {
      console.error("Error handling alert:", error);
      throw error;
    }
  }
}

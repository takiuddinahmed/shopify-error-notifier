import type { AlertType } from "app/types/allAlerts";
import prisma from "app/db.server";
import { AlertStatus, type ReceiverConfiguration } from "@prisma/client";
import { TelegramPublisherService } from "./publisher.server";
import { AlertMessagesService } from "./all-alert-message.server";
import logger from "app/utils/logger";

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
  private prismaClient;
  private publisher;

  constructor(
    prismaClient = prisma,
    telegramPublisher = new TelegramPublisherService(),
  ) {
    this.prismaClient = prismaClient;
    this.publisher = telegramPublisher;
  }

  async getShopConfiguration(shopId: string) {
    logger.debug(`Fetching shop configuration for ${shopId}`);
    const [alertConfig, receiverConfig] = await Promise.all([
      this.prismaClient.configuration.findUnique({
        where: { shopId },
      }),
      this.prismaClient.receiverConfiguration.findUnique({
        where: { shopId },
      }),
    ]);
    logger.debug(`Configuration loaded for ${shopId}`, {
      hasAlertConfig: !!alertConfig,
      hasReceiverConfig: !!receiverConfig,
    });
    return {
      alertConfig,
      receiverConfig,
    };
  }

  async isAlertEnabled(shopId: string, alertType: AlertType): Promise<boolean> {
    logger.debug(`Checking alert enablement for ${alertType} in ${shopId}`);
    const { alertConfig } = await this.getShopConfiguration(shopId);
    if (!alertConfig) return false;

    const configMap: Record<AlertType, keyof AlertConfiguration> = {
      PRODUCTS_CREATE: "productCreate",
      PRODUCTS_UPDATE: "productUpdate",
      PRODUCTS_DELETE: "productDelete",
      SIGN_IN: "signin",
      SIGN_UP: "signup",
      CHECK_OUT: "checkout",
      SYSTEM_ISSUE: "systemIssue",
    };

    return (alertConfig[configMap[alertType]] as boolean) ?? false;
  }

  async getReceiverConfiguration(
    shopId: string,
  ): Promise<ReceiverConfiguration | null> {
    logger.debug(`Fetching receiver configuration for ${shopId}`);
    const { receiverConfig } = await this.getShopConfiguration(shopId);
    logger.debug(`Receiver configuration loaded for ${shopId}`, {
      hasReceiverConfig: !!receiverConfig,
    });
    return receiverConfig;
  }

  async receiverPlatform(shopId: string): Promise<boolean> {
    logger.debug(`Checking receiver platform for ${shopId}`);
    const receiverConfig = await this.getReceiverConfiguration(shopId);
    logger.debug(`Receiver configuration loaded for ${shopId}`, {
      hasReceiverConfig: !!receiverConfig,
    });
    return !!receiverConfig?.receiverPlatform;
  }

  async getTelegramConfig(shopId: string) {
    logger.debug(`Fetching Telegram config for ${shopId}`);
    const receiverConfig = await this.getReceiverConfiguration(shopId);

    if (
      !receiverConfig?.receiverPlatform ||
      !receiverConfig?.telegramBotToken ||
      !receiverConfig?.telegramReceiverChatIds
    ) {
      logger.error("Incomplete Telegram configuration", {
        shopId,
        hasBotToken: !!receiverConfig?.telegramBotToken,
        hasChatIds: !!receiverConfig?.telegramReceiverChatIds,
      });
      return null;
    }

    logger.debug(`Telegram config loaded for ${shopId}`, {
      hasReceiverConfig: !!receiverConfig,
    });
    return {
      botToken: receiverConfig.telegramBotToken,
      chatIds: receiverConfig.telegramReceiverChatIds?.split(",") || [],
    };
  }

  async handleSendAlert(
    shopId: string,
    alertType: AlertType,
    message?: string,
    alertId?: string,
  ): Promise<void> {
    const alertMessagesService = new AlertMessagesService();
    let createdAlert;

    try {
      // Step 1: Check if alert is enabled for this shop and alert type
      logger.info(`Processing alert ${alertId || "new alert"} for ${shopId}`, {
        alertType,
        hasMessage: !!message,
      });
      const isEnabled = await this.isAlertEnabled(shopId, alertType);
      if (!isEnabled) {
        logger.warn(`Alert type ${alertType} is disabled for shop ${shopId}`);
        return;
      }

      // Step 2: Get receiver configuration and check if platform is enabled
      const receiverConfig = await this.getReceiverConfiguration(shopId);
      if (!receiverConfig?.receiverPlatform) {
        logger.error(`No receiver platform configured for ${shopId}`);
        return;
      }

      // Step 3: Create or update an alert message
      if (alertId) {
        createdAlert = await alertMessagesService.updateAlertStatus(
          alertId,
          AlertStatus.PENDING,
        );
        logger.info(`Updated alert ${alertId} to PENDING`);
      } else {
        createdAlert = await alertMessagesService.createAlert({
          shopId,
          alertType,
          message: message || "An alert has been triggered",
        });
        logger.info(`Created new alert ${createdAlert.id}`);
      }

      // Step 4: Route to appropriate publisher service based on platform
      if (receiverConfig.receiverPlatform === "telegram") {
        const telegramConfig = await this.getTelegramConfig(shopId);

        const generatedMessage = {
          message: message || "An alert has been triggered",
          metadata: {},
        };

        if (telegramConfig) {
          try {
            await this.publisher.publishToTelegram(
              generatedMessage,
              telegramConfig,
            );

            // Update alert status to SUCCESS
            await alertMessagesService.updateAlertStatus(
              createdAlert.id,
              AlertStatus.SUCCESS,
            );

            logger.info(
              `Successfully sent alert ${createdAlert.id} to Telegram`,
            );
          } catch (publishError) {
            // Update alert status to ERROR if any message failed to send
            await alertMessagesService.updateAlertStatus(
              createdAlert.id,
              AlertStatus.ERROR,
            );

            logger.error(
              `Failed to send alert ${createdAlert.id} to Telegram`,
              {
                error: publishError,
              },
            );

            throw publishError;
          }
        }
      } else {
        // Update status to ERROR for unsupported platform
        if (createdAlert) {
          await alertMessagesService.updateAlertStatus(
            createdAlert.id,
            AlertStatus.ERROR,
          );
        }
        logger.error(
          `Unsupported receiver platform: ${receiverConfig.receiverPlatform}`,
        );
        throw new Error("Unsupported receiver platform");
      }
    } catch (error) {
      // Ensure alert status is updated to ERROR if we have a created alert
      if (createdAlert) {
        await alertMessagesService.updateAlertStatus(
          createdAlert.id,
          AlertStatus.ERROR,
        );
      }
      logger.error("Error handling alert", { error });
      throw error;
    }
  }

  async handleResendAlert(alertId: string): Promise<void> {
    logger.debug(`Resending alert ${alertId}`);
    const alertMessagesService = new AlertMessagesService();
    const alertMessage =
      await alertMessagesService.findAlertMessageById(alertId);
    if (!alertMessage) {
      logger.error(`Alert ${alertId} not found for resend`);
      throw new Error("Alert message not found");
    }
    await this.handleSendAlert(
      alertMessage.shopId,
      alertMessage.alertType,
      alertMessage.message,
      alertId,
    );
    logger.info(`Resend successful for alert ${alertId}`);
  }
}

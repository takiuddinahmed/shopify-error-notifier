import logger from "app/utils/logger";
import { AlertTemplateService } from "./alert-template.server";

interface TelegramMessage {
  message: string;
  metadata?: Record<string, any>;
}

interface TelegramCredentials {
  botToken: string;
  chatIds: string[];
}

export class TelegramPublisherService {
  private templateService: AlertTemplateService;

  constructor(templateService = new AlertTemplateService()) {
    this.templateService = templateService;
  }
  async publishToTelegram(
    message: TelegramMessage,
    credentials: TelegramCredentials,
  ): Promise<void> {
    logger.debug("Formatting Telegram message");
    const formattedMessage = this.formatTelegramMessage(
      message.message,
      message.metadata || {},
    );

    try {
      logger.info("Sending Telegram message", {
        chatCount: credentials.chatIds.length,
        messageLength: formattedMessage.length,
      });
      await Promise.all(
        credentials.chatIds.map((chatId) =>
          this.sendToTelegramChat(
            formattedMessage,
            chatId,
            credentials.botToken,
          ),
        ),
      );
      logger.debug("Telegram message(s) sent successfully");
    } catch (error: any) {
      logger.error("Telegram publish failed", {
        error: error.message,
        chatCount: credentials.chatIds.length,
        stack: error.stack,
      });
      throw error;
    }
  }

  private async sendToTelegramChat(
    message: string,
    chatId: string,
    botToken: string,
  ): Promise<void> {
    logger.debug("Sending to Telegram chat", {
      chatId: chatId.slice(0, 3) + "***",
    });
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "HTML",
          }),
        },
      );
      if (!response.ok) {
        const errorBody = await response.json();
        logger.error("Telegram API error", {
          status: response.status,
          errorCode: errorBody.error_code,
          chatId: chatId.slice(0, 3) + "***",
        });
        throw new Error(`Telegram API error: ${response.status}`);
      }
      logger.debug("Telegram message delivered", {
        chatId: chatId.slice(0, 3) + "***",
        status: response.status,
      });
    } catch (error: any) {
      logger.error("Telegram send failed", {
        error: error.message,
        chatId: chatId.slice(0, 3) + "***",
        stack: error.stack,
      });
      throw error;
    }
  }

  private formatTelegramMessage(
    message: string,
    metadata: Record<string, any>,
  ): string {
    // If the message already follows our template format, just add metadata
    if (message.startsWith("🔔")) {
      return metadata && Object.keys(metadata).length > 0
        ? message + this.templateService.formatMetadata(metadata)
        : message;
    }

    // Otherwise, format it with the default template
    let formatted = message;
    if (Object.keys(metadata).length > 0) {
      formatted += this.templateService.formatMetadata(metadata);
    }

    return formatted;
  }
}

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
    const formattedMessage = this.formatTelegramMessage(
      message.message,
      message.metadata || {},
    );

    try {
      await Promise.all(
        credentials.chatIds.map((chatId) =>
          this.sendToTelegramChat(
            formattedMessage,
            chatId,
            credentials.botToken,
          ),
        ),
      );
    } catch (error) {
      throw new Error(
        `Failed to send Telegram message: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  private async sendToTelegramChat(
    message: string,
    chatId: string,
    botToken: string,
  ): Promise<void> {
    console.log("Sending to Telegram chat...", { message, chatId, botToken });
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
      console.log("Response from Telegram API:", response);
      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`Telegram API error: ${JSON.stringify(errorBody)}`);
      }
    } catch (error) {
      console.error("Detailed fetch error:", error);
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

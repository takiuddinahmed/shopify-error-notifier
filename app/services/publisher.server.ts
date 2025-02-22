interface TelegramMessage {
  message: string;
  metadata?: Record<string, any>;
}

interface TelegramConfig {
  botToken: string;
  chatIds: string[];
}

export class TelegramPublisherService {
  // Send message to Telegram
  static async publishToTelegram(
    message: TelegramMessage,
    config: TelegramConfig,
  ): Promise<void> {
    const formattedMessage = this.formatTelegramMessage(
      message.message,
      message.metadata || {},
    );

    try {
      await Promise.all(
        config.chatIds.map((chatId) =>
          this.sendToTelegramChat(formattedMessage, chatId, config.botToken),
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

  // Send to specific Telegram chat
  private static async sendToTelegramChat(
    message: string,
    chatId: string,
    botToken: string,
  ): Promise<void> {
    console.log("Sending to Telegram chat...", { message, chatId, botToken });
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
      const error = await response.json();
      throw new Error(`Telegram API error: ${JSON.stringify(error)}`);
    }
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

import prisma from "app/db.server";

interface ReceiverConfigurationData {
  shopId: string;
  isTelegramEnabled: boolean;
  telegramBotToken?: string;
  telegramReceiverChatIds?: string;
}

export class ReceiverService {
  static async getConfiguration(shopId: string) {
    return prisma.receiverConfiguration.findUnique({
      where: { shopId },
    });
  }

  static async upsertConfiguration(data: ReceiverConfigurationData) {
    const { shopId, ...configData } = data;

    return prisma.receiverConfiguration.upsert({
      where: { shopId },
      update: configData,
      create: data,
    });
  }
}

import prisma from "app/db.server";

interface ReceiverConfigurationData {
  shopId: string;
  isTelegramEnabled: boolean;
  telegramBotToken?: string;
  telegramReceiverChatIds?: string;
}

export class ReceiverService {
  private shopId: string;

  constructor(shopId: string) {
    this.shopId = shopId;
  }

  async getConfiguration() {
    return prisma.receiverConfiguration.findUnique({
      where: { shopId: this.shopId },
    });
  }

  async upsertConfiguration(
    configData: Omit<ReceiverConfigurationData, "shopId">,
  ) {
    return prisma.receiverConfiguration.upsert({
      where: { shopId: this.shopId },
      update: configData,
      create: { shopId: this.shopId, ...configData },
    });
  }
}

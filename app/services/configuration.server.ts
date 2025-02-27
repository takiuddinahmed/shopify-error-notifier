import prisma from "app/db.server";

interface ConfigurationData {
  shopId: string;
  productCreate: boolean;
  productUpdate: boolean;
  productDelete: boolean;
  signup: boolean;
  signin: boolean;
  checkout: boolean;
  systemIssue: boolean;
}

export class ConfigurationService {
  private shopId: string;

  constructor(shopId: string) {
    this.shopId = shopId;
  }

  async getConfiguration() {
    return prisma.configuration.findUnique({
      where: { shopId: this.shopId },
    });
  }

  async upsertConfiguration(configData: Omit<ConfigurationData, "shopId">) {
    return prisma.configuration.upsert({
      where: { shopId: this.shopId },
      update: configData,
      create: { shopId: this.shopId, ...configData },
    });
  }
}

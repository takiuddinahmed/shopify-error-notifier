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
  static async getConfiguration(shopId: string) {
    return prisma.configuration.findUnique({
      where: { shopId },
    });
  }

  static async upsertConfiguration(data: ConfigurationData) {
    const { shopId, ...configData } = data;

    return prisma.configuration.upsert({
      where: { shopId },
      update: configData,
      create: data,
    });
  }
}

import prisma from "app/db.server";

interface ConfigurationData {
  shopId: string;
  // Product related
  productCreate: boolean;
  productUpdate: boolean;
  productDelete: boolean;

  // Customer related
  customersCreate: boolean;
  customersUpdate: boolean;
  customersDelete: boolean;
  customersRedact: boolean;

  // Order related
  checkout: boolean;
  ordersUpdated: boolean;
  ordersCancelled: boolean;
  ordersFulfilled: boolean;

  // Checkout related
  checkoutsCreate: boolean;
  checkoutsUpdate: boolean;

  // Inventory related
  inventoryUpdate: boolean;

  // Theme related
  themesCreate: boolean;
  themesUpdate: boolean;
  themesDelete: boolean;
  themesPublish: boolean;

  // Shop related
  shopUpdate: boolean;

  // System related
  systemIssue: boolean;
}

export class ConfigurationService {
  private shopId: string;

  constructor(shopId: string) {
    this.shopId = shopId;
  }

  async getConfiguration() {
    const config = await prisma.configuration.findUnique({
      where: { shopId: this.shopId },
    });
    console.log("Database configuration raw:", config);
    console.log(
      "Database configuration stringified:",
      JSON.stringify(config, null, 2),
    );
    return config;
  }

  async upsertConfiguration(configData: Omit<ConfigurationData, "shopId">) {
    console.log("upsertConfiguration", configData);
    return prisma.configuration.upsert({
      where: { shopId: this.shopId },
      update: configData,
      create: { shopId: this.shopId, ...configData },
    });
  }
}

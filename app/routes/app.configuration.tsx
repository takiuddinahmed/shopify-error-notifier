import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Layout, Page } from "@shopify/polaris";
import { AlertConfigForm } from "app/components/configuration/AlertConfigForm";
import { ConfigurationService } from "app/services/configuration.server";
import { authenticate } from "app/shopify.server";
import logger from "app/utils/logger";

// Define a type that matches what we expect from the database
type ConfigurationType = {
  shopId: string;
  // Product related
  productCreate: boolean;
  productUpdate: boolean;
  productDelete: boolean;

  // Customer related
  signup: boolean;
  signin: boolean;
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

  // Other fields
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shopId = session.shop;

  logger.info(`Loading configuration for shop: ${shopId}`);

  try {
    const configService = new ConfigurationService(shopId);
    const configData = await configService.getConfiguration();
    console.log("Raw config data from DB:", configData);

    // Transform data to ensure all expected fields are present
    const configuration = configData
      ? {
          shopId: configData.shopId,
          // Product related
          productCreate: (configData as any).productCreate ?? false,
          productUpdate: (configData as any).productUpdate ?? false,
          productDelete: (configData as any).productDelete ?? false,

          // Customer related
          customersCreate:
            (configData as any).customersCreate ??
            (configData as any).signup ??
            false,
          customersUpdate:
            (configData as any).customersUpdate ??
            (configData as any).signin ??
            false,
          customersDelete: (configData as any).customersDelete ?? false,
          customersRedact: (configData as any).customersRedact ?? false,

          // Order related
          checkout: (configData as any).checkout ?? false,
          ordersUpdated: (configData as any).ordersUpdated ?? false,
          ordersCancelled: (configData as any).ordersCancelled ?? false,
          ordersFulfilled: (configData as any).ordersFulfilled ?? false,

          // Checkout related
          checkoutsCreate: (configData as any).checkoutsCreate ?? false,
          checkoutsUpdate: (configData as any).checkoutsUpdate ?? false,

          // Inventory related
          inventoryUpdate: (configData as any).inventoryUpdate ?? false,

          // Theme related
          themesCreate: (configData as any).themesCreate ?? false,
          themesUpdate: (configData as any).themesUpdate ?? false,
          themesDelete: (configData as any).themesDelete ?? false,
          themesPublish: (configData as any).themesPublish ?? false,

          // Shop related
          shopUpdate: (configData as any).shopUpdate ?? false,

          // System related
          systemIssue: (configData as any).systemIssue ?? false,

          // Keep other fields
          id: configData.id,
          createdAt: configData.createdAt,
          updatedAt: configData.updatedAt,
        }
      : null;

    logger.info(
      configuration ? "Configuration loaded" : "No configuration found",
      {
        shopId,
        exists: !!configuration,
      },
    );

    return json({ configuration });
  } catch (error: any) {
    logger.error("Failed to load configuration", {
      error: error.message,
      stack: error.stack,
      shopId,
    });
    throw new Response("Configuration load failed", { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shopId = session.shop;

  logger.info(`Updating configuration for shop: ${shopId}`);

  try {
    const data = Object.fromEntries(await request.formData());

    logger.debug("Processing configuration form data", {
      shopId,
      formKeys: Object.keys(data),
    });

    const configurationData = {
      // Product related
      productCreate: data.product_create === "true",
      productUpdate: data.product_update === "true",
      productDelete: data.product_delete === "true",

      // Customer related
      customersCreate: data.customers_create === "true",
      customersUpdate: data.customers_update === "true",
      customersDelete: data.customers_delete === "true",
      customersRedact: data.customers_redact === "true",

      // Order related
      checkout: data.checkout === "true",
      ordersUpdated: data.orders_updated === "true",
      ordersCancelled: data.orders_cancelled === "true",
      ordersFulfilled: data.orders_fulfilled === "true",

      // Checkout related
      checkoutsCreate: data.checkouts_create === "true",
      checkoutsUpdate: data.checkouts_update === "true",

      // Inventory related
      inventoryUpdate: data.inventory_update === "true",

      // Theme related
      themesCreate: data.themes_create === "true",
      themesUpdate: data.themes_update === "true",
      themesDelete: data.themes_delete === "true",
      themesPublish: data.themes_publish === "true",

      // Shop related
      shopUpdate: data.shop_update === "true",

      // System related
      systemIssue: data.system_issue === "true",
    };

    logger.info("Updating configuration with values", {
      shopId,
      config: configurationData,
    });

    const configService = new ConfigurationService(shopId);
    await configService.upsertConfiguration(configurationData);

    logger.info("Configuration updated successfully", { shopId });
    return json({ success: true });
  } catch (error: any) {
    logger.error("Configuration update failed", {
      error: error.message,
      stack: error.stack,
      shopId,
    });
    return json({ success: false, error: "Update failed" }, { status: 500 });
  }
}

export default function Configuration() {
  const { configuration } = useLoaderData<typeof loader>();

  console.log(
    "Configuration from loader:",
    JSON.stringify(configuration, null, 2),
  );

  // Check what properties are actually available
  if (configuration) {
    const configKeys = Object.keys(configuration);
    console.log("Available config keys:", configKeys);
  }

  return (
    <Page title="Configuration">
      <Layout>
        <Layout.Section>
          <AlertConfigForm
            initialConfiguration={
              configuration as Partial<ConfigurationType> | null
            }
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

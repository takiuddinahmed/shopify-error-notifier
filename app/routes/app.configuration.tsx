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
    const configData =
      (await configService.getConfiguration()) as Partial<ConfigurationType>;

    // Transform data to ensure all expected fields are present
    const configuration: ConfigurationType | null = configData
      ? {
          shopId: configData.shopId ?? shopId,
          // Product related
          productCreate: configData.productCreate ?? false,
          productUpdate: configData.productUpdate ?? false,
          productDelete: configData.productDelete ?? false,

          // Customer related
          signup: configData.signup ?? false,
          signin: configData.signin ?? false,
          customersDelete: configData.customersDelete ?? false,
          customersRedact: configData.customersRedact ?? false,

          // Order related
          checkout: configData.checkout ?? false,
          ordersUpdated: configData.ordersUpdated ?? false,
          ordersCancelled: configData.ordersCancelled ?? false,
          ordersFulfilled: configData.ordersFulfilled ?? false,

          // Checkout related
          checkoutsCreate: configData.checkoutsCreate ?? false,
          checkoutsUpdate: configData.checkoutsUpdate ?? false,

          // Inventory related
          inventoryUpdate: configData.inventoryUpdate ?? false,

          // Theme related
          themesCreate: configData.themesCreate ?? false,
          themesUpdate: configData.themesUpdate ?? false,
          themesDelete: configData.themesDelete ?? false,
          themesPublish: configData.themesPublish ?? false,

          // Shop related
          shopUpdate: configData.shopUpdate ?? false,

          // System related
          systemIssue: configData.systemIssue ?? false,

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
      signup: data.signup === "true",
      signin: data.signin === "true",
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

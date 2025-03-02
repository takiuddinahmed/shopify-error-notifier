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

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shopId = session.shop;

  logger.info(`Loading configuration for shop: ${shopId}`);

  try {
    const configService = new ConfigurationService(shopId);
    const configuration = await configService.getConfiguration();

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
      productCreate: data.product_create === "true",
      productUpdate: data.product_update === "true",
      productDelete: data.product_delete === "true",
      signup: data.signup === "true",
      signin: data.signin === "true",
      checkout: data.checkout === "true",
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
          <AlertConfigForm initialConfiguration={configuration} />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

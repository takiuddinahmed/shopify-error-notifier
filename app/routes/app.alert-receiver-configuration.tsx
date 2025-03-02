import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Layout, Page } from "@shopify/polaris";
import { AlertMessageReceiver } from "app/components/AlertReceiverConfiguration/AlertMessageReceiver";
import { ReceiverService } from "app/services/alert-receiver-configuration.server";
import { authenticate } from "app/shopify.server";
import logger from "app/utils/logger";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shopId = session.shop;

  logger.info(`Loading receiver configuration for shop: ${shopId}`);

  try {
    const receiverService = new ReceiverService(shopId);
    const configuration = await receiverService.getConfiguration();

    logger.info(
      configuration ? "Configuration found" : "No configuration found",
      {
        shopId,
        hasToken: !!configuration?.telegramBotToken,
        hasChatIds: !!configuration?.telegramReceiverChatIds,
      },
    );

    return json({
      configuration: configuration
        ? {
            receiverPlatform: configuration.receiverPlatform
              ? configuration.receiverPlatform.split(",")
              : [],
            telegramBotToken: configuration.telegramBotToken ?? undefined,
            telegramReceiverChatIds:
              configuration.telegramReceiverChatIds ?? undefined,
          }
        : null,
    });
  } catch (error: any) {
    logger.error("Failed to load receiver configuration", {
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

  logger.info(`Updating receiver configuration for shop: ${shopId}`);

  try {
    const data = Object.fromEntries(await request.formData());

    logger.debug("Processing form data", {
      shopId,
      formKeys: Object.keys(data),
    });

    const selectedPlatforms: string[] = JSON.parse(
      data.selectedPlatforms as string,
    );

    logger.info("Updating alert receiver configuration", {
      shopId,
      platforms: selectedPlatforms,
      hasToken: !!data.telegramBotToken,
      hasChatIds: !!data.telegramReceiverChatIds,
    });

    const configurationData = {
      shopId,
      receiverPlatform: selectedPlatforms.join(","),
      telegramBotToken: data.telegramBotToken as string,
      telegramReceiverChatIds: data.telegramReceiverChatIds as string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const receiverService = new ReceiverService(shopId);
    await receiverService.upsertConfiguration(configurationData);

    logger.info("Configuration updated successfully", {
      shopId,
      platforms: selectedPlatforms,
    });

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

export default function AlertReceiverPage() {
  const { configuration } = useLoaderData<typeof loader>();

  return (
    <Page title="Alert Receiver Configuration">
      <Layout>
        <Layout.Section>
          <AlertMessageReceiver initialConfiguration={configuration} />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

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

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shopId = session.shop;
  const configuration = await ReceiverService.getConfiguration(shopId);

  return json({
    configuration: configuration
      ? {
          isTelegramEnabled: configuration.isTelegramEnabled,
          telegramBotToken: configuration.telegramBotToken ?? undefined,
          telegramReceiverChatIds:
            configuration.telegramReceiverChatIds ?? undefined,
        }
      : null,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shopId = session.shop;
  const data = Object.fromEntries(await request.formData());

  const selectedPlatforms = JSON.parse(data.selectedPlatforms as string);

  const configurationData = {
    shopId,
    isTelegramEnabled: selectedPlatforms.includes("telegram"),
    telegramBotToken: data.telegramBotToken as string,
    telegramReceiverChatIds: data.telegramReceiverChatIds as string,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await ReceiverService.upsertConfiguration(configurationData);
  return json({ success: true });
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

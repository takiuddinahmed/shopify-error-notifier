import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Layout, Page } from "@shopify/polaris";
import { AlertMessageReceiver } from "app/components/AlertReceiverConfiguration/AlertMessageReceiver";
import { ReceiverService } from "app/services/alert-receiver-configuration.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const shopId = "12345678"; // Should come from auth context
  const configuration = await ReceiverService.getConfiguration(shopId);
  return json({ configuration });
}

export async function action({ request }: ActionFunctionArgs) {
  const shopId = "12345678"; // Should come from auth context
  const data = Object.fromEntries(await request.formData());

  const selectedPlatforms = JSON.parse(data.selectedPlatforms as string);

  const configurationData = {
    shopId,
    isTelegramEnabled: selectedPlatforms.includes("telegram"),
    telegramBotToken: data.telegramBotToken as string,
    telegramReceiverChatIds: data.telegramReceiverChatIds as string,
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

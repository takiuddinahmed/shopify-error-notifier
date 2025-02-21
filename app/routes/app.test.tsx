import { useState } from "react";
import { Page, Button, Card, Banner } from "@shopify/polaris";
import { json, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { authenticate } from "app/shopify.server";
import { AlertConfigurationService } from "app/services/base.server";
import { TelegramPublisherService } from "app/services/publisher.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  return json({
    shopId: session.shop,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shopId = session.shop;

  try {
    const alertType = "SYSTEM_ISSUE";
    const message = "This is a test alert message";

    const telegramConfig =
      await AlertConfigurationService.getTelegramConfig(shopId);

    if (telegramConfig?.botToken && telegramConfig.chatIds.length > 0) {
      await TelegramPublisherService.publishToTelegram(
        { message },
        {
          botToken: telegramConfig.botToken,
          chatIds: telegramConfig.chatIds,
        },
      );
      return json({ success: true, message: "Alert published successfully!" });
    }
    return json({ success: false, message: "Telegram not configured" });
  } catch (error) {
    return json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to publish alert",
    });
  }
}

export default function AlertPage() {
  const fetcher = useFetcher();
  const [status, setStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handlePublishAlert = () => {
    console.log("Publishing alert..."); // Debug log
    fetcher.submit({}, { method: "post" });
  };

  // Update status when fetcher returns data

  return (
    <Page title="Publish Alert">
      <Card>
        <Card>
          <Button
            onClick={handlePublishAlert}
            loading={fetcher.state !== "idle"}
          >
            Publish Alert
          </Button>
        </Card>
      </Card>
    </Page>
  );
}

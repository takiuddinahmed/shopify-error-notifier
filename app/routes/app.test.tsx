import { useState } from "react";
import { Page, Button, Card, Banner, BlockStack } from "@shopify/polaris";
import { json, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { authenticate } from "app/shopify.server";
import { AlertConfigurationService } from "app/services/base.server";

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
    const message = "This is a system test alert message";

    const alertService = new AlertConfigurationService();

    await alertService.handleSendAlert(shopId, alertType, message);
    return json({ success: true, message: "Alert published successfully" });
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

  const status = fetcher.data as {
    success: boolean;
    message: string;
  };

  console.log("status:", fetcher.data);

  const handlePublishAlert = () => {
    console.log("Publishing alert..."); // Debug log
    fetcher.submit({}, { method: "post" });
  };

  // Update status when fetcher returns data

  return (
    <Page title="Publish Alert">
      <BlockStack gap="500">
        {status && <Card>{status.message}</Card>}
        <Card>
          <Button
            onClick={handlePublishAlert}
            loading={fetcher.state !== "idle"}
          >
            Publish Alert
          </Button>
        </Card>
      </BlockStack>
    </Page>
  );
}

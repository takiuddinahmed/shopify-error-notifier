import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Layout, Page } from "@shopify/polaris";
import { AlertMessagesList } from "app/components/AllAlertMessage/AlertMessageList";
import { AlertMessagesService } from "app/services/all-alert-message.server";
import { authenticate } from "app/shopify.server";
import type { AlertType, AlertMessage } from "@prisma/client";
import { useState, useCallback } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const shopId = "12345678"; // Should come from auth context
  const dbAlertMessages = await AlertMessagesService.getAlertMessages(shopId);

  // Ensure createdAt is a Date object
  const alertMessages: AlertMessage[] = dbAlertMessages.map((alert) => ({
    ...alert,
    createdAt: new Date(alert.createdAt), // Ensure createdAt is a Date
  }));

  return json({ alertMessages });
}

export async function action({ request }: ActionFunctionArgs) {
  const shopId = "12345678"; // Should come from auth context
  const data = Object.fromEntries(await request.formData());

  if (request.url.includes("/resend")) {
    const id = data.id as string;
    await AlertMessagesService.resendAlert(id);
    return json({ success: true });
  }

  const alertData = {
    shopId,
    alertType: data.alertType as AlertType,
    message: data.message as string,
  };

  await AlertMessagesService.createAlert(alertData);
  return json({ success: true });
}

export default function AllAlertMessages() {
  const { alertMessages } = useLoaderData<typeof loader>();
  const [modalActive, setModalActive] = useState(false);

  const parsedAlertMessages = alertMessages.map((alert) => ({
    ...alert,
    createdAt: new Date(alert.createdAt),
  }));

  const handleModalChange = useCallback((active: boolean) => {
    setModalActive(active);
  }, []);

  return (
    <Page
      title="All Alert Messages"
      primaryAction={{
        content: "Generate New Alert",
        onAction: () => setModalActive(true),
      }}
    >
      <Layout>
        <Layout.Section>
          <AlertMessagesList
            alertMessages={parsedAlertMessages}
            modalActive={modalActive}
            onModalChange={handleModalChange}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

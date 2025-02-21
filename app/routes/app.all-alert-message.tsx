import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Layout, Page } from "@shopify/polaris";
import {
  AlertMessagesList,
  AlertType,
} from "app/components/AllAlertMessage/AlertMessageList";
import { AlertMessagesService } from "app/services/all-alert-message.server";
import { useState, useCallback } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const shopId = "12345678"; // Should come from auth context
  const alertMessages = await AlertMessagesService.getAlertMessages(shopId);
  return json({ alertMessages });
}

export async function action({ request }: ActionFunctionArgs) {
  const shopId = "12345678"; // Should come from auth context
  const data = Object.fromEntries(await request.formData());

  // Handle resend action
  if (request.url.includes("/resend")) {
    const id = data.id as string;
    await AlertMessagesService.resendAlert(id);
    return json({ success: true });
  }

  // Handle create action
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
            alertMessages={alertMessages}
            modalActive={modalActive}
            onModalChange={handleModalChange}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

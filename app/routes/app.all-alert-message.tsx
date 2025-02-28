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
import type { AlertType } from "@prisma/client";
import { useState, useCallback } from "react";
import { AlertConfigurationService } from "app/services/base.server";

const alertMessageService = new AlertMessagesService();
const baseService = new AlertConfigurationService();
// app/routes/all-alert-messages.tsx

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shopId = session.shop;
  const url = new URL(request.url);

  // Get pagination parameters
  let page = Number(url.searchParams.get("page")) || 1;
  let perPage = Number(url.searchParams.get("perPage")) || 10;

  // Validate numbers
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(perPage) || perPage < 1) perPage = 10;

  const dbResult = await alertMessageService.getAlertMessages(
    shopId,
    page,
    perPage,
  );

  // Convert dates
  const alertMessages = dbResult.alertMessages.map((alert) => ({
    ...alert,
    createdAt: new Date(alert.createdAt),
  }));

  return json({
    alertMessages,
    total: dbResult.total,
    currentPage: page,
    perPage,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shopId = session.shop;
  const data = Object.fromEntries(await request.formData());

  const alertData = {
    shopId,
    alertType: data.alertType as AlertType,
    message: data.message as string,
  };

  await baseService.handleSendAlert(
    shopId,
    alertData.alertType,
    alertData.message,
  );
  return json({ success: true });
}

export default function AllAlertMessages() {
  const { alertMessages, total, currentPage, perPage } =
    useLoaderData<typeof loader>();
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
            total={total}
            currentPage={currentPage}
            perPage={perPage}
            modalActive={modalActive}
            onModalChange={handleModalChange}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

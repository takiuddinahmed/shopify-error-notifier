import {
  Button,
  Card,
  Layout,
  Page,
  Text,
  Banner,
  BlockStack,
  InlineStack,
} from "@shopify/polaris";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const formData = await request.formData();
  const action = formData.get("action") as string;

  if (action === "register_webhooks") {
    try {
      // Call the API endpoint for registering webhooks
      const apiUrl = new URL("/api/register-webhooks", request.url);
      const response = await fetch(apiUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        return json({
          status: "success",
          message: "Webhooks registered successfully!",
        });
      } else {
        return json({
          status: "error",
          message: `Failed to register webhooks: ${result.error || "Unknown error"}`,
        });
      }
    } catch (error) {
      return json({
        status: "error",
        message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }

  return json({});
};

export default function Settings() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const [showBanner, setShowBanner] = useState(false);
  const isLoading = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.status) {
      setShowBanner(true);
      const timer = setTimeout(() => setShowBanner(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  const handleRegisterWebhooks = () => {
    submit({ action: "register_webhooks" }, { method: "POST" });
  };

  return (
    <Page title="Settings">
      <Layout>
        {showBanner && actionData?.status && (
          <Layout.Section>
            <Banner
              title={actionData.status === "success" ? "Success" : "Error"}
              status={actionData.status === "success" ? "success" : "critical"}
              onDismiss={() => setShowBanner(false)}
            >
              <p>{actionData.message}</p>
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Troubleshooting
              </Text>
              <Text as="p">
                If webhooks aren't working properly, you can manually
                re-register them here.
              </Text>
              <InlineStack>
                <Button
                  primary
                  loading={isLoading}
                  onClick={handleRegisterWebhooks}
                >
                  Re-register Webhooks
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Add more settings sections as needed */}
      </Layout>
    </Page>
  );
}

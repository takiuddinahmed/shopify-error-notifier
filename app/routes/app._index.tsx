import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  Icon,
  BlockStack,
  InlineStack,
  Box,
  Grid,
  Bleed,
  InlineGrid,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { NotificationIcon, ClockIcon, CheckIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const recentNotifications = [
    { id: 1, message: "New order received", timestamp: "2 minutes ago" },
    { id: 2, message: "Product inventory low", timestamp: "1 hour ago" },
    {
      id: 3,
      message: "Customer support ticket opened",
      timestamp: "3 hours ago",
    },
  ];

  return json({ recentNotifications });
};

export default function Index() {
  const { recentNotifications } = useLoaderData<typeof loader>();

  return (
    <Page>
      <TitleBar title="Alert Notifier Dashboard" />
      <Layout>
        {/* Welcome Section */}
        <Layout.Section>
          <Card padding="400">
            <BlockStack gap="400">
              <Text as="h1" variant="headingXl">
                Welcome to Alert Notifier
              </Text>
              <Text as="p" variant="bodyMd">
                Stay informed about critical events in your Shopify store.
                Configure your alerts and never miss an important update.
              </Text>
              <InlineStack gap="300" align="start">
                <Button variant="primary" url="/app/configuration">
                  Configure Alerts
                </Button>
                <Button url="/app/all-alert-message">View Alert History</Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Recent Notifications */}
        <Layout.Section>
          <Card padding="400">
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg">
                Recent Notifications
              </Text>
              <Bleed marginInline="400">
                <BlockStack gap="400">
                  {recentNotifications.map((notification) => (
                    <Box
                      key={notification.id}
                      paddingBlock="200"
                      borderColor="border"
                      borderBlockEndWidth="025"
                      paddingInline="400"
                    >
                      <InlineStack gap="300" align="start" blockAlign="start">
                        <Box width="auto">
                          <Icon source={NotificationIcon} tone="success" />
                        </Box>
                        <BlockStack gap="100">
                          <Text as="span" fontWeight="medium">
                            {notification.message}
                          </Text>
                          <Text as="span" variant="bodySm" tone="subdued">
                            {notification.timestamp}
                          </Text>
                        </BlockStack>
                      </InlineStack>
                    </Box>
                  ))}
                </BlockStack>
              </Bleed>
              <Box paddingBlockStart="400">
                <Button url="/app/all-alert-message" fullWidth>
                  View all notifications
                </Button>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Features Grid */}
        <Layout.Section>
          <InlineGrid gap="400" columns={3}>
            {/* Instant Alerts Card */}
            <Card padding="400" roundedAbove="sm">
              <BlockStack gap="400">
                <InlineStack gap="400" align="start" blockAlign="start">
                  <Box width="auto">
                    <Icon source={NotificationIcon} tone="warning" />
                  </Box>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd">
                      Instant Alerts
                    </Text>
                    <Text as="p" variant="bodyMd">
                      Receive real-time notifications for all important events
                      in your Shopify store.
                    </Text>
                  </BlockStack>
                </InlineStack>
              </BlockStack>
            </Card>

            {/* 24/7 Monitoring Card */}
            <Card padding="400" roundedAbove="sm">
              <BlockStack gap="400">
                <InlineStack gap="400" align="start" blockAlign="start">
                  <Box width="auto">
                    <Icon source={ClockIcon} tone="info" />
                  </Box>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd">
                      24/7 Monitoring
                    </Text>
                    <Text as="p" variant="bodyMd">
                      Our system continuously monitors your store, ensuring
                      you're always up-to-date.
                    </Text>
                  </BlockStack>
                </InlineStack>
              </BlockStack>
            </Card>

            {/* Customizable Notifications Card */}
            <Card padding="400" roundedAbove="sm">
              <BlockStack gap="400">
                <InlineStack gap="400" align="start" blockAlign="start">
                  <Box width="auto">
                    <Icon source={CheckIcon} tone="success" />
                  </Box>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd">
                      Customizable Notifications
                    </Text>
                    <Text as="p" variant="bodyMd">
                      Tailor your alert settings to focus on the events that
                      matter most to your business.
                    </Text>
                  </BlockStack>
                </InlineStack>
              </BlockStack>
            </Card>
          </InlineGrid>
        </Layout.Section>

        {/* Settings Section */}
        <Layout.Section>
          <Card padding="400">
            <Text as="h3" variant="headingMd">
              Settings
            </Text>
            <Box paddingBlockStart="200">
              <Text as="p" variant="bodyMd">
                New-transferable Checkout and Customer Accounts Extensibility
                preview
              </Text>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

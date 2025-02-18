import { useState, useCallback } from "react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  Checkbox,
  Button,
  Text,
  Divider,
  BlockStack,
} from "@shopify/polaris";

interface NotificationOption {
  id: string;
  label: string;
}

interface SelectedOptions {
  [key: string]: boolean;
}

export default function Configuration() {
  const notificationOptions: NotificationOption[] = [
    { id: "product_create", label: "Product Creation" },
    { id: "product_update", label: "Product Update" },
    { id: "product_delete", label: "Product Deletion" },
    { id: "signup", label: "New User Signup" },
    { id: "signin", label: "User Sign In" },
    { id: "checkout", label: "Checkout Completed" },
    { id: "system_issue", label: "System Issues" },
  ];

  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
    product_create: false,
    product_update: false,
    product_delete: false,
    signup: false,
    signin: false,
    checkout: false,
    system_issue: false,
  });

  const handleChange = useCallback(
    (id: string) => (checked: boolean) => {
      setSelectedOptions((prev) => ({ ...prev, [id]: checked }));
    },
    [],
  );

  const handleSelectAll = useCallback(() => {
    const allSelected: SelectedOptions = {};
    notificationOptions.forEach((option) => {
      allSelected[option.id] = true;
    });
    setSelectedOptions(allSelected);
  }, [notificationOptions]);

  const handleUnselectAll = useCallback(() => {
    const allUnselected: SelectedOptions = {};
    notificationOptions.forEach((option) => {
      allUnselected[option.id] = false;
    });
    setSelectedOptions(allUnselected);
  }, [notificationOptions]);

  const isAllSelected = Object.values(selectedOptions).every(Boolean);
  const isNoneSelected = Object.values(selectedOptions).every(
    (value) => !value,
  );

  return (
    <Page title="Notification Configuration">
      <Layout>
        <Layout.Section>
          <BlockStack gap="300">
            <Card>
              <Text as="h2" variant="headingMd">
                Select actions that should trigger notifications
              </Text>
              <Text variant="bodyMd" as="p">
                Choose which events will send alerts to your store admin
              </Text>
            </Card>

            <Card>
              <FormLayout>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                  }}
                >
                  <Button
                    onClick={handleSelectAll}
                    disabled={isAllSelected}
                    size="slim"
                  >
                    Select All
                  </Button>
                  <Button
                    onClick={handleUnselectAll}
                    disabled={isNoneSelected}
                    size="slim"
                  >
                    Unselect All
                  </Button>
                </div>
                <Divider />
                {notificationOptions.map(({ id, label }) => (
                  <Checkbox
                    key={id}
                    label={label}
                    checked={selectedOptions[id]}
                    onChange={handleChange(id)}
                  />
                ))}
              </FormLayout>
            </Card>

            <Card>
              <Button>Save Settings</Button>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

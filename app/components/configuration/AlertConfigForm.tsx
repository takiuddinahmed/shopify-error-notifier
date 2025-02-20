import { useFetcher } from "@remix-run/react";
import { useState, useCallback, useMemo } from "react";
import {
  Card,
  FormLayout,
  Checkbox,
  Button,
  Text,
  Divider,
  BlockStack,
} from "@shopify/polaris";

interface ConfigurationType {
  shopId: string;
  productCreate: boolean;
  productUpdate: boolean;
  productDelete: boolean;
  signup: boolean;
  signin: boolean;
  checkout: boolean;
  systemIssue: boolean;
}

// Define props type for the component
interface AlertConfigFormProps {
  initialConfiguration: ConfigurationType | null;
}

interface AlertOption {
  id: keyof SelectedOptions;
  label: string;
}

interface SelectedOptions {
  product_create: boolean;
  product_update: boolean;
  product_delete: boolean;
  signup: boolean;
  signin: boolean;
  checkout: boolean;
  system_issue: boolean;
}

export function AlertConfigForm({
  initialConfiguration,
}: AlertConfigFormProps) {
  const fetcher = useFetcher();

  const notificationOptions = useMemo<AlertOption[]>(
    () => [
      { id: "product_create", label: "Product Creation" },
      { id: "product_update", label: "Product Update" },
      { id: "product_delete", label: "Product Deletion" },
      { id: "signup", label: "New User Signup" },
      { id: "signin", label: "User Sign In" },
      { id: "checkout", label: "Checkout Completed" },
      { id: "system_issue", label: "System Issues" },
    ],
    [],
  );

  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
    product_create: initialConfiguration?.productCreate ?? false,
    product_update: initialConfiguration?.productUpdate ?? false,
    product_delete: initialConfiguration?.productDelete ?? false,
    signup: initialConfiguration?.signup ?? false,
    signin: initialConfiguration?.signin ?? false,
    checkout: initialConfiguration?.checkout ?? false,
    system_issue: initialConfiguration?.systemIssue ?? false,
  });

  const handleChange = useCallback(
    (id: keyof SelectedOptions) => (checked: boolean) => {
      setSelectedOptions((prev) => ({ ...prev, [id]: checked }));
    },
    [],
  );

  const handleSelectAll = useCallback(() => {
    setSelectedOptions(
      Object.keys(selectedOptions).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as SelectedOptions,
      ),
    );
  }, [selectedOptions]);

  const handleUnselectAll = useCallback(() => {
    setSelectedOptions(
      Object.keys(selectedOptions).reduce(
        (acc, key) => ({ ...acc, [key]: false }),
        {} as SelectedOptions,
      ),
    );
  }, [selectedOptions]);

  const handleSaveConfiguration = useCallback(() => {
    const formData = new FormData();
    Object.entries(selectedOptions).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    fetcher.submit(formData, { method: "POST" });
  }, [selectedOptions, fetcher]);

  const isAllSelected = Object.values(selectedOptions).every(Boolean);
  const isNoneSelected = Object.values(selectedOptions).every(
    (value) => !value,
  );

  return (
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
            style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
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
          <fetcher.Form method="post">
            <BlockStack gap="200">
              {notificationOptions.map(({ id, label }) => (
                <Checkbox
                  key={id}
                  label={label}
                  checked={selectedOptions[id]}
                  onChange={handleChange(id)}
                />
              ))}
            </BlockStack>
          </fetcher.Form>
        </FormLayout>
      </Card>

      <Card>
        <Button
          onClick={handleSaveConfiguration}
          loading={fetcher.state === "submitting"}
        >
          Save Settings
        </Button>
      </Card>
    </BlockStack>
  );
}

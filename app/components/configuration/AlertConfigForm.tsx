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

export interface ConfigurationType {
  shopId: string;
  // Product related
  productCreate: boolean;
  productUpdate: boolean;
  productDelete: boolean;

  // Customer related
  customersCreate: boolean;
  customersUpdate: boolean;
  customersDelete: boolean;
  customersRedact: boolean;

  // Order related
  checkout: boolean;
  ordersUpdated: boolean;
  ordersCancelled: boolean;
  ordersFulfilled: boolean;

  // Checkout related
  checkoutsCreate: boolean;
  checkoutsUpdate: boolean;

  // Inventory related
  inventoryUpdate: boolean;

  // Theme related
  themesCreate: boolean;
  themesUpdate: boolean;
  themesDelete: boolean;
  themesPublish: boolean;

  // Shop related
  shopUpdate: boolean;

  // System related
  systemIssue: boolean;
}

// Define props type for the component
interface AlertConfigFormProps {
  initialConfiguration: Partial<ConfigurationType> | null;
}

interface AlertOption {
  id: keyof SelectedOptions;
  label: string;
  category: string;
}

interface SelectedOptions {
  // Product related
  product_create: boolean;
  product_update: boolean;
  product_delete: boolean;

  // Customer related
  customers_create: boolean;
  customers_update: boolean;
  customers_delete: boolean;
  customers_redact: boolean;

  // Order related
  checkout: boolean;
  orders_updated: boolean;
  orders_cancelled: boolean;
  orders_fulfilled: boolean;

  // Checkout related
  checkouts_create: boolean;
  checkouts_update: boolean;

  // Inventory related
  inventory_update: boolean;

  // Theme related
  themes_create: boolean;
  themes_update: boolean;
  themes_delete: boolean;
  themes_publish: boolean;

  // Shop related
  shop_update: boolean;

  // System related
  system_issue: boolean;
}

export function AlertConfigForm({
  initialConfiguration,
}: AlertConfigFormProps) {
  const fetcher = useFetcher();
  console.log("initialConfiguration:", initialConfiguration);
  console.log("customersCreate value:", initialConfiguration?.customersCreate);
  console.log("customersUpdate value:", initialConfiguration?.customersUpdate);

  const notificationOptions = useMemo<AlertOption[]>(
    () => [
      // Product related
      { id: "product_create", label: "Product Creation", category: "Products" },
      { id: "product_update", label: "Product Update", category: "Products" },
      { id: "product_delete", label: "Product Deletion", category: "Products" },
      {
        id: "inventory_update",
        label: "Inventory Update",
        category: "Products",
      },

      // Customer related
      {
        id: "customers_create",
        label: "Customer Creation",
        category: "Customers",
      },
      {
        id: "customers_update",
        label: "Customer Update",
        category: "Customers",
      },
      {
        id: "customers_delete",
        label: "Customer Deletion",
        category: "Customers",
      },
      {
        id: "customers_redact",
        label: "Customer Data Redaction",
        category: "Customers",
      },

      // Order related
      { id: "checkout", label: "Order Completed", category: "Orders" },
      { id: "orders_updated", label: "Order Updated", category: "Orders" },
      { id: "orders_cancelled", label: "Order Cancelled", category: "Orders" },
      { id: "orders_fulfilled", label: "Order Fulfilled", category: "Orders" },

      // Checkout related
      {
        id: "checkouts_create",
        label: "Checkout Started",
        category: "Checkout",
      },
      {
        id: "checkouts_update",
        label: "Checkout Updated",
        category: "Checkout",
      },

      // Theme related
      { id: "themes_create", label: "Theme Created", category: "Themes" },
      { id: "themes_update", label: "Theme Updated", category: "Themes" },
      { id: "themes_delete", label: "Theme Deleted", category: "Themes" },
      { id: "themes_publish", label: "Theme Published", category: "Themes" },

      // Shop related
      { id: "shop_update", label: "Shop Updated", category: "Shop" },

      // System related
      { id: "system_issue", label: "System Issues", category: "System" },
    ],
    [],
  );

  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
    // Product related
    product_create: initialConfiguration?.productCreate ?? false,
    product_update: initialConfiguration?.productUpdate ?? false,
    product_delete: initialConfiguration?.productDelete ?? false,

    // Customer related
    customers_create:
      initialConfiguration?.customersCreate ??
      (initialConfiguration as any)?.signup ??
      false,
    customers_update:
      initialConfiguration?.customersUpdate ??
      (initialConfiguration as any)?.signin ??
      false,
    customers_delete: initialConfiguration?.customersDelete ?? false,
    customers_redact: initialConfiguration?.customersRedact ?? false,

    // Order related
    checkout: initialConfiguration?.checkout ?? false,
    orders_updated: initialConfiguration?.ordersUpdated ?? false,
    orders_cancelled: initialConfiguration?.ordersCancelled ?? false,
    orders_fulfilled: initialConfiguration?.ordersFulfilled ?? false,

    // Checkout related
    checkouts_create: initialConfiguration?.checkoutsCreate ?? false,
    checkouts_update: initialConfiguration?.checkoutsUpdate ?? false,

    // Inventory related
    inventory_update: initialConfiguration?.inventoryUpdate ?? false,

    // Theme related
    themes_create: initialConfiguration?.themesCreate ?? false,
    themes_update: initialConfiguration?.themesUpdate ?? false,
    themes_delete: initialConfiguration?.themesDelete ?? false,
    themes_publish: initialConfiguration?.themesPublish ?? false,

    // Shop related
    shop_update: initialConfiguration?.shopUpdate ?? false,

    // System related
    system_issue: initialConfiguration?.systemIssue ?? false,
  });

  console.log("selectedOptions:", selectedOptions);

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

  // Group notification options by category
  const groupedOptions = useMemo(() => {
    const grouped: Record<string, AlertOption[]> = {};

    notificationOptions.forEach((option) => {
      if (!grouped[option.category]) {
        grouped[option.category] = [];
      }
      grouped[option.category].push(option);
    });

    console.log("Grouped options:", grouped);
    return grouped;
  }, [notificationOptions]);

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
            <BlockStack gap="600">
              {Object.entries(groupedOptions).map(([category, options]) => (
                <BlockStack key={category} gap="200">
                  <Text as="h3" variant="headingMd">
                    {category}
                  </Text>
                  <BlockStack gap="200">
                    {options.map(({ id, label }) => {
                      console.log(
                        `Rendering option: ${id}, ${label}, checked: ${selectedOptions[id]}`,
                      );
                      return (
                        <div key={id} style={{ display: "block" }}>
                          <Checkbox
                            key={id}
                            label={label}
                            checked={selectedOptions[id]}
                            onChange={handleChange(id)}
                          />
                        </div>
                      );
                    })}
                  </BlockStack>
                </BlockStack>
              ))}
            </BlockStack>
          </fetcher.Form>
        </FormLayout>
      </Card>

      <Card>
        <Button
          onClick={handleSaveConfiguration}
          loading={fetcher.state === "submitting"}
          variant="primary"
        >
          Save Settings
        </Button>
      </Card>
    </BlockStack>
  );
}

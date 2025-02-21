import { useState, useCallback } from "react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  Text,
  BlockStack,
  ChoiceList,
} from "@shopify/polaris";

interface Platform {
  id: string;
  label: string;
  fields: Array<{
    label: string;
    schemaKey: keyof ReceiverConfig;
    helpText?: string;
    placeholder?: string;
  }>;
}

type ReceiverConfig = {
  telegramBotToken?: string;
  telegramReceiverChatIds?: string;
};

export default function AlertMessageReceiver() {
  const platforms: Platform[] = [
    {
      id: "telegram",
      label: "Telegram",
      fields: [
        {
          label: "Bot Token",
          schemaKey: "telegramBotToken",
          helpText: "Your Telegram bot token provided by BotFather",
        },
        {
          label: "Chat IDs",
          schemaKey: "telegramReceiverChatIds",
          placeholder: "Enter comma-separated chat IDs (e.g., 12345, 67890)",
          helpText: "Separate multiple chat IDs with commas",
        },
      ],
    },
  ];

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [config, setConfig] = useState<ReceiverConfig>({});

  const handlePlatformChange = useCallback((selected: string[]) => {
    setSelectedPlatforms(selected);
    // Reset config when platforms change
    setConfig({});
  }, []);

  const handleConfigChange = useCallback(
    (field: keyof ReceiverConfig, value: string) => {
      setConfig((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    const submission = {
      isTelegramEnabled: selectedPlatforms.includes("telegram"),
      ...config,
    };
    console.log("Configuration to save:", submission);
    // Add your save logic here
  }, [selectedPlatforms, config]);

  return (
    <Page title="Alert Message Receiver">
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Platform Selection Card */}
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Select Platforms to Receive Alerts
                </Text>
                <Text variant="bodyMd" as="p">
                  Choose the platforms where you want to receive alert messages
                </Text>
              </BlockStack>

              <FormLayout>
                <ChoiceList
                  title="Receiver Methods"
                  choices={platforms.map((platform) => ({
                    value: platform.id,
                    label: platform.label,
                  }))}
                  selected={selectedPlatforms}
                  onChange={handlePlatformChange}
                  allowMultiple
                />
              </FormLayout>
            </Card>

            {/* Credentials Card */}
            {selectedPlatforms.length > 0 && (
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Enter Required Credentials
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Provide the necessary credentials for the selected platforms
                  </Text>
                </BlockStack>

                <FormLayout>
                  {selectedPlatforms.map((platformId) => {
                    const platform = platforms.find((p) => p.id === platformId);
                    return (
                      platform && (
                        <BlockStack key={platform.id} gap="200">
                          <Text as="h3" variant="headingSm">
                            {platform.label}
                          </Text>
                          {platform.fields.map((field) => (
                            <TextField
                              key={`${platform.id}_${field.schemaKey}`}
                              label={field.label}
                              value={config[field.schemaKey] || ""}
                              onChange={(value) =>
                                handleConfigChange(field.schemaKey, value)
                              }
                              autoComplete="off"
                              placeholder={field.placeholder}
                              helpText={field.helpText}
                            />
                          ))}
                        </BlockStack>
                      )
                    );
                  })}
                </FormLayout>
              </Card>
            )}

            {/* Save Settings Card */}
            <Card>
              <Button onClick={handleSubmit}>Save Settings</Button>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

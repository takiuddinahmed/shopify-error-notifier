import { useFetcher } from "@remix-run/react";
import { useState, useCallback, useMemo } from "react";
import {
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

interface ReceiverConfig {
  telegramBotToken?: string;
  telegramReceiverChatIds?: string;
}

interface AlertMessageReceiverProps {
  initialConfiguration: {
    receiverPlatform: string[];
    telegramBotToken?: string;
    telegramReceiverChatIds?: string;
  } | null;
}

export function AlertMessageReceiver({
  initialConfiguration,
}: AlertMessageReceiverProps) {
  const fetcher = useFetcher();

  const platforms = useMemo<Platform[]>(
    () => [
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
    ],
    [],
  );

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    initialConfiguration?.receiverPlatform
      ? initialConfiguration.receiverPlatform
      : [],
  );

  const [config, setConfig] = useState<ReceiverConfig>({
    telegramBotToken: initialConfiguration?.telegramBotToken || "",
    telegramReceiverChatIds:
      initialConfiguration?.telegramReceiverChatIds || "",
  });

  const handlePlatformChange = useCallback((selected: string[]) => {
    setSelectedPlatforms(selected);
    if (!selected.includes("telegram")) {
      setConfig({
        telegramBotToken: "",
        telegramReceiverChatIds: "",
      });
    }
  }, []);

  const handleConfigChange = useCallback(
    (field: keyof ReceiverConfig, value: string) => {
      setConfig((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    const formData = new FormData();
    formData.append("selectedPlatforms", JSON.stringify(selectedPlatforms));
    Object.entries(config).forEach(([key, value]) => {
      formData.append(key, value || "");
    });

    fetcher.submit(formData, { method: "POST" });
  }, [selectedPlatforms, config, fetcher]);

  return (
    <BlockStack gap="500">
      <Card>
        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            Select Platforms to Receive Alerts
          </Text>
          <Text variant="bodyMd" as="p">
            Choose the platforms where you want to receive alert messages
          </Text>
        </BlockStack>

        <fetcher.Form method="post">
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
        </fetcher.Form>
      </Card>

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

      <Card>
        <Button onClick={handleSubmit} loading={fetcher.state === "submitting"}>
          Save Settings
        </Button>
      </Card>
    </BlockStack>
  );
}

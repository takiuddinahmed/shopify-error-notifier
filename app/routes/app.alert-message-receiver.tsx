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
  fields: string[];
}

export default function AlertMessageReceiver() {
  // Platforms available for receiving alerts
  const platforms: Platform[] = [
    {
      id: "telegram",
      label: "Telegram",
      fields: ["Telegram ID", "Secret Key"],
    },
    {
      id: "email",
      label: "Email",
      fields: ["Email Address"],
    },
    {
      id: "slack",
      label: "Slack",
      fields: ["Webhook URL"],
    },
  ];

  // State to manage selected platforms
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  // State to manage credential fields for each platform
  const [credentials, setCredentials] = useState<{ [key: string]: string }>({});

  // Handle platform selection change
  const handlePlatformChange = useCallback((selected: string[]) => {
    setSelectedPlatforms(selected);
    // Reset credentials when platforms change
    setCredentials({});
  }, []);

  // Handle credential field changes
  const handleCredentialChange = useCallback(
    (platformId: string, field: string, value: string) => {
      setCredentials((prev) => ({
        ...prev,
        [`${platformId}_${field}`]: value,
      }));
    },
    [],
  );

  // Handle form submission
  const handleSubmit = useCallback(() => {
    console.log("Selected Platforms:", selectedPlatforms);
    console.log("Credentials:", credentials);
    // Add logic to save the configuration
  }, [selectedPlatforms, credentials]);

  return (
    <Page title="Alert Message Receiver">
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Card 1: Platform Selection */}
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

            {/* Card 2: Credential Fields */}
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
                              key={`${platform.id}_${field}`}
                              label={field}
                              value={
                                credentials[`${platform.id}_${field}`] || ""
                              }
                              onChange={(value) =>
                                handleCredentialChange(
                                  platform.id,
                                  field,
                                  value,
                                )
                              }
                              autoComplete="off"
                            />
                          ))}
                        </BlockStack>
                      )
                    );
                  })}
                </FormLayout>
              </Card>
            )}

            {/* Card 3: Save Settings */}
            <Card>
              <Button onClick={handleSubmit}>Save Settings</Button>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

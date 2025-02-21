import { useState, useCallback } from "react";
import { useFetcher } from "@remix-run/react";
import {
  Card,
  IndexTable,
  Text,
  Badge,
  Button,
  Modal,
  Select,
  TextField,
  FormLayout,
} from "@shopify/polaris";
import type { AlertMessage } from "app/types/allAlerts";
import { AlertType } from "app/types/allAlerts";

const alertTypes = [
  { label: "Product Created", value: AlertType.PRODUCT_CREATED },
  { label: "Product Updated", value: AlertType.PRODUCT_UPDATED },
  { label: "Product Deleted", value: AlertType.PRODUCT_DELETED },
  { label: "Sign In", value: AlertType.SIGN_IN },
  { label: "Sign Up", value: AlertType.SIGN_UP },
  { label: "Check Out", value: AlertType.CHECK_OUT },
  { label: "System Issue", value: AlertType.SYSTEM_ISSUE },
];

interface AlertMessagesListProps {
  alertMessages: AlertMessage[];
  modalActive: boolean;
  onModalChange: (active: boolean) => void;
}

export function AlertMessagesList({
  alertMessages,
  modalActive,
  onModalChange,
}: AlertMessagesListProps) {
  const fetcher = useFetcher();
  const [selectedAlertType, setSelectedAlertType] = useState<AlertType>(
    AlertType.PRODUCT_CREATED,
  );
  const [message, setMessage] = useState("");

  const handleResend = useCallback(
    (id: string) => {
      fetcher.submit(
        { id },
        { method: "POST", action: `/api/alerts/${id}/resend` },
      );
    },
    [fetcher],
  );

  const handleAlertTypeChange = useCallback((value: string) => {
    setSelectedAlertType(value as AlertType);
  }, []);

  const handleMessageChange = useCallback((value: string) => {
    setMessage(value);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!message.trim()) return;

    const formData = new FormData();
    formData.append("alertType", selectedAlertType);
    formData.append("message", message);

    fetcher.submit(formData, { method: "POST" });
    setMessage("");
    onModalChange(false);
  }, [message, selectedAlertType, fetcher, onModalChange]);

  const getAlertTypeLabel = (type: AlertType) => {
    return alertTypes.find((t) => t.value === type)?.label || type;
  };

  return (
    <>
      <Card>
        <IndexTable
          itemCount={alertMessages.length}
          headings={[
            { title: "Event Name" },
            { title: "Message" },
            { title: "Time" },
            { title: "Status" },
            { title: "Resend" },
          ]}
          selectable={false}
        >
          {alertMessages.map(
            ({ id, alertType, message, createdAt, status }, index) => (
              <IndexTable.Row id={id} key={id} position={index}>
                <IndexTable.Cell>
                  <Text variant="bodyMd" as="span">
                    {getAlertTypeLabel(alertType)}
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{message}</IndexTable.Cell>
                <IndexTable.Cell>
                  {new Date(createdAt).toLocaleString()}
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Badge>{status}</Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Button
                    size="slim"
                    onClick={() => handleResend(id)}
                    loading={fetcher.state === "submitting"}
                  >
                    Resend
                  </Button>
                </IndexTable.Cell>
              </IndexTable.Row>
            ),
          )}
        </IndexTable>
      </Card>

      <Modal
        open={modalActive}
        onClose={() => onModalChange(false)}
        title="Generate New Alert"
        primaryAction={{
          content: "Create",
          onAction: handleSubmit,
          loading: fetcher.state === "submitting",
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => onModalChange(false),
          },
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <Select
              label="Alert Type"
              options={alertTypes}
              onChange={handleAlertTypeChange}
              value={selectedAlertType}
            />
            <TextField
              label="Message"
              multiline={4}
              value={message}
              onChange={handleMessageChange}
              autoComplete="off"
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </>
  );
}

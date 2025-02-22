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
import { AlertType, type AlertMessage } from "@prisma/client";

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

  const alertTypes = Object.values(AlertType).map((type) => ({
    label: type.replace(/_/g, " "),
    value: type,
  }));

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
                    {alertTypes.find((t) => t.value === alertType)?.label ||
                      alertType}
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

import { useState, useCallback, useMemo } from "react";
import { useFetcher, useSearchParams } from "@remix-run/react";
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
  Frame,
  ButtonGroup,
} from "@shopify/polaris";
import striptags from "striptags";
import DOMPurify from "isomorphic-dompurify";
import type { AlertMessage, AlertType } from "app/types/allAlerts";
import { AlertTypes } from "app/types/allAlerts";

interface AlertMessagesListProps {
  alertMessages: AlertMessage[];
  modalActive: boolean;
  onModalChange: (active: boolean) => void;
  total: number;
  currentPage: number;
  perPage: number;
}

// Helper function to truncate text to specified length with ellipsis
const truncateText = (text: string, maxLength: number) => {
  const cleanText = striptags(text);
  if (cleanText.length <= maxLength) return cleanText;
  return cleanText.slice(0, maxLength) + "...";
};

export function AlertMessagesList({
  alertMessages,
  modalActive,
  onModalChange,
  total,
  currentPage,
  perPage,
}: AlertMessagesListProps) {
  const fetcher = useFetcher();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedAlertType, setSelectedAlertType] = useState<AlertType>(
    AlertTypes.PRODUCTS_CREATE,
  );
  const [message, setMessage] = useState("");
  const [viewMessageModalActive, setViewMessageModalActive] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState("");

  const handleResend = useCallback(
    (id: string) => {
      const formData = new FormData();
      formData.append("id", id);
      fetcher.submit(formData, { method: "POST" });
    },
    [fetcher],
  );

  const handleViewMessage = useCallback((message: string) => {
    setSelectedMessage(message);
    setViewMessageModalActive(true);
  }, []);

  const handleAlertTypeChange = useCallback((value: string) => {
    setSelectedAlertType(value as AlertType);
  }, []);

  const handleMessageChange = useCallback((value: string) => {
    setMessage(value);
  }, []);

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  };

  const handleSubmit = useCallback(() => {
    if (!message.trim()) return;

    const formData = new FormData();
    formData.append("alertType", selectedAlertType);
    formData.append("message", message);

    fetcher.submit(formData, { method: "POST" });
    setMessage("");
    onModalChange(false);
  }, [message, selectedAlertType, fetcher, onModalChange]);

  const alertTypes = Object.values(AlertTypes).map((type) => ({
    label: type.replace(/_/g, " "),
    value: type,
  }));

  return (
    <Frame>
      <Card>
        <IndexTable
          itemCount={alertMessages.length}
          headings={[
            { title: "Event Name" },
            { title: "Message" },
            { title: "Time" },
            { title: "Status" },
            { title: "Actions" },
          ]}
          selectable={false}
          pagination={{
            hasNext: currentPage * perPage < total,
            hasPrevious: currentPage > 1,
            onNext: () => handlePageChange(currentPage + 1),
            onPrevious: () => handlePageChange(currentPage - 1),
            label: `Showing ${(currentPage - 1) * perPage + 1}-${Math.min(
              currentPage * perPage,
              total,
            )} of ${total} results`,
          }}
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
                <IndexTable.Cell>{truncateText(message, 30)}</IndexTable.Cell>
                <IndexTable.Cell>
                  {new Date(createdAt).toLocaleString()}
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Badge>{status}</Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <ButtonGroup>
                    <Button
                      size="slim"
                      onClick={() => handleViewMessage(message)}
                    >
                      View
                    </Button>
                    <Button
                      size="slim"
                      onClick={() => handleResend(id)}
                      loading={
                        fetcher.state === "submitting" &&
                        fetcher.formData?.get("id") === id
                      }
                    >
                      Resend
                    </Button>
                  </ButtonGroup>
                </IndexTable.Cell>
              </IndexTable.Row>
            ),
          )}
        </IndexTable>
      </Card>

      {/* Create Alert Modal */}
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

      {/* View Message Modal */}
      <Modal
        open={viewMessageModalActive}
        onClose={() => setViewMessageModalActive(false)}
        title="Alert Message"
        primaryAction={{
          content: "Close",
          onAction: () => setViewMessageModalActive(false),
        }}
      >
        <Modal.Section>
          <div
            dangerouslySetInnerHTML={{
              __html: useMemo(
                () => DOMPurify.sanitize(selectedMessage),
                [selectedMessage],
              ),
            }}
            style={{ padding: "16px" }}
          />
        </Modal.Section>
      </Modal>
    </Frame>
  );
}

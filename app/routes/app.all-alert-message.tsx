import {
  Page,
  Layout,
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
import { useState, useCallback } from "react";

interface AlertMessage {
  id: string;
  eventName: string;
  message: string;
  user: string;
  time: string;
  status: "Delivered" | "Failed";
}

const alertTypes = [
  { label: "Product Created", value: "PRODUCT_CREATED" },
  { label: "Product Updated", value: "PRODUCT_UPDATED" },
  { label: "Product Deleted", value: "PRODUCT_DELETED" },
  { label: "Sign In", value: "SIGN_IN" },
  { label: "Sign Up", value: "SIGN_UP" },
  { label: "Check Out", value: "CHECK_OUT" },
  { label: "System Issue", value: "SYSTEM_ISSUE" },
];

export default function AllAlertMessages() {
  const [alertMessages, setAlertMessages] = useState<AlertMessage[]>([]);
  const [modalActive, setModalActive] = useState(false);
  const [selectedAlertType, setSelectedAlertType] = useState(
    alertTypes[0].value,
  );
  const [message, setMessage] = useState("");

  // Handle Resend Action
  const handleResend = (id: string) => {
    console.log(`Resending alert message with ID: ${id}`);
  };

  // Toggle Modal
  const toggleModal = useCallback(
    () => setModalActive((active) => !active),
    [],
  );

  // Handle Alert Type Change
  const handleAlertTypeChange = useCallback((value: string) => {
    setSelectedAlertType(value);
  }, []);

  // Handle Message Change
  const handleMessageChange = useCallback((value: string) => {
    setMessage(value);
  }, []);

  // Handle Alert Submission
  const handleSubmit = () => {
    if (!message.trim()) return;
    const newAlert: AlertMessage = {
      id: Math.random().toString(36).substr(2, 9),
      eventName:
        alertTypes.find((type) => type.value === selectedAlertType)?.label ||
        "Unknown",
      message,
      user: "admin@example.com",
      time: new Date().toLocaleString(),
      status: "Delivered",
    };
    setAlertMessages([...alertMessages, newAlert]);
    setMessage("");
    toggleModal();
  };

  return (
    <Page
      title="All Alert Messages"
      primaryAction={{ content: "Generate New Alert", onAction: toggleModal }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <IndexTable
              itemCount={alertMessages.length}
              headings={[
                { title: "Event Name" },
                { title: "Message" },
                { title: "User" },
                { title: "Time" },
                { title: "Status" },
                { title: "Resend" },
              ]}
              selectable={false}
            >
              {alertMessages.map(
                ({ id, eventName, message, user, time, status }, index) => (
                  <IndexTable.Row id={id} key={id} position={index}>
                    <IndexTable.Cell>
                      <Text variant="bodyMd" as="span">
                        {eventName}
                      </Text>
                    </IndexTable.Cell>
                    <IndexTable.Cell>{message}</IndexTable.Cell>
                    <IndexTable.Cell>{user}</IndexTable.Cell>
                    <IndexTable.Cell>{time}</IndexTable.Cell>
                    <IndexTable.Cell>
                      <Badge>{status}</Badge>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <Button size="slim" onClick={() => handleResend(id)}>
                        Resend
                      </Button>
                    </IndexTable.Cell>
                  </IndexTable.Row>
                ),
              )}
            </IndexTable>
          </Card>
        </Layout.Section>
      </Layout>

      {/* Modal for Creating a New Alert */}
      <Modal
        open={modalActive}
        onClose={toggleModal}
        title="Generate New Alert"
        primaryAction={{ content: "Create", onAction: handleSubmit }}
        secondaryActions={[{ content: "Cancel", onAction: toggleModal }]}
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
    </Page>
  );
}

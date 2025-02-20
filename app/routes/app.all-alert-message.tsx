import {
  Page,
  Layout,
  Card,
  IndexTable,
  Text,
  Badge,
  Button,
} from "@shopify/polaris";
import { useState } from "react";

interface AlertMessage {
  id: string;
  eventName: string;
  message: string;
  user: string;
  time: string;
  status: "Delivered" | "Failed";
}

export default function AllAlertMessages() {
  // Sample data for alert messages
  const [alertMessages, setAlertMessages] = useState<AlertMessage[]>([
    {
      id: "1",
      eventName: "Product Created",
      message: "A new product was added to the store.",
      user: "admin@example.com",
      time: "2023-10-01 10:30 AM",
      status: "Delivered",
    },
    {
      id: "2",
      eventName: "Order Placed",
      message: "A new order was placed by customer2@example.com.",
      user: "customer@example.com",
      time: "2023-10-01 11:15 AM",
      status: "Failed",
    },
    {
      id: "3",
      eventName: "User Signed Up",
      message: "A new user signed up on the store.",
      user: "newuser@example.com",
      time: "2023-10-01 12:00 PM",
      status: "Delivered",
    },
  ]);

  // Handle resend action
  const handleResend = (id: string) => {
    console.log(`Resending alert message with ID: ${id}`);
    // Add logic to resend the alert message
  };

  return (
    <Page title="All Alert Messages">
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
    </Page>
  );
}

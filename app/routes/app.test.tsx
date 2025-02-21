import { useFetcher } from "@remix-run/react";
import { Page, Button, Card } from "@shopify/polaris";
import { AlertType } from "app/components/AllAlertMessage/AlertMessageList";
import { BaseAlertService } from "app/services/base.server";
import { useState } from "react";

export default function AlertPage() {
  return (
    <Page title="Publish Alert">
      <Card>
        <Button>Publish Alert</Button>
      </Card>
    </Page>
  );
}

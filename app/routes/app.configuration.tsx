import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Layout, Page } from "@shopify/polaris";
import { AlertConfigForm } from "app/components/configuration/AlertConfigForm";
import { ConfigurationService } from "app/services/configuration.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const shopId = "12345678"; // Should come from auth context
  const configuration = await ConfigurationService.getConfiguration(shopId);
  return json({ configuration });
}

export async function action({ request }: ActionFunctionArgs) {
  const shopId = "12345678"; // Should come from auth context
  const data = Object.fromEntries(await request.formData());

  const configurationData = {
    shopId,
    productCreate: data.product_create === "true",
    productUpdate: data.product_update === "true",
    productDelete: data.product_delete === "true",
    signup: data.signup === "true",
    signin: data.signin === "true",
    checkout: data.checkout === "true",
    systemIssue: data.system_issue === "true",
  };

  await ConfigurationService.upsertConfiguration(configurationData);
  return json({ success: true });
}

export default function Configuration() {
  const { configuration } = useLoaderData<typeof loader>();

  return (
    <Page title="Configuration">
      <Layout>
        <Layout.Section>
          <AlertConfigForm initialConfiguration={configuration} />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

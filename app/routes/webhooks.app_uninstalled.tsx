import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import logger from "../utils/logger";

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("APP_UNINSTALLED webhook handler triggered");
  try {
    const { shop, session, topic } = await authenticate.webhook(request);

    console.log(`Processing ${topic} webhook for shop: ${shop}`);
    logger.info(`Processing ${topic} webhook for shop: ${shop}`);

    // Webhook requests can trigger multiple times and after an app has already been uninstalled.
    // If this webhook already ran, the session may have been deleted previously.
    if (session) {
      await db.session.deleteMany({ where: { shop } });
      console.log(`Successfully deleted session for ${shop}`);
      logger.info(`Successfully deleted session for ${shop}`);
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Error handling APP_UNINSTALLED webhook:", error);
    logger.error("Error handling APP_UNINSTALLED webhook:", error);
    return new Response(null, { status: 500 });
  }
};

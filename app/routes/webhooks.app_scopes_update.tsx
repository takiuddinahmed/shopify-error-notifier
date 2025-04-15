import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import logger from "../utils/logger";

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("APP_SUBSCRIPTIONS_UPDATE webhook handler triggered");
  try {
    const { payload, session, topic, shop } =
      await authenticate.webhook(request);
    console.log(`Processing ${topic} webhook for shop: ${shop}`);
    logger.info(`Processing ${topic} webhook for shop: ${shop}`);

    const current = payload.current as string[];
    if (session) {
      console.log(`Updating session scope for shop: ${shop}`);
      logger.info(`Updating session scope for shop: ${shop}`);

      await db.session.update({
        where: {
          id: session.id,
        },
        data: {
          scope: current.toString(),
        },
      });

      console.log(`Successfully updated session scope for shop: ${shop}`);
      logger.info(`Successfully updated session scope for shop: ${shop}`);
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Error handling APP_SUBSCRIPTIONS_UPDATE webhook:", error);
    logger.error("Error handling APP_SUBSCRIPTIONS_UPDATE webhook:", error);
    return new Response(null, { status: 500 });
  }
};

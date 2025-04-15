import { json, type ActionFunctionArgs } from "@remix-run/node";
import { authenticate, registerWebhooks } from "../shopify.server";
import logger from "../utils/logger";
import prisma from "../db.server";

/**
 * This route allows manual re-registration of webhooks
 * It can be triggered when webhooks aren't working
 */
export async function action({ request }: ActionFunctionArgs) {
  try {
    const { session } = await authenticate.admin(request);

    if (!session?.shop) {
      logger.error("No shop found in session for webhook registration");
      return json(
        { success: false, error: "No shop found in session" },
        { status: 400 },
      );
    }

    logger.info("Manual webhook registration requested", {
      shop: session.shop,
    });

    // Register the webhooks
    await registerWebhooks(session);

    // Update session to ensure it's active
    await prisma.session.update({
      where: { id: session.id },
      data: { state: "active" },
    });

    logger.info("Manual webhook registration completed", {
      shop: session.shop,
    });

    return json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Error in manual webhook registration", {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : "No stack trace",
    });

    return json({ success: false, error: errorMessage }, { status: 500 });
  }
}

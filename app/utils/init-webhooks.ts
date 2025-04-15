/**
 * This utility helps to ensure webhooks are registered on app startup
 * It checks the database for active sessions and attempts to register webhooks for them
 */

import prisma from "../db.server";
import { registerWebhooks } from "../shopify.server";
import logger from "./logger";

export async function ensureWebhooksRegistered() {
  if (process.env.NODE_ENV === "test") {
    return; // Skip in test environment
  }

  try {
    logger.info("Starting webhook verification on app startup");

    // Find all active sessions
    const activeSessions = await prisma.session.findMany({
      where: {
        // Only check sessions that are likely to be valid
        accessToken: {
          not: "",
        },
        expires: {
          // Only get sessions that haven't expired
          gt: new Date(),
        },
      },
      take: 100, // Limit to prevent overload
    });

    if (activeSessions.length === 0) {
      logger.info("No active sessions found for webhook registration");
      return;
    }

    logger.info(
      `Found ${activeSessions.length} active sessions, registering webhooks`,
    );

    // Register webhooks for each active session
    const results = await Promise.allSettled(
      activeSessions.map(async (dbSession) => {
        try {
          // Convert DB session to Shopify session format
          const session = {
            id: dbSession.id,
            shop: dbSession.shop,
            state: dbSession.state,
            isOnline: dbSession.isOnline,
            scope: dbSession.scope || "",
            expires: dbSession.expires,
            accessToken: dbSession.accessToken || "",
          };

          // Register webhooks for this session
          await registerWebhooks(session as any);
          logger.info(
            `Successfully registered webhooks for shop: ${session.shop}`,
          );
          return { success: true, shop: session.shop };
        } catch (error) {
          logger.error(
            `Failed to register webhooks for shop: ${dbSession.shop}`,
            {
              error: error instanceof Error ? error.message : String(error),
            },
          );
          return { success: false, shop: dbSession.shop, error };
        }
      }),
    );

    const successful = results.filter(
      (r) => r.status === "fulfilled" && (r.value as any).success,
    ).length;
    logger.info(
      `Webhook registration complete. Successfully registered for ${successful}/${activeSessions.length} shops`,
    );
  } catch (error) {
    logger.error("Error ensuring webhooks are registered:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}

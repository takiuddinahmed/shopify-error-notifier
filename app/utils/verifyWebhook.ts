import crypto from "crypto";

export function verifyWebhookHmac(body: string, hmac: string | null): boolean {
  if (!hmac) return false;

  const shopifyApiSecret = process.env.SHOPIFY_API_SECRET;
  if (!shopifyApiSecret) {
    console.error("Missing SHOPIFY_API_SECRET environment variable");
    return false;
  }

  const hash = crypto
    .createHmac("sha256", shopifyApiSecret)
    .update(body, "utf8")
    .digest("base64");

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmac));
}

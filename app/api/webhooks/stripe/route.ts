import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

function verifyStripeSignature(
  rawBody: string,
  sigHeader: string,
  secret: string
): boolean {
  if (!secret || !sigHeader) return false;
  try {
    const parts = Object.fromEntries(
      sigHeader.split(",").map((part) => {
        const [k, v] = part.split("=");
        return [k.trim(), v];
      })
    );
    const timestamp = parts.t;
    const signature = parts.v1;
    if (!timestamp || !signature) return false;

    const payloadToSign = `${timestamp}.${rawBody}`;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(payloadToSign, "utf8")
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const sigHeader = req.headers.get("stripe-signature") || "";

    if (STRIPE_WEBHOOK_SECRET) {
      const isValid = verifyStripeSignature(
        rawBody,
        sigHeader,
        STRIPE_WEBHOOK_SECRET
      );
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid Stripe signature" },
          { status: 400 }
        );
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event?.type as string | undefined;

    if (
      eventType === "checkout.session.completed" ||
      eventType === "customer.subscription.updated"
    ) {
      const obj = event.data?.object || {};
      const userId =
        obj.metadata?.user_id || obj.client_reference_id || null;
      const planId = obj.metadata?.plan_id || "PARTY_PASS";

      const dbTier = planId === "PRO_HOST" ? "pro" : "party_pass";
      const passExpiresAt =
        planId === "PARTY_PASS"
          ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          : null;

      if (userId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        await fetch(
          `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`,
          {
            method: "PATCH",
            headers: {
              apikey: SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tier: dbTier,
              pass_expires_at: passExpiresAt,
              stripe_customer_id: obj.customer || null,
              updated_at: new Date().toISOString(),
            }),
          }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}

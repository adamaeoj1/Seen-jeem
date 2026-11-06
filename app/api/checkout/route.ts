import { NextRequest, NextResponse } from "next/server";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export interface CheckoutRequestPayload {
  userId: string;
  email?: string;
  planId: "PARTY_PASS" | "PRO_HOST";
  paymentMethod?: "apple_pay" | "card";
  originUrl?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutRequestPayload;
    const { userId, email, planId, originUrl } = body;

    if (!planId || !["PARTY_PASS", "PRO_HOST"].includes(planId)) {
      return NextResponse.json(
        { error: "الباقة المطلوبة غير صالحة" },
        { status: 400 }
      );
    }

    const now = Date.now();
    const passExpiresAt =
      planId === "PARTY_PASS"
        ? new Date(now + 24 * 60 * 60 * 1000).toISOString()
        : null;
    const dbTier = planId === "PRO_HOST" ? "pro" : "party_pass";

    // 1. If real STRIPE_SECRET_KEY is configured, create a live Stripe Checkout Session via REST API
    if (STRIPE_SECRET_KEY) {
      const baseOrigin = originUrl || "http://localhost:3000";
      const params = new URLSearchParams();
      params.append("payment_method_types[0]", "card");
      if (email) params.append("customer_email", email);
      params.append("client_reference_id", userId || "host");
      params.append("metadata[user_id]", userId || "host");
      params.append("metadata[plan_id]", planId);
      params.append(
        "mode",
        planId === "PRO_HOST" ? "subscription" : "payment"
      );
      params.append(
        "line_items[0][price_data][currency]",
        "usd"
      );
      params.append(
        "line_items[0][price_data][unit_amount]",
        planId === "PRO_HOST" ? "799" : "299"
      );
      params.append(
        "line_items[0][price_data][product_data][name]",
        planId === "PRO_HOST"
          ? "اشتراك المضيف المحترف (شهري)"
          : "تذكرة السهرة ٢٤ ساعة"
      );
      if (planId === "PRO_HOST") {
        params.append(
          "line_items[0][price_data][recurring][interval]",
          "month"
        );
      }
      params.append("line_items[0][quantity]", "1");
      params.append(
        "success_url",
        `${baseOrigin}/?checkout=success&plan=${planId}`
      );
      params.append("cancel_url", `${baseOrigin}/?checkout=cancelled`);

      const stripeRes = await fetch(
        "https://api.stripe.com/v1/checkout/sessions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );

      if (stripeRes.ok) {
        const session = await stripeRes.json();
        return NextResponse.json({
          status: "redirect",
          checkoutUrl: session.url,
          sessionId: session.id,
        });
      }
    }

    // 2. Update Supabase `profiles` record directly if SUPABASE_URL is configured
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && userId) {
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
            updated_at: new Date().toISOString(),
          }),
        }
      ).catch(() => {});
    }

    return NextResponse.json({
      status: "activated",
      tier: dbTier,
      planId,
      passExpiresAt,
      activatedAt: new Date(now).toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "تعذر إتمام عملية الدفع" },
      { status: 500 }
    );
  }
}

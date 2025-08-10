import { NextResponse } from "next/server";
import Stripe from "stripe";

type MonthKey = `${number}-${number}`; // YYYY-M

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Stripe not configured", code: "NO_STRIPE_KEY" },
      { status: 501 }
    );
  }

  try {
    const stripe = new Stripe(key, { apiVersion: "2024-10-28.acacia" as any });

    // Aggregate successful, paid, non-refunded charges (USD) across all time
    const monthly = new Map<MonthKey, number>(); // cents
    let totalCents = 0;

    const iter = stripe.charges.list({ limit: 100 });
    for await (const ch of (iter as any).autoPagingEach ? (iter as any) : (stripe.charges.list({ limit: 100 }) as any)) {
      const charge = ch as Stripe.Charge;
      if (charge.paid !== true) continue;
      if (charge.status !== "succeeded") continue;
      if (charge.currency !== "usd") continue; // keep currency consistent for display

      const amount = (charge.amount_captured ?? charge.amount) - (charge.amount_refunded ?? 0);
      if (amount <= 0) continue;

      totalCents += amount;

      const created = typeof charge.created === "number" ? charge.created : Math.floor((charge.created as any).getTime() / 1000);
      const d = new Date(created * 1000);
      const key: MonthKey = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`;
      monthly.set(key, (monthly.get(key) || 0) + amount);
    }

    // Format to last 12 months time series (UTC months)
    const now = new Date();
    const series: Array<{ label: string; cents: number }> = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const k: MonthKey = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`;
      const cents = monthly.get(k) || 0;
      const label = d.toLocaleString("en-US", { month: "short" });
      series.push({ label, cents });
    }

    return NextResponse.json({ currency: "usd", totalCents, series });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Stripe error" }, { status: 500 });
  }
}



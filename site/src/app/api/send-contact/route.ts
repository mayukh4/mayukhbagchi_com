import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    const to = "mayukh.bagchi@queensu.ca";

    // Use Resend HTTP API only
    const resendKey = (process.env.RESEND_API_KEY || process.env.SMTP_PASS) as string;
    const fromAddress = (process.env.RESEND_FROM as string) || (process.env.SMTP_FROM as string) || "";
    if (!resendKey || !fromAddress) {
      console.error("RESEND_API_KEY or RESEND_FROM missing");
      return NextResponse.json({ ok: false, error: "Email not configured" }, { status: 500 });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);
    const subject = `New message from ${name}`;
    const text = `From: ${name} <${email}>\n\n${message}`;

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject,
      text,
      reply_to: email,
    } as any);
    if (error) {
      console.error("Resend send error", error);
      return NextResponse.json({ ok: false, error: "Send failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id: (data as any)?.id });
  } catch (err) {
    console.error("send-contact error", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}



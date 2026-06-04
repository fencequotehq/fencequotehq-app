import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceKey) {
      const supabase = createClient(supabaseUrl, serviceKey)
      const { error } = await supabase.from("leads").insert({
  source: body.source || "FenceQuoteHQ",
  name: body.lead?.name,
  email: body.lead?.email,
  phone: body.lead?.phone,
  timeline: body.lead?.timeline,
  wants_quotes: body.lead?.quotes,
  zip: body.estimate?.zip,
  estimate_low: body.rawEstimate?.low,
  estimate_high: body.rawEstimate?.high,
  estimate_json: body
});

if (error) {
  console.error("Supabase insert error:", error);

  return NextResponse.json(
    {
      ok: false,
      error: error.message
    },
    { status: 500 }
  );
}
    }

    const resendKey = process.env.RESEND_API_KEY;
    const alertEmail = process.env.LEAD_ALERT_EMAIL;

    if (resendKey && alertEmail) {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "FenceQuoteHQ <onboarding@resend.dev>",
        to: alertEmail,
        subject: `New FenceQuoteHQ Lead - ${body.lead?.name || "Unknown"}`,
        html: `
          <h2>New FenceQuoteHQ Lead</h2>
          <p><b>Name:</b> ${body.lead?.name || ""}</p>
          <p><b>Email:</b> ${body.lead?.email || ""}</p>
          <p><b>Phone:</b> ${body.lead?.phone || ""}</p>
          <p><b>ZIP:</b> ${body.estimate?.zip || ""}</p>
          <p><b>Estimate:</b> ${body.estimate?.low || ""} - ${body.estimate?.high || ""}</p>
          <p><b>Timeline:</b> ${body.lead?.timeline || ""}</p>
        `
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "Unknown error" }, { status: 500 });
  }
}

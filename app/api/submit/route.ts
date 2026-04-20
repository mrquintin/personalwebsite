// POST /api/submit — receives form payloads from /demo, /investors, /waitlist.
//
// Env vars (all optional):
//   FORM_WEBHOOK_URL  — if set, the JSON payload is POSTed to this URL.
//                       Errors are swallowed so the user-facing request
//                       never fails on a downstream issue.
//   RESEND_API_KEY    — if set together with NOTIFY_TO_EMAIL, a plain-text
//                       summary is sent via Resend.
//   NOTIFY_TO_EMAIL   — destination address for the Resend summary.
//
// Without any env vars, submissions are still console.logged and the
// user receives { ok: true }.
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Payload = Record<string, string>;

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!body.source) {
    return NextResponse.json({ error: "missing_source" }, { status: 400 });
  }
  if (typeof body.email === "string" && !isEmail(body.email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const enriched: Payload = {
    ...body,
    _ua: req.headers.get("user-agent") ?? "",
    _ts: new Date().toISOString(),
  };

  console.log("[/api/submit]", enriched);

  // Optional webhook
  const hook = process.env.FORM_WEBHOOK_URL;
  if (hook) {
    void fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enriched),
    }).catch(() => { /* swallow */ });
  }

  // Optional email summary via Resend
  const key = process.env.RESEND_API_KEY;
  const to  = process.env.NOTIFY_TO_EMAIL;
  if (key && to) {
    const summary = Object.entries(enriched)
      .map(([k, v]) => `${k}: ${v}`).join("\n");
    void fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from: "The Nash Lab <noreply@nashlab.ai>",
        to: [to],
        subject: `[${enriched.source}] ${enriched.name ?? "(no name)"}`,
        text: summary,
      }),
    }).catch(() => { /* swallow */ });
  }

  return NextResponse.json({ ok: true });
}

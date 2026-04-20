// Manual route handler — Next's metadata-file convention loader breaks
// when the absolute filesystem path contains an apostrophe (e.g.
// "Michael's MacBook Pro"). This handler emits the same content.
export const runtime = "nodejs";

export function GET() {
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    "Sitemap: https://nashlab.ai/sitemap.xml",
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

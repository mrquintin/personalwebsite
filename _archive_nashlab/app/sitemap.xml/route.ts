// Manual route handler (see app/robots.txt/route.ts for why).
export const runtime = "nodejs";

const BASE = "https://nashlab.ai";
const ROUTES = ["/", "/architecture", "/company", "/investors", "/demo", "/waitlist"];

export function GET() {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = ROUTES.map((r) => `  <url><loc>${BASE}${r}</loc><lastmod>${lastmod}</lastmod></url>`).join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}

import { test, expect } from "@playwright/test";

// suite 22/P03 — deployed-environment smoke.
//
// Runs against an arbitrary URL via SMOKE_URL (or the playwright config
// baseURL when invoked locally). The suite is read-only by contract:
// it never POSTs anything that mutates state. The only POST is to
// /api/chat with a benign question, which is rate-limited and stateless.

const SEED_QUESTION =
  "What does the seed note in the corpus say?";

test.describe("deployed smoke", () => {
  test("GET / returns 200 and h1 is visible", async ({ page, request }) => {
    const res = await request.get("/");
    expect(res.status()).toBe(200);
    await page.goto("/");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("GET /projects renders three project cards", async ({
    page,
    request,
  }) => {
    const res = await request.get("/projects");
    expect(res.status()).toBe(200);
    await page.goto("/projects");
    const slugs = ["hivemind", "purposeless-efficiency", "theseus"] as const;
    for (const slug of slugs) {
      await expect(
        page.locator(`a[href="/projects/${slug}"]`).first(),
      ).toBeVisible();
    }
  });

  for (const slug of ["hivemind", "purposeless-efficiency", "theseus"]) {
    test(`GET /projects/${slug} returns 200`, async ({ request }) => {
      const res = await request.get(`/projects/${slug}`);
      expect(res.status()).toBe(200);
    });
  }

  test("GET /about returns 200", async ({ request }) => {
    const res = await request.get("/about");
    expect(res.status()).toBe(200);
  });

  test("GET /resume returns 200", async ({ request }) => {
    const res = await request.get("/resume");
    expect(res.status()).toBe(200);
  });

  test("GET /chat returns 200 and textarea is visible", async ({
    page,
    request,
  }) => {
    const res = await request.get("/chat");
    expect(res.status()).toBe(200);
    await page.goto("/chat");
    await expect(
      page.getByRole("textbox", { name: "Your question" }),
    ).toBeVisible();
  });

  test("GET /sitemap.xml returns 200 with xml content-type", async ({
    request,
  }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const ct = res.headers()["content-type"] ?? "";
    expect(ct.toLowerCase()).toContain("xml");
  });

  test("GET /robots.txt returns 200 and contains a Sitemap entry", async ({
    request,
  }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/Sitemap:/);
  });

  test("POST /api/chat streams at least one token (SSE)", async ({
    request,
  }) => {
    const res = await request.post("/api/chat", {
      data: {
        messages: [{ role: "user", content: SEED_QUESTION }],
      },
      headers: { "Content-Type": "application/json" },
      timeout: 60_000,
    });
    expect(res.status()).toBe(200);
    const ct = res.headers()["content-type"] ?? "";
    expect(ct.toLowerCase()).toContain("text/event-stream");
    const body = await res.text();
    // The stream is fully buffered by the time body() resolves; assert at
    // least one token frame is present. The route emits `event: token`
    // followed by a JSON-encoded data line for each token.
    expect(body).toMatch(/event:\s*token\r?\ndata:/);
  });
});

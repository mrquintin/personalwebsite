import { test, expect, type Route } from "@playwright/test";

const RESPONSE_TEXT = "This is a mocked answer from the LLM.";

function buildSseStream(): string {
  const tokens = ["This is ", "a mocked ", "answer ", "from the LLM."];
  const meta = {
    citations: [],
    usage: { inputTokens: 5, outputTokens: 4 },
    retrievedCount: 0,
  };
  const lines: string[] = [];
  for (const t of tokens) {
    lines.push(`event: token`);
    lines.push(`data: ${JSON.stringify(t)}`);
    lines.push("");
  }
  lines.push("event: meta");
  lines.push(`data: ${JSON.stringify(meta)}`);
  lines.push("");
  lines.push("event: done");
  lines.push("data: [DONE]");
  lines.push("");
  return lines.join("\n");
}

async function fulfillSse(route: Route): Promise<void> {
  await route.fulfill({
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
    body: buildSseStream(),
  });
}

test.describe("chat surface", () => {
  test("GET /chat returns 200", async ({ request }) => {
    const res = await request.get("/chat");
    expect(res.status()).toBe(200);
  });

  test("heading is visible", async ({ page }) => {
    await page.goto("/chat");
    await expect(
      page.getByRole("heading", { name: /Ask my LLM about my work/i }),
    ).toBeVisible();
  });

  test("chat region exposes the expected aria-label", async ({ page }) => {
    await page.goto("/chat");
    await expect(
      page.getByRole("region", { name: "Chat with the LLM" }),
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Your question" }),
    ).toBeVisible();
  });

  test("typing in textarea + clicking ask sends a request and renders response", async ({
    page,
  }) => {
    let capturedRequest: { body: unknown } | null = null;
    await page.route("**/api/chat", async (route) => {
      try {
        capturedRequest = { body: route.request().postDataJSON() };
      } catch {
        capturedRequest = { body: route.request().postData() };
      }
      await fulfillSse(route);
    });

    await page.goto("/chat");
    const input = page.getByRole("textbox", { name: "Your question" });
    await input.fill("hi there");
    await page.getByRole("button", { name: "ask" }).click();

    await expect(page.getByText(RESPONSE_TEXT)).toBeVisible({ timeout: 10_000 });
    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.body).toBeTruthy();
  });

  test("Enter submits, Shift+Enter inserts newline", async ({ page }) => {
    await page.route("**/api/chat", async (route) => {
      await fulfillSse(route);
    });

    await page.goto("/chat");
    const input = page.getByRole("textbox", { name: "Your question" });
    await input.click();
    await input.type("line one");
    await input.press("Shift+Enter");
    await input.type("line two");
    await expect(input).toHaveValue("line one\nline two");

    await input.press("Enter");
    await expect(page.getByText(RESPONSE_TEXT)).toBeVisible({ timeout: 10_000 });
  });

  test("clear button empties the message list", async ({ page }) => {
    await page.route("**/api/chat", async (route) => {
      await fulfillSse(route);
    });

    page.on("dialog", (dialog) => {
      void dialog.accept();
    });

    await page.goto("/chat");
    const input = page.getByRole("textbox", { name: "Your question" });
    await input.fill("hello");
    await page.getByRole("button", { name: "ask" }).click();

    await expect(page.getByText(RESPONSE_TEXT)).toBeVisible({ timeout: 10_000 });

    const clearBtn = page.getByRole("button", { name: "clear" });
    await expect(clearBtn).toBeEnabled();
    await clearBtn.click();

    await expect(page.getByText(RESPONSE_TEXT)).toHaveCount(0);
    await expect(page.getByText(/no messages yet/i)).toBeVisible();
  });
});

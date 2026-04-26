import { test, expect } from "@playwright/test";

// Minimal v2 smoke. Suites 15, 16, 19 add real e2e coverage as pages
// move out of stub state.

test("GET / returns 200", async ({ request }) => {
  const res = await request.get("/");
  expect(res.status()).toBe(200);
});

test("GET /about returns 200", async ({ request }) => {
  const res = await request.get("/about");
  expect(res.status()).toBe(200);
});

test("GET /resume returns 200", async ({ request }) => {
  const res = await request.get("/resume");
  expect(res.status()).toBe(200);
});

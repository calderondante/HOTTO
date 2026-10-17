import { test } from "node:test";
import assert from "node:assert/strict";
import { caseSeoPolicy, publicSiteOrigin } from "../src/lib/library/jurisprudence-seo.ts";

test("only an explicitly approved C analysis on the confirmed public origin is indexable", () => {
  const origin = publicSiteOrigin("https://hotto.example.org");
  assert.equal(origin, "https://hotto.example.org");
  assert.deepEqual(caseSeoPolicy("fallo-real", { demo: false, level: "C", state: "approved", approvedAt: "2026-10-16T00:00:00Z" }, origin),
    { index: true, canonical: "https://hotto.example.org/biblioteca/jurisprudencia/fallo-real" });
  for (const [level, state, approvedAt, demo] of [
    ["A", "approved", "2026-10-16", false],
    ["B", "approved", "2026-10-16", false],
    ["C", "review", "2026-10-16", false],
    ["C", "approved", null, false],
    ["C", "approved", "2026-10-16", true],
  ] as const) {
    assert.deepEqual(caseSeoPolicy("fallo-real", { demo, level, state, approvedAt }, origin), { index: false, canonical: null });
  }
  assert.equal(caseSeoPolicy("fallo-real", { demo: false, level: "C", state: "approved", approvedAt: "2026-10-16" }, null).index, false);
});

test("unconfigured, preview and Supabase origins cannot enable SEO", () => {
  for (const input of ["", "http://localhost:3000", "https://trkoraszozabtywkfvin.supabase.co", "https://user:pass@example.org", "https://example.org/preview"]) {
    assert.equal(publicSiteOrigin(input), null);
  }
});

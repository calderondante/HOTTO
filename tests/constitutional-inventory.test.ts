import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const inventory = JSON.parse(readFileSync(new URL("../data/research/constitutional-cases.json", import.meta.url), "utf8"));
type Item = { id: string; editorial_status: string; seo_level: string; official_url: string | null; subject_codes: string[]; reading_sources: { academic_program_confirmed: boolean }[]; verification: unknown; date: string | null; title: string | null; docket: string | null; notes: string | null };
const cases: Item[] = inventory.cases;
test("constitutional research is draft-only, deduplicates repeated readings and never invents programs", () => {
  assert.equal(new Set(cases.map((item) => item.id)).size, cases.length);
  assert.equal(cases.filter((item) => item.id === "giroldi").length, 1);
  assert.deepEqual(cases.find((item) => item.id === "hooft")?.subject_codes, ["2304", "2314"]);
  for (const item of cases) {
    assert.equal(item.editorial_status, "draft"); assert.equal(item.seo_level, "A");
    assert(item.subject_codes.every((code) => ["2304", "2314"].includes(code)));
    assert(item.reading_sources.length > 0);
    assert(item.reading_sources.every((source) => source.academic_program_confirmed === false));
    if (item.verification) { assert(item.title && item.date && item.docket && item.official_url); assert(["www.cij.gov.ar", "sjconsulta.csjn.gov.ar", "www.saij.gob.ar"].includes(new URL(item.official_url).hostname)); }
  }
  assert.equal(cases.filter((item) => item.verification).length, 13);
  assert.match(cases.find((item) => item.id === "duarte")?.notes ?? "", /No usar ese PDF/);
  assert.equal(cases.find((item) => item.id === "ate")?.date, null);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { marburyExample, searchMarburyExample } from "../src/lib/library/jurisprudence-example.ts";
import type { CaseQuery } from "../src/lib/library/jurisprudence.ts";

const query: CaseQuery = {
  q: "Marbury",
  subject: "2304",
  court: "",
  year: 1803,
  jurisdiction: "",
  page: 1,
};

test("the separate historical preview searches by case, subject and year", () => {
  assert.equal(searchMarburyExample(query).total, 1);
  assert.equal(searchMarburyExample({ ...query, q: "madison" }).items[0]?.id, marburyExample.id);
  assert.equal(searchMarburyExample({ ...query, q: "control constitucional" }).total, 0);
  assert.equal(searchMarburyExample({ ...query, subject: "2340" }).total, 0);
  assert.equal(searchMarburyExample({ ...query, year: 1804 }).total, 0);
  assert.equal(searchMarburyExample({ ...query, court: "Otro tribunal" }).total, 0);
});

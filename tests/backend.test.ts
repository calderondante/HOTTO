import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PDFDocument } from "pdf-lib";
import { supabaseConfig, libraryMode } from "../src/lib/supabase/config.ts";
import {
  workPayload,
  httpsUrl,
  date,
  uuid,
} from "../src/lib/admin/validation.ts";
import { validatePdf, maxPdfBytes } from "../src/lib/admin/pdf.ts";
import { pdfRange } from "../src/lib/library/range.ts";
import { boundedJson } from "../src/lib/admin/body.ts";
import { hasTrustedOrigin } from "../src/lib/admin/origin.ts";
test("configuration is explicit and privileged keys are rejected", () => {
  assert.equal(supabaseConfig({}), null);
  assert.equal(libraryMode({}), "demo");
  assert.equal(libraryMode({ HOTTO_DATA_SOURCE: "supabase" }), "supabase");
  assert.equal(
    supabaseConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_secret_fixture",
    }),
    null,
  );
  assert.equal(
    supabaseConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://user:password@example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_fixture",
    }),
    null,
  );
  assert.equal(
    libraryMode({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_fixture",
    }),
    "supabase",
  );
});
test("metadata cannot assign publication, admin privileges or demo flags", () => {
  const id = "00000000-0000-4000-8001-000000002340";
  const parsed = workPayload({
    title: "Libro",
    slug: "libro",
    kind: "book",
    subject_ids: [id, id],
    author_ids: [],
    editorial_status: "published",
    demo: true,
    library_role: "admin",
  });
  assert.deepEqual(parsed.subject_ids, [id]);
  assert(!("editorial_status" in parsed));
  assert(!("library_role" in parsed));
  assert(!("demo" in parsed));
  assert.throws(() =>
    workPayload({ title: "Libro", slug: "../../file", kind: "book" }),
  );
  assert.throws(() => uuid("not-a-uuid"));
});
test("external links and dates reject dangerous or impossible values", () => {
  assert.throws(() => httpsUrl("javascript:alert(1)"));
  assert.throws(() => httpsUrl("https://user:password@example.com"));
  assert.equal(
    httpsUrl("https://example.com/documento"),
    "https://example.com/documento",
  );
  assert.throws(() => date("2026-02-31"));
  assert.equal(date("2026-02-28"), "2026-02-28");
});
test("actual original PDFs parse and produce deterministic integrity metadata", async () => {
  const bytes = readFileSync("public/documentos/primeras-preguntas-demo.pdf");
  const first = await validatePdf(bytes),
    second = await validatePdf(bytes);
  assert.equal(first.pages, 1);
  assert.equal(first.bytes, bytes.length);
  assert.match(first.sha256, /^[a-f0-9]{64}$/);
  assert.deepEqual(first, second);
});
test("upload rejects non-PDF, malformed data, excessive size and JavaScript actions", async () => {
  await assert.rejects(
    validatePdf(new Uint8Array(Buffer.from("<html>not a PDF</html>"))),
  );
  await assert.rejects(
    validatePdf(new Uint8Array(Buffer.from("%PDF-1.4 malformed"))),
  );
  await assert.rejects(validatePdf(new Uint8Array(maxPdfBytes + 1)));
  const doc = await PDFDocument.create();
  doc.addPage();
  doc.addJavaScript("test", 'app.alert("test fixture")');
  await assert.rejects(validatePdf(await doc.save()));
});
test("PDF Range requests support bounded/resumable reads and reject injection", () => {
  assert.equal(pdfRange("bytes=0-1023"), "bytes=0-1023");
  assert.equal(pdfRange("bytes=1024-"), "bytes=1024-");
  assert.equal(pdfRange("bytes=-1024"), "bytes=-1024");
  assert.equal(pdfRange(null), undefined);
  for (const range of [
    "bytes=8-2",
    "bytes=-0",
    "bytes=0-2,5-6",
    "bytes=0-2\r\nx-header:bad",
    "bytes=999999999999999999999-",
  ])
    assert.throws(() => pdfRange(range));
});
test("JSON input limits are enforced even without Content-Length", async () => {
  const request = (body: string, type = "application/json") =>
    new Request("http://localhost/form", {
      method: "POST",
      headers: { "content-type": type },
      body,
    });
  assert.deepEqual(await boundedJson(request('{"title":"Libro"}'), 50), {
    title: "Libro",
  });
  await assert.rejects(
    boundedJson(request('"' + "x".repeat(51) + '"'), 50),
    /BODY_TOO_LARGE/,
  );
  await assert.rejects(boundedJson(request("bad"), 50), SyntaxError);
  await assert.rejects(
    boundedJson(request("{}", "text/plain"), 50),
    /JSON_REQUIRED/,
  );
});
test("CSRF origin checks handle Next internal host normalization and trusted HTTPS deployment", () => {
  const request = (origin: string, host = "127.0.0.1:3000") =>
    new Request("http://localhost:3000/api/admin/work", {
      headers: { origin, host, "x-forwarded-host": "evil.example" },
    });
  assert(hasTrustedOrigin(request("http://127.0.0.1:3000")));
  assert(!hasTrustedOrigin(request("https://evil.example")));
  assert(!hasTrustedOrigin(request("null")));
  assert(
    hasTrustedOrigin(request("https://hotto.example"), "https://hotto.example"),
  );
  assert(
    !hasTrustedOrigin(request("https://evil.example"), "https://hotto.example"),
  );
  assert(
    !hasTrustedOrigin(
      request("https://hotto.example"),
      "https://user:password@hotto.example",
    ),
  );
});

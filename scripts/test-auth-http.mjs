import assert from "node:assert/strict";
const base = process.env.HOTTO_TEST_URL || "http://localhost:3120";
assert(["localhost", "127.0.0.1"].includes(new URL(base).hostname), "Use a local server only.");
const post = (body, origin = base) => fetch(`${base}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(body), redirect: "manual" });
// This address must remain outside HOTTO_ADMIN_EMAILS. No authorized email is sent.
let r = await post({ email: "not-authorized@example.invalid" });
assert.equal(r.status, 200, "Configure HOTTO_SITE_ORIGIN to this origin and HOTTO_ADMIN_EMAILS before the smoke test.");
assert.deepEqual(await r.json(), { ok: true });
assert.match(r.headers.get("cache-control"), /no-store/);
assert.equal((await post({ email: "bad" })).status, 400);
assert.equal((await post({ email: "not-authorized@example.invalid" }, "https://evil.invalid")).status, 403);
for (const suffix of ["", "?code=00000000-0000-0000-0000-000000000000", "?code=short&next=https://evil.invalid", "?error=access_denied", "?code=short&code=duplicate"]) {
  r = await fetch(`${base}/api/auth/callback${suffix}`, { redirect: "manual" });
  assert.equal(r.status, 303);
  assert.equal(r.headers.get("location"), `${base}/admin/login?status=invalid`);
  assert.match(r.headers.get("cache-control"), /no-store/);
  assert.equal(r.headers.get("referrer-policy"), "no-referrer");
}
r = await fetch(`${base}/admin`, { redirect: "manual" });
assert([303, 307].includes(r.status));
assert.equal(new URL(r.headers.get("location"), base).pathname, "/admin/login");
assert.equal((await fetch(`${base}/api/admin/options`)).status, 401);
for (const entity of ["work", "status", "permission", "document"]) {
  r = await fetch(`${base}/api/admin/${entity}`, { method: "POST", headers: { Origin: base, "Content-Type": "application/json" }, body: "{}" });
  assert.equal(r.status, 401);
}
r = await fetch(`${base}/api/admin/upload`, { method: "POST", headers: { Origin: base }, body: new FormData() });
assert.equal(r.status, 401);
console.log("PASS: unlisted Magic Link request, validation, CSRF, callback rejection/fixed redirects, anonymous admin reads/writes/upload. No email or document created.");

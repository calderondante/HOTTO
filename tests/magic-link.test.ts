import test from "node:test";
import assert from "node:assert/strict";
import { authOrigin, sessionCookieOptions, allowedAdminEmail, requestMagicLink, completeMagicLink, type MagicAuthClient } from "../src/lib/admin/magic-link.ts";
const email = "owner@example.org";
function fixture({ exchangeError = false, member = true, userEmail = email, membershipError = false } = {}) {
  const calls: string[] = [];
  let otp: unknown;
  const client: MagicAuthClient = {
    auth: {
      async signInWithOtp(input) { calls.push("otp"); otp = input; return { error: null }; },
      async exchangeCodeForSession() { calls.push("exchange"); return { error: exchangeError ? Error() : null }; },
      async getUser() { calls.push("verify"); return { error: null, data: { user: { email: userEmail } } }; },
      async signOut() { calls.push("signout"); return { error: null }; },
    },
    async rpc() { calls.push("membership"); return { error: membershipError ? Error() : null, data: member }; },
  };
  return { client, calls, otp: () => otp };
}
test("auth redirects require a fixed HTTPS origin or local HTTP, without credentials, path or query", () => {
  for (const value of ["", "javascript:alert(1)", "https://u:p@example.org", "https://example.org/callback", "https://example.org?next=evil", "http://example.org", "https://example.org#x"]) assert.equal(authOrigin(value), null);
  assert.equal(authOrigin("https://hotto.example/"), "https://hotto.example");
  assert.equal(authOrigin("http://localhost:3000"), "http://localhost:3000");
  assert(!allowedAdminEmail(email, ""));
  assert(allowedAdminEmail(email, " OTHER@example.org, Owner@Example.org "));
});
test("unlisted requests never call Auth; listed requests cannot create accounts or select redirects", async () => {
  const f = fixture();
  await requestMagicLink(f.client, "stranger@example.org", "https://hotto.example", email);
  assert.deepEqual(f.calls, []);
  await requestMagicLink(f.client, email, "https://hotto.example", email);
  assert.deepEqual(f.otp(), { email, options: { shouldCreateUser: false, emailRedirectTo: "https://hotto.example/api/auth/callback" } });
});
test("callback verifies live user and membership, clearing session on expired codes, revoked access and failures", async () => {
  for (const options of [{ exchangeError: true }, { member: false }, { userEmail: "stranger@example.org" }, { membershipError: true }]) {
    const f = fixture(options);
    assert.equal(await completeMagicLink(f.client, "one-time-code", email), false);
    assert.equal(f.calls.at(-1), "signout");
  }
  const f = fixture();
  assert.equal(await completeMagicLink(f.client, "one-time-code", email), true);
  assert.deepEqual(f.calls, ["exchange", "verify", "membership"]);
});

test("SSR cookies remain HTTPOnly/Lax and secure on HTTPS, while local HTTP can complete PKCE", () => {
  assert.deepEqual(sessionCookieOptions({ HOTTO_SITE_ORIGIN: "https://hotto.example" }), { httpOnly: true, sameSite: "lax", secure: true, path: "/" });
  assert.equal(sessionCookieOptions({ HOTTO_SITE_ORIGIN: "http://localhost:3000", NODE_ENV: "production" }).secure, false);
  assert.equal(sessionCookieOptions({ NODE_ENV: "production" }).secure, true);
});

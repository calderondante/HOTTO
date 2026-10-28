import test from "node:test";
import assert from "node:assert/strict";
import { OtpLimiter, OtpFailure, requestOtpCode, verifyEmailCode, type OtpClient } from "../src/lib/admin/otp.ts";
const email = "owner@example.org";
function fixture({ member = true, authError = null as { status?: number; code?: string } | null } = {}) {
  const calls: unknown[] = [];
  const client: OtpClient = {
    auth: {
      async signInWithOtp(data) { calls.push(data); return { error: authError }; },
      async verifyOtp(data) { calls.push(data); return { error: authError }; },
      async getUser() { return { error: null, data: { user: { email } } }; },
      async signOut() { calls.push("signout"); return { error: null }; },
    },
    async rpc() { return { error: null, data: member }; },
  };
  return { client, calls };
}
test("OTP requests prohibit signup and silently skip unauthorized addresses", async () => {
  const f = fixture(), limiter = new OtpLimiter();
  await requestOtpCode(f.client, "stranger@example.org", email, limiter);
  assert.deepEqual(f.calls, []);
  await requestOtpCode(f.client, email, email, limiter);
  assert.deepEqual(f.calls, [{ email, options: { shouldCreateUser: false } }]);
  await assert.rejects(requestOtpCode(f.client, email, email, limiter), (e: unknown) => e instanceof OtpFailure && e.status === 429);
});
test("OTP preserves leading zeroes and verifies live admin membership after email verification", async () => {
  const f = fixture();
  await verifyEmailCode(f.client, email, "012345", email, new OtpLimiter());
  assert.deepEqual(f.calls, [{ email, token: "012345", type: "email" }]);
  const denied = fixture({ member: false });
  await assert.rejects(verifyEmailCode(denied.client, email, "012345", email, new OtpLimiter()), (e: unknown) => e instanceof OtpFailure && e.status === 403);
  assert.equal(denied.calls.at(-1), "signout");
});
test("OTP rejects invalid lengths/characters before Auth and maps expiry and provider quotas", async () => {
  const f = fixture();
  for (const code of ["12345", "1234567", "abcdef"]) await assert.rejects(verifyEmailCode(f.client, email, code, email, new OtpLimiter()));
  assert.deepEqual(f.calls, []);
  await assert.rejects(verifyEmailCode(fixture({ authError: { status: 403, code: "otp_expired" } }).client, email, "123456", email, new OtpLimiter()), (e: unknown) => e instanceof OtpFailure && e.status === 401);
  await assert.rejects(requestOtpCode(fixture({ authError: { status: 429 } }).client, email, email, new OtpLimiter()), (e: unknown) => e instanceof OtpFailure && e.status === 429);
});
test("OTP instance limit allows five verifications per ten minutes, resend cannot reset attempts", () => {
  let now = 0; const limiter = new OtpLimiter(() => now);
  limiter.send(email);
  for (let i = 0; i < 5; i++) limiter.verify(email);
  assert.throws(() => limiter.verify(email));
  now = 60_000; limiter.send(email);
  assert.throws(() => limiter.verify(email));
  now = 600_001; assert.doesNotThrow(() => limiter.verify(email));
});

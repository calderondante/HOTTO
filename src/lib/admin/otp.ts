import { createHash } from "node:crypto";
import { allowedAdminEmail } from "./magic-link.ts";
export interface OtpError { status?: number; code?: string }
export interface OtpClient {
  auth: {
    signInWithOtp(input: { email: string; options: { shouldCreateUser: false } }): PromiseLike<{ error: OtpError | null }>;
    verifyOtp(input: { email: string; token: string; type: "email" }): PromiseLike<{ error: OtpError | null }>;
    getUser(): PromiseLike<{ error: unknown; data: { user: { email?: string } | null } }>;
    signOut(options: { scope: "local" }): PromiseLike<{ error: unknown }>;
  };
  rpc(name: "is_library_editor"): PromiseLike<{ error: unknown; data: unknown }>;
}
export class OtpFailure extends Error {
  status: number;
  retryAfter: number;
  constructor(status: number, message: string, retryAfter = 0) { super(message); this.status = status; this.retryAfter = retryAfter; }
}
// Additional best-effort instance limits; Supabase remains the distributed rate authority.
export class OtpLimiter {
  private entries = new Map<string, { sent: number; until: number; attempts: number }>();
  private now: () => number;
  constructor(now = () => Date.now()) { this.now = now; }
  private entry(email: string) {
    const key = createHash("sha256").update(email).digest("hex");
    const now = this.now();
    for (const [k, v] of this.entries) if (v.until <= now) this.entries.delete(k);
    let entry = this.entries.get(key);
    if (!entry) {
      if (this.entries.size >= 1000) throw new OtpFailure(429, "Hay demasiadas solicitudes. Reintentá más tarde.", 60);
      entry = { sent: -Infinity, until: now + 600_000, attempts: 0 }; this.entries.set(key, entry);
    }
    return entry;
  }
  send(email: string) {
    const e = this.entry(email), seconds = Math.ceil((60_000 - (this.now() - e.sent)) / 1000);
    if (seconds > 0) throw new OtpFailure(429, "Esperá un minuto antes de solicitar otro código.", seconds);
    e.sent = this.now();
  }
  verify(email: string) {
    const e = this.entry(email);
    if (e.attempts >= 5) throw new OtpFailure(429, "Se alcanzó el límite de intentos. Esperá diez minutos antes de volver a intentar.", Math.ceil((e.until - this.now()) / 1000));
    e.attempts++;
  }
}
export const otpLimiter = new OtpLimiter();
export async function requestOtpCode(client: OtpClient, email: string, list?: string, limiter = otpLimiter) {
  if (!allowedAdminEmail(email, list)) return;
  limiter.send(email);
  const { error } = await client.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
  if (error?.status === 429 || error?.code === "over_email_send_rate_limit") throw new OtpFailure(429, "El proveedor alcanzó su límite de correos. Esperá antes de reintentar; cambiar a código no elimina esta cuota.", 60);
  if (error) throw new OtpFailure(503, "No pudimos enviar el código. Reintentá más tarde.");
}
export async function verifyEmailCode(client: OtpClient, email: string, token: string, list?: string, limiter = otpLimiter) {
  if (!/^[0-9]{6}$/.test(token) || !allowedAdminEmail(email, list)) throw new OtpFailure(401, "Código incorrecto, vencido o cuenta sin acceso.");
  limiter.verify(email);
  const { error } = await client.auth.verifyOtp({ email, token, type: "email" });
  if (error?.status === 429) throw new OtpFailure(429, "Se alcanzó el límite de intentos de Supabase. Reintentá más tarde.", 60);
  if (error) throw new OtpFailure(error.status && error.status >= 500 ? 503 : 401, "Código incorrecto o vencido. Revisalo o solicitá uno nuevo.");
  try {
    const user = await client.auth.getUser();
    if (user.error || user.data.user?.email?.toLowerCase() !== email || !allowedAdminEmail(user.data.user.email, list)) throw Error("DENIED");
    const membership = await client.rpc("is_library_editor");
    if (membership.error || membership.data !== true) throw Error("DENIED");
  } catch {
    await client.auth.signOut({ scope: "local" });
    throw new OtpFailure(403, "Esta cuenta no tiene acceso administrativo activo.");
  }
}

// Server configuration only. This list permits requesting email, never database access.
export function authOrigin(value = process.env.HOTTO_SITE_ORIGIN): string | null {
  try {
    const u = new URL(value ?? "");
    if (u.username || u.password || u.pathname !== "/" || u.search || u.hash) return null;
    if (u.protocol !== "https:" && !(u.protocol === "http:" && ["localhost", "127.0.0.1"].includes(u.hostname))) return null;
    return u.origin;
  } catch { return null; }
}
export function allowedAdminEmail(email: string, list = process.env.HOTTO_ADMIN_EMAILS): boolean {
  return Boolean(list?.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean).includes(email.trim().toLowerCase()));
}
export function sessionCookieOptions(env: Record<string, string | undefined> = process.env) {
  return { httpOnly: true, sameSite: "lax" as const, secure: authOrigin(env.HOTTO_SITE_ORIGIN)?.startsWith("https:") ?? env.NODE_ENV === "production", path: "/" };
}
export interface MagicAuthClient {
  auth: {
    signInWithOtp(input: { email: string; options: { shouldCreateUser: false; emailRedirectTo: string } }): PromiseLike<{ error: unknown }>;
    exchangeCodeForSession(code: string): PromiseLike<{ error: unknown }>;
    getUser(): PromiseLike<{ error: unknown; data: { user: { email?: string } | null } }>;
    signOut(options: { scope: "local" }): PromiseLike<{ error: unknown }>;
  };
  rpc(name: "is_library_editor"): PromiseLike<{ error: unknown; data: unknown }>;
}
export async function requestMagicLink(client: MagicAuthClient, email: string, origin: string, list?: string) {
  if (!allowedAdminEmail(email, list)) return; // Same response for absent/unauthorized accounts.
  const { error } = await client.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: `${origin}/api/auth/callback` } });
  if (error) throw Error("MAGIC_LINK_UNAVAILABLE");
}
export async function completeMagicLink(client: MagicAuthClient, code: string, list?: string): Promise<boolean> {
  try {
    if ((await client.auth.exchangeCodeForSession(code)).error) throw Error("INVALID_CODE");
    const verified = await client.auth.getUser();
    if (verified.error || !verified.data.user?.email || !allowedAdminEmail(verified.data.user.email, list)) throw Error("UNAUTHORIZED");
    const membership = await client.rpc("is_library_editor");
    if (membership.error || membership.data !== true) throw Error("UNAUTHORIZED");
    return true;
  } catch {
    await client.auth.signOut({ scope: "local" });
    return false;
  }
}

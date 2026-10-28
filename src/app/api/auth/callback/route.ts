import { NextResponse } from "next/server";
import { sessionClient } from "@/lib/supabase/server";
import { authOrigin, completeMagicLink } from "@/lib/admin/magic-link";
export async function GET(request: Request) {
  const origin = authOrigin();
  const headers = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" };
  if (!origin) return new Response("Acceso por correo sin configurar.", { status: 503, headers });
  const params = new URL(request.url).searchParams;
  const codes = params.getAll("code");
  let ok = false;
  if (!params.has("error") && codes.length === 1 && /^[a-zA-Z0-9_-]{16,2048}$/.test(codes[0])) {
    try { ok = await completeMagicLink(await sessionClient(), codes[0]); } catch { /* Fail closed on Auth/network errors. */ }
  }
  // Fixed same-site destinations: never accept a caller-controlled next/redirect URL.
  return NextResponse.redirect(new URL(ok ? "/admin" : "/admin/login?status=invalid", origin), { status: 303, headers });
}

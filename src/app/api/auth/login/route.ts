import { requestOtpCode, OtpFailure } from "@/lib/admin/otp";
import { sameOrigin, AdminError, apiError } from "@/lib/admin/auth";
import { sessionClient } from "@/lib/supabase/server";
import { supabaseConfig } from "@/lib/supabase/config";
import { boundedJson } from "@/lib/admin/body";
import { record, text } from "@/lib/admin/validation";
import { authOrigin } from "@/lib/admin/magic-link";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const origin = authOrigin();
    if (!supabaseConfig() || !origin || !process.env.HOTTO_ADMIN_EMAILS?.trim())
      throw new AdminError(503, "El acceso por código todavía no está configurado.");
    const body = record(await boundedJson(request, 2048));
    const email = text(body.email, 3, 254).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new AdminError(400, "Revisá el correo electrónico.");
    await requestOtpCode(await sessionClient(), email);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof OtpFailure) return Response.json({ error: error.message, retryAfter: error.retryAfter }, { status: error.status, headers: { "Cache-Control": "private, no-store", ...(error.retryAfter ? { "Retry-After": String(error.retryAfter) } : {}) } });
    return apiError(error);
  }
}

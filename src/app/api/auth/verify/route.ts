import { sameOrigin, AdminError, apiError } from "@/lib/admin/auth";
import { boundedJson } from "@/lib/admin/body";
import { record, text } from "@/lib/admin/validation";
import { sessionClient } from "@/lib/supabase/server";
import { authOrigin } from "@/lib/admin/magic-link";
import { OtpFailure, verifyEmailCode } from "@/lib/admin/otp";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    if (!authOrigin() || !process.env.HOTTO_ADMIN_EMAILS?.trim()) throw new AdminError(503, "El acceso por código no está configurado.");
    const body = record(await boundedJson(request, 2048));
    const email = text(body.email, 3, 254).trim().toLowerCase();
    const token = text(body.token, 6, 6);
    await verifyEmailCode(await sessionClient(), email, token);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof OtpFailure) return Response.json({ error: error.message, retryAfter: error.retryAfter }, { status: error.status, headers: { "Cache-Control": "private, no-store", ...(error.retryAfter ? { "Retry-After": String(error.retryAfter) } : {}) } });
    return apiError(error);
  }
}

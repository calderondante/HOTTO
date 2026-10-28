import { sameOrigin, AdminError, apiError } from "@/lib/admin/auth";
import { sessionClient } from "@/lib/supabase/server";
import { supabaseConfig } from "@/lib/supabase/config";
import { boundedJson } from "@/lib/admin/body";
import { record, text } from "@/lib/admin/validation";
import { authOrigin, requestMagicLink } from "@/lib/admin/magic-link";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const origin = authOrigin();
    if (!supabaseConfig() || !origin || !process.env.HOTTO_ADMIN_EMAILS?.trim())
      throw new AdminError(503, "El acceso por correo todavía no está configurado.");
    const body = record(await boundedJson(request, 2048));
    const email = text(body.email, 3, 254).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new AdminError(400, "Revisá el correo electrónico.");
    try { await requestMagicLink(await sessionClient(), email, origin); }
    catch { throw new AdminError(503, "No pudimos solicitar el enlace. Esperá un minuto y reintentá."); }
    return Response.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return apiError(error); }
}

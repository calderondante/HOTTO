import { sameOrigin, AdminError, apiError } from "@/lib/admin/auth";
import { sessionClient } from "@/lib/supabase/server";
import { supabaseConfig } from "@/lib/supabase/config";
import { boundedJson } from "@/lib/admin/body";
import { record, text } from "@/lib/admin/validation";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    if (!supabaseConfig())
      throw new AdminError(503, "Supabase todavía no está conectado.");
    const body = record(await boundedJson(request, 2048)),
      email = text(body.email, 3, 254);
    if (
      !email.includes("@") ||
      typeof body.password !== "string" ||
      body.password.length < 8 ||
      body.password.length > 256
    )
      throw new AdminError(400, "Revisá el correo y la contraseña.");
    const client = await sessionClient();
    const result = await client.auth.signInWithPassword({
      email,
      password: body.password,
    });
    if (result.error)
      throw new AdminError(
        401,
        "Credenciales inválidas o cuenta no habilitada.",
      );
    const verified = await client.auth.getUser(),
      membership = await client.rpc("is_library_editor");
    if (
      verified.error ||
      !verified.data.user ||
      membership.error ||
      membership.data !== true
    ) {
      await client.auth.signOut({ scope: "local" });
      throw new AdminError(
        403,
        "Esta cuenta no tiene acceso administrativo activo.",
      );
    }
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}

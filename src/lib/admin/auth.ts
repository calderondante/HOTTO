import "server-only";
import { sessionClient } from "@/lib/supabase/server";
import { supabaseConfig } from "@/lib/supabase/config";
import { hasTrustedOrigin } from "./origin";
export class AdminError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function requireAdmin() {
  if (!supabaseConfig())
    throw new AdminError(
      503,
      "El proyecto Supabase todavía no está conectado.",
    );
  const client = await sessionClient();
  const { data, error } = await client.auth.getUser();
  if (
    error &&
    (error.name === "AuthRetryableFetchError" || (error.status ?? 0) >= 500)
  )
    throw new AdminError(503, "No pudimos consultar Supabase Auth. Reintentá.");
  if (error || !data.user)
    throw new AdminError(401, "Iniciá sesión para continuar.");
  const access = await client.rpc("is_library_editor");
  if (access.error)
    throw new AdminError(
      503,
      "No pudimos comprobar los permisos administrativos.",
    );
  if (access.data !== true)
    throw new AdminError(
      403,
      "Esta cuenta no tiene acceso administrativo activo.",
    );
  return { client, user: data.user };
}
export function sameOrigin(request: Request) {
  if (!hasTrustedOrigin(request, process.env.HOTTO_SITE_ORIGIN))
    throw new AdminError(403, "Solicitud de otro origen rechazada.");
}
export function apiError(error: unknown) {
  if (error instanceof Error && error.message === "BODY_TOO_LARGE")
    error = new AdminError(413, "Solicitud demasiado grande.");
  if (error instanceof Error && error.message === "JSON_REQUIRED")
    error = new AdminError(415, "El formulario debe enviar datos JSON.");
  const details =
    error instanceof AdminError
      ? error
      : new AdminError(
          error instanceof SyntaxError ? 400 : 500,
          error instanceof SyntaxError
            ? "Revisá los datos del formulario."
            : "No pudimos completar la operación. Revisá los datos y reintentá.",
        );
  return Response.json(
    { error: details.message },
    {
      status: details.status,
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}

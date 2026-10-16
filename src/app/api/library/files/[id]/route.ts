import { publicClient } from "@/lib/supabase/server";
import { supabaseConfig } from "@/lib/supabase/config";
import { uuidPattern } from "@/lib/admin/validation";
import { pdfRange } from "@/lib/library/range";
export const runtime = "nodejs";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!uuidPattern.test(id)) return new Response(null, { status: 404 });
  if (!supabaseConfig())
    return new Response("Biblioteca remota no conectada.", { status: 503 });
  try {
    const range = pdfRange(request.headers.get("range")),
      c = publicClient();
    const file = await c.from("files").select("*").eq("id", id).maybeSingle();
    if (file.error)
      return new Response("No pudimos verificar el archivo.", { status: 503 });
    if (!file.data) return new Response(null, { status: 404 });
    const signed = await c.storage
      .from("library-private")
      .createSignedUrl(file.data.storage_path, 60);
    if (signed.error || !signed.data)
      return new Response("Archivo no disponible.", { status: 503 });
    const upstream = await fetch(signed.data.signedUrl, {
      headers: range ? { Range: range } : {},
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });
    if (![200, 206, 416].includes(upstream.status))
      return new Response("No pudimos abrir el PDF.", { status: 503 });
    const headers = new Headers({
      "Content-Type": "application/pdf",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": `${new URL(request.url).searchParams.get("descargar") === "1" ? "attachment" : "inline"}; filename="hotto-${id}.pdf"`,
    });
    for (const name of ["content-length", "content-range", "accept-ranges"]) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch (e) {
    return new Response(
      e instanceof Error && e.message === "RANGE_INVALID"
        ? "Rango inválido."
        : "No pudimos abrir el archivo.",
      {
        status: e instanceof Error && e.message === "RANGE_INVALID" ? 416 : 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}

import { requireAdmin, AdminError, apiError } from "@/lib/admin/auth";
import { uuidPattern } from "@/lib/admin/validation";
import { pdfRange } from "@/lib/library/range";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { client } = await requireAdmin();
    const { id } = await params;
    if (!uuidPattern.test(id))
      throw new AdminError(404, "Archivo no disponible.");
    const file = await client
      .from("files")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (file.error)
      throw new AdminError(503, "No pudimos consultar el archivo.");
    if (!file.data) throw new AdminError(404, "Archivo no disponible.");
    const signed = await client.storage
      .from("library-private")
      .createSignedUrl(file.data.storage_path, 60);
    if (signed.error || !signed.data)
      throw new AdminError(503, "No pudimos abrir el archivo privado.");
    const range = pdfRange(request.headers.get("range"));
    const response = await fetch(signed.data.signedUrl, {
      headers: range ? { Range: range } : {},
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });
    if (![200, 206, 416].includes(response.status))
      throw new AdminError(503, "Archivo privado no disponible.");
    const headers = new Headers({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    });
    for (const name of ["content-length", "content-range", "accept-ranges"]) {
      const value = response.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new Response(response.body, { status: response.status, headers });
  } catch (e) {
    return apiError(e);
  }
}

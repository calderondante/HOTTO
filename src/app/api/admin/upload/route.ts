import { randomUUID } from "node:crypto";
import {
  requireAdmin,
  sameOrigin,
  AdminError,
  apiError,
} from "@/lib/admin/auth";
import { uuid } from "@/lib/admin/validation";
import { validatePdf, maxPdfBytes } from "@/lib/admin/pdf";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const { client } = await requireAdmin();
    if (!request.headers.get("content-type")?.startsWith("multipart/form-data"))
      throw new AdminError(415, "Subí el archivo desde el formulario PDF.");
    // Bound the actual multipart stream, including requests without Content-Length.
    const length = Number(request.headers.get("content-length") || 0);
    if (length > maxPdfBytes + 16384)
      throw new AdminError(413, "El PDF debe pesar como máximo 25 MB.");
    if (!request.body) throw new AdminError(400, "No recibimos un archivo.");
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.length;
      if (size > maxPdfBytes + 16384) {
        await reader.cancel();
        throw new AdminError(413, "El PDF debe pesar como máximo 25 MB.");
      }
      chunks.push(part.value);
    }
    const bounded = Buffer.concat(chunks);
    const form = await new Response(bounded, {
        headers: { "Content-Type": request.headers.get("content-type")! },
      }).formData(),
      id = uuid(form.get("document_id")),
      file = form.get("file");
    if (!(file instanceof File))
      throw new AdminError(400, "Seleccioná un archivo PDF.");
    const doc = await client
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();
    if (
      doc.error ||
      !doc.data ||
      doc.data.access_mode !== "pdf" ||
      doc.data.editorial_status === "published"
    )
      throw new AdminError(
        409,
        "El documento debe ser un ingreso PDF sin publicar.",
      );
    const existing = await client
      .from("files")
      .select("id")
      .eq("document_id", id);
    if (existing.error) throw existing.error;
    if (existing.data.length)
      throw new AdminError(
        409,
        "Este documento ya tiene archivo. Creá un documento nuevo para reemplazarlo.",
      );
    const bytes = new Uint8Array(await file.arrayBuffer());
    let metadata;
    try {
      metadata = await validatePdf(bytes);
    } catch {
      throw new AdminError(
        400,
        "PDF inválido, cifrado, con acciones automáticas o fuera de los límites admitidos.",
      );
    }
    const work = await client
      .from("works")
      .select("license_id")
      .eq("id", doc.data.work_id)
      .single();
    if (work.error || !work.data)
      throw new AdminError(409, "No encontramos la obra del documento.");
    const fileId = randomUUID(),
      path = `${id}/${fileId}.pdf`;
    const uploaded = await client.storage
      .from("library-private")
      .upload(path, bytes, {
        contentType: "application/pdf",
        upsert: false,
        cacheControl: "0",
      });
    if (uploaded.error)
      throw new AdminError(
        503,
        "No pudimos subir el PDF al almacenamiento privado. Reintentá.",
      );
    const registered = await client.from("files").insert({
      id: fileId,
      document_id: id,
      edition_id: doc.data.edition_id,
      license_id: work.data.license_id,
      storage_bucket: "library-private",
      storage_path: path,
      mime: "application/pdf",
      ...metadata,
      validated_at: new Date().toISOString(),
    });
    if (registered.error) {
      await client.storage.from("library-private").remove([path]);
      throw new AdminError(
        409,
        "No se registró el archivo. El documento permanece sin publicar.",
      );
    }
    return Response.json(
      { id: fileId, pages: metadata.pages },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}

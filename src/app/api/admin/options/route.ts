import { requireAdmin, apiError, AdminError } from "@/lib/admin/auth";
export async function GET(request: Request) {
  try {
    const { client } = await requireAdmin();
    const u = new URL(request.url),
      q = (u.searchParams.get("q") ?? "").slice(0, 160),
      entity = u.searchParams.get("entity");
    const term = `%${q.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
    if (entity === "authors") {
      const r = await client
        .from("authors")
        .select("id,name")
        .ilike("name", term)
        .order("name")
        .limit(50);
      if (r.error) throw r.error;
      return Response.json(
        { items: r.data },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }
    if (entity === "sources") {
      const r = await client
        .from("sources")
        .select("id,label")
        .ilike("label", term)
        .order("label")
        .limit(50);
      if (r.error) throw r.error;
      return Response.json(
        { items: r.data.map((s) => ({ id: s.id, name: s.label })) },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }
    if (entity === "licenses") {
      const r = await client
        .from("licenses")
        .select("id,name")
        .ilike("name", term)
        .order("name")
        .limit(50);
      if (r.error) throw r.error;
      return Response.json(
        { items: r.data },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }
    throw new AdminError(400, "Categoría no válida.");
  } catch (e) {
    return apiError(e);
  }
}

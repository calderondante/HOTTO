import { loadCatalog } from "@/lib/library/backend";
import { parseLibraryQuery } from "@/lib/library/query";
export async function GET(request: Request) {
  try {
    const u = new URL(request.url);
    const page = Math.max(
      1,
      Math.min(10000, Number(u.searchParams.get("pagina")) || 1),
    );
    const result = await loadCatalog(
      parseLibraryQuery(Object.fromEntries(u.searchParams)),
      Math.floor(page),
    );
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json(
      {
        error:
          "No pudimos consultar la biblioteca. Reintentá cuando la conexión esté disponible.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

import { resourceKinds } from "./types.ts";
import { subjects } from "./subjects.ts";
import type { CatalogItem, LibraryQuery, ResourceKind } from "./types.ts";

export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-AR")
    .trim();
}
export function parseSubjectQuery(
  params: Record<string, string | string[] | undefined>,
) {
  const q = typeof params.q === "string" ? params.q.slice(0, 160) : "";
  const year =
    typeof params.anio === "string" && /^[1-5]$/.test(params.anio)
      ? params.anio
      : "";
  return { q, year };
}
export function parseLibraryQuery(
  params: Record<string, string | string[] | undefined>,
): LibraryQuery {
  const one = (key: string) =>
    typeof params[key] === "string" ? (params[key] as string) : "";
  const kind = one("tipo");
  return {
    q: one("q").slice(0, 160),
    subject: subjects.some((s) => s.id === one("materia"))
      ? one("materia")
      : "",
    kind: resourceKinds.includes(kind as ResourceKind)
      ? (kind as ResourceKind)
      : "all",
    availableOnly: one("disponibles") === "1",
  };
}
export function filterCatalog(
  items: readonly CatalogItem[],
  query: LibraryQuery,
): CatalogItem[] {
  const terms = normalizeSearch(query.q).split(/\s+/).filter(Boolean);
  return items.filter((item) => {
    if (query.subject && !item.subjectIds.includes(query.subject)) return false;
    if (query.kind !== "all" && item.kind !== query.kind) return false;
    if (query.availableOnly && !item.available) return false;
    const text = normalizeSearch(
      [item.title, item.subtitle, item.authors, ...item.keywords].join(" "),
    );
    return terms.every((term) => text.includes(term));
  });
}

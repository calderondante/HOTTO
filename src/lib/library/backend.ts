import { supabaseConfig } from "@/lib/supabase/config";
import "server-only";
import { cache } from "react";
import { publicClient } from "@/lib/supabase/server";
import { libraryMode } from "@/lib/supabase/config";
import { filterCatalog } from "./query";
import { getCatalog, getResource, relatedResources } from "./repository";
import type { Resource, LibraryQuery, CatalogItem } from "./types";
import { record } from "@/lib/admin/validation";
const empty: LibraryQuery = {
  q: "",
  subject: "",
  kind: "all",
  availableOnly: false,
};
export interface CatalogResult {
  items: CatalogItem[];
  total: number;
  remote: boolean;
}
export async function loadCatalog(
  query: LibraryQuery = empty,
  page = 1,
): Promise<CatalogResult> {
  if (libraryMode() === "demo") {
    const items = filterCatalog(getCatalog(), query);
    return { items, total: items.length, remote: false };
  }
  const client = publicClient(),
    result = await client.rpc("search_catalog", {
      query_text: query.q,
      subject_code: query.subject,
      kind_filter: query.kind,
      available_only: query.availableOnly,
      page_number: page,
    });
  if (result.error) throw Error("La biblioteca no pudo consultar Supabase.");
  const payload = record(result.data);
  if (!Array.isArray(payload.items) || typeof payload.total !== "number")
    throw Error("Respuesta del catálogo inválida.");
  const items = payload.items.map((value) => {
    const r = record(value);
    if (
      typeof r.id !== "string" ||
      typeof r.slug !== "string" ||
      typeof r.title !== "string"
    )
      throw Error("Ficha inválida.");
    const kind = r.kind as Resource["kind"];
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      subtitle: String(r.subtitle ?? ""),
      kind,
      description: String(r.description ?? ""),
      authors: String(r.author_names ?? ""),
      subjectIds: r.subject_codes as string[],
      keywords: r.keywords as string[],
      available: r.available === true,
      demo: false,
      cover: "plum" as const,
      href: `/biblioteca/${kind === "book" ? "libros" : kind === "jurisprudence" ? "jurisprudencia" : "recursos"}/${r.slug}`,
    };
  });
  return { items, total: payload.total, remote: true };
}
export const loadDetail = cache(
  async (
    slug: string,
  ): Promise<{ resource: Resource; related: CatalogItem[] } | null> => {
    const demo = getResource(slug);
    if (libraryMode() === "demo" || (!supabaseConfig() && demo))
      return demo ? { resource: demo, related: relatedResources(demo) } : null;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return null;
    const c = publicClient(),
      work = await c.from("works").select("*").eq("slug", slug).maybeSingle();
    if (work.error) {
      if (demo) return { resource: demo, related: relatedResources(demo) };
      throw Error("No pudimos consultar la ficha.");
    }
    if (!work.data)
      return demo ? { resource: demo, related: relatedResources(demo) } : null;
    const w = work.data;
    const relationships = await Promise.all([
      c.from("work_authors").select("*").eq("work_id", w.id),
      c.from("work_subjects").select("*").eq("work_id", w.id),
      c.from("documents").select("*").eq("work_id", w.id),
      c.from("editions").select("*").eq("work_id", w.id),
      c.from("sources").select("*").eq("id", w.source_id),
      c.from("jurisprudence").select("*").eq("work_id", w.id),
    ]);
    if (relationships.some((r) => r.error))
      throw Error("No pudimos cargar los recursos de la ficha.");
    const authorIds = relationships[0].data!.map((r) => r.author_id),
      subjectIds = relationships[1].data!.map((r) => r.subject_id),
      docs = relationships[2].data!;
    const [authors, subjects, files] = await Promise.all([
      c.from("authors").select("*").in("id", authorIds),
      c.from("subjects").select("*").in("id", subjectIds),
      c
        .from("files")
        .select("*")
        .in(
          "document_id",
          docs.map((d) => d.id),
        ),
    ]);
    if (authors.error || subjects.error || files.error)
      throw Error("No pudimos cargar los datos bibliográficos.");
    const edition =
        relationships[3].data!.find(
          (e) => e.id === files.data[0]?.edition_id,
        ) ?? relationships[3].data![0],
      source = relationships[4].data![0],
      judgment = relationships[5].data![0];
    const resource: Resource = {
      id: w.id,
      slug: w.slug,
      kind: w.kind,
      title: w.title,
      subtitle: w.subtitle,
      description: w.description,
      keywords: w.keywords,
      authorIds,
      subjectIds: subjects.data
        .map((s) => s.code)
        .filter((s): s is string => Boolean(s)),
      sourceId: w.source_id,
      licenseId: w.license_id,
      editorialStatus: w.editorial_status,
      demo: false,
      cover: "plum",
      jurisprudence: judgment
        ? {
            court: judgment.court,
            docket: judgment.docket,
            date: judgment.decision_date,
            topic: judgment.topic,
            holding: judgment.holding,
          }
        : undefined,
      publicData: {
        authors: authors.data.map((a) => a.name).join(" · "),
        edition: edition
          ? {
              id: edition.id,
              workId: w.id,
              label: edition.label,
              year: edition.publication_year,
              publisher: edition.publisher,
            }
          : undefined,
        files: files.data.map((f) => ({
          id: f.id,
          editionId: f.edition_id ?? "",
          licenseId: f.license_id,
          path: `/api/library/files/${f.id}`,
          mime: "application/pdf",
          pages: f.pages,
        })),
        links: docs
          .filter((d) => d.access_mode === "external" && d.external_url)
          .map((d) => ({ label: d.label, url: d.external_url! })),
        source: {
          label: source?.label ?? "Fuente registrada",
          urls: source?.urls ?? [],
        },
      },
    };
    const related = await loadCatalog({
      ...empty,
      subject: resource.subjectIds[0] ?? "",
    });
    return {
      resource,
      related: related.items.filter((r) => r.id !== w.id).slice(0, 3),
    };
  },
);

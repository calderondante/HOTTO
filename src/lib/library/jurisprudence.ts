import "server-only";
import { publicClient } from "@/lib/supabase/server";
import { libraryMode } from "@/lib/supabase/config";
import { record } from "@/lib/admin/validation";

export interface CaseQuery {
  q: string;
  subject: string;
  court: string;
  year: number | null;
  jurisdiction: string;
  page: number;
}
export interface CaseResult {
  id: string;
  slug: string;
  title: string;
  court: string;
  chamber: string;
  docket: string;
  judicialId: string;
  date: string;
  topic: string;
  jurisdiction: string;
  officialUrl: string;
  seoLevel: "A" | "B" | "C";
  subjectCodes: string[];
}
export interface CaseSearch {
  items: CaseResult[];
  total: number;
  courts: string[];
  jurisdictions: string[];
}
const one = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : "";
export function parseCaseQuery(
  params: Record<string, string | string[] | undefined>,
): CaseQuery {
  const year = one(params.anio);
  return {
    q: one(params.q).slice(0, 160),
    subject: one(params.materia).slice(0, 30),
    court: one(params.tribunal).slice(0, 200),
    year: /^\d{4}$/.test(year) && Number(year) >= 1800 && Number(year) <= 2100 ? Number(year) : null,
    jurisdiction: one(params.jurisdiccion).slice(0, 120),
    page: Math.max(1, Math.min(10000, Number(one(params.pagina)) || 1)),
  };
}
export async function searchCases(query: CaseQuery): Promise<CaseSearch> {
  if (libraryMode() !== "supabase")
    return { items: [], total: 0, courts: [], jurisdictions: [] };
  const { data, error } = await publicClient().rpc("search_jurisprudence", {
    query_text: query.q,
    subject_code: query.subject,
    court_filter: query.court,
    year_filter: query.year ?? undefined,
    jurisdiction_filter: query.jurisdiction,
    page_number: query.page,
  });
  if (error) throw Error("No pudimos consultar la jurisprudencia.");
  const response = record(data);
  if (!Array.isArray(response.items) || typeof response.total !== "number")
    throw Error("Respuesta judicial inválida.");
  return {
    total: response.total,
    courts: Array.isArray(response.courts) ? response.courts.filter((s): s is string => typeof s === "string") : [],
    jurisdictions: Array.isArray(response.jurisdictions) ? response.jurisdictions.filter((s): s is string => typeof s === "string") : [],
    items: response.items.map((entry) => {
      const r = record(entry);
      if (typeof r.id !== "string" || typeof r.slug !== "string" || typeof r.official_url !== "string")
        throw Error("Resultado judicial inválido.");
      return {
        id: r.id,
        slug: r.slug,
        title: String(r.title),
        court: String(r.court),
        chamber: String(r.chamber ?? ""),
        docket: String(r.docket),
        judicialId: String(r.judicial_id ?? ""),
        date: String(r.decision_date),
        topic: String(r.topic),
        jurisdiction: String(r.jurisdiction),
        officialUrl: r.official_url,
        seoLevel: r.seo_level === "C" ? "C" : r.seo_level === "B" ? "B" : "A",
        subjectCodes: Array.isArray(r.subject_codes) ? r.subject_codes.filter((s): s is string => typeof s === "string") : [],
      };
    }),
  };
}

import type { Metadata } from "next";
import { ArrowUpRight, Search, Scale } from "lucide-react";
import { subjects } from "@/lib/library/data";
import { parseCaseQuery, searchCases } from "@/lib/library/jurisprudence";
import { publicSiteOrigin } from "@/lib/library/jurisprudence-seo";
import { Breadcrumbs, PageIntro } from "@/components/library/presentation";
import { LibraryConnectionError } from "@/components/library/connection-error";
import Link from "next/link";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const values = await searchParams;
  const hasFilters = ["q", "materia", "tribunal", "anio", "jurisdiccion", "pagina"].some((k) => Boolean(values[k]));
  const origin = publicSiteOrigin();
  return {
    title: "Jurisprudencia · Buscador de fallos",
    description: "Buscá fallos por carátula, tribunal, expediente, materia y año. Consultá la decisión en su fuente oficial y los análisis editoriales disponibles.",
    robots: { index: Boolean(origin) && !hasFilters, follow: Boolean(origin) },
    alternates: origin ? { canonical: `${origin}/biblioteca/jurisprudencia` } : undefined,
  };
}
export default async function Jurisprudence({ searchParams }: Props) {
  const query = parseCaseQuery(await searchParams);
  let result: Awaited<ReturnType<typeof searchCases>> | null = null;
  try { result = await searchCases(query); } catch { /* explicit connection state below */ }
  const params = (page: number) => {
    const p = new URLSearchParams();
    if (query.q) p.set("q", query.q);
    if (query.subject) p.set("materia", query.subject);
    if (query.court) p.set("tribunal", query.court);
    if (query.year) p.set("anio", String(query.year));
    if (query.jurisdiction) p.set("jurisdiccion", query.jurisdiction);
    if (page > 1) p.set("pagina", String(page));
    return `/biblioteca/jurisprudencia${p.size ? `?${p}` : ""}`;
  };
  return <main id="contenido">
    <div className="shell"><Breadcrumbs items={[{ href: "/biblioteca", label: "Biblioteca" }, { label: "Jurisprudencia" }]} /></div>
    <PageIntro eyebrow="DECISIONES JUDICIALES" title="Jurisprudencia con fuente verificable.">
      <p>Consultá fallos en sitios oficiales. Las fichas de HOTTO aparecen solo cuando existe contenido editorial propio para aportar contexto.</p>
    </PageIntro>
    <div className="shell page-content">
      <form className="case-search" action="/biblioteca/jurisprudencia" method="get" role="search">
        <div className="case-search-main">
          <label htmlFor="case-q">Buscar fallo</label>
          <input id="case-q" name="q" type="search" maxLength={160} defaultValue={query.q} placeholder="Carátula, tema, tribunal o expediente…" />
        </div>
        <div className="case-filters">
          <label>Tribunal<select name="tribunal" defaultValue={query.court}><option value="">Todos</option>{result?.courts.map((court) => <option key={court} value={court}>{court}</option>)}{query.court && !result?.courts.includes(query.court) && <option value={query.court}>{query.court}</option>}</select></label>
          <label>Materia<select name="materia" defaultValue={query.subject}><option value="">Todas</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.shortName}</option>)}</select></label>
          <label>Año<input name="anio" type="number" inputMode="numeric" min="1800" max="2100" defaultValue={query.year ?? ""} placeholder="Todos" /></label>
          <label>Jurisdicción<select name="jurisdiccion" defaultValue={query.jurisdiction}><option value="">Todas</option>{result?.jurisdictions.map((value) => <option key={value} value={value}>{value}</option>)}{query.jurisdiction && !result?.jurisdictions.includes(query.jurisdiction) && <option value={query.jurisdiction}>{query.jurisdiction}</option>}</select></label>
          <button type="submit">Buscar <Search size={17} aria-hidden="true" /></button>
        </div>
      </form>
      {result ? <>
        <div className="results-heading"><h2>Fallos judiciales</h2><p role="status"><strong>{result.total}</strong> resultados</p></div>
        {result.items.length ? <div className="case-results">{result.items.map((item) =>
          <article className="case-result" key={item.id}>
            <div className="case-result-mark"><Scale size={23} aria-hidden="true" /></div>
            <div>
              <p className="eyebrow">{item.court}{item.chamber ? ` · ${item.chamber}` : ""}</p>
              <h3><a href={item.officialUrl} target="_blank" rel="noopener noreferrer" aria-label={`${item.title} · abrir sentencia en sitio oficial (otra pestaña)`}>{item.title} <ArrowUpRight size={17} aria-hidden="true" /></a></h3>
              <p>{item.topic} · {new Intl.DateTimeFormat("es-AR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(item.date))}</p>
              <p className="case-docket">Expediente: {item.docket} · {item.jurisdiction}</p>
              <div className="case-result-links"><a href={item.officialUrl} target="_blank" rel="noopener noreferrer">Consultar sentencia oficial <ArrowUpRight size={15} aria-hidden="true" /></a>{item.seoLevel !== "A" && <Link href={`/biblioteca/jurisprudencia/${item.slug}`}>Ver análisis en HOTTO</Link>}</div>
            </div>
          </article>)}
        </div> : <div className="empty-state"><Search size={30} aria-hidden="true" /><h3>Todavía no hay fallos para esta búsqueda</h3><p>Probá otros filtros. Los ejemplos ficticios están separados en la sección de demostración.</p><Link className="text-link" href="/biblioteca/demo">Ver demostraciones</Link></div>}
        {result.total > 30 && <nav className="pagination" aria-label="Páginas de jurisprudencia">{query.page > 1 && <Link href={params(query.page - 1)}>Anterior</Link>}<span>Página {query.page}</span>{query.page * 30 < result.total && <Link href={params(query.page + 1)}>Siguiente</Link>}</nav>}
      </> : <LibraryConnectionError />}
    </div>
  </main>;
}

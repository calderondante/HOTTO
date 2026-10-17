import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { loadDetail } from "@/lib/library/backend";
import { searchCases } from "@/lib/library/jurisprudence";
import { caseSeoPolicy } from "@/lib/library/jurisprudence-seo";
import { ResourceDetail } from "@/components/library/resource-detail";
import { Breadcrumbs, SubjectLink } from "@/components/library/presentation";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = (await loadDetail(slug))?.resource;
  const j = r?.jurisprudence;
  const policy = caseSeoPolicy(slug, { demo: r?.demo ?? true, level: j?.seoLevel, state: j?.analysisState, approvedAt: j?.approvedAt });
  const index = policy.index;
  return {
    title: r?.title ?? "Fallo no encontrado",
    description: index ? `${j?.legalIssue?.slice(0, 150)} · Análisis original de HOTTO de la decisión de ${j?.court}.` : r?.description,
    robots: { index, follow: index },
    alternates: policy.canonical ? { canonical: policy.canonical } : undefined,
    openGraph: policy.canonical ? { title: r?.title, description: j?.legalIssue, url: policy.canonical, type: "article" } : undefined,
  };
}
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const detail = await loadDetail(slug);
  const r = detail?.resource;
  if (!r || r.kind !== "jurisprudence") notFound();
  if (r.demo) return <ResourceDetail resource={r} related={detail?.related} />;
  const j = r.jurisprudence;
  if (!j || j.seoLevel === "A" || !j.officialUrl || !j.officialVerifiedAt) notFound();
  const { canonical } = caseSeoPolicy(slug, { demo: r.demo, level: j.seoLevel, state: j.analysisState, approvedAt: j.approvedAt });
  const related = r.subjectIds[0]
    ? await searchCases({ q: "", subject: r.subjectIds[0], court: "", year: null, jurisdiction: "", page: 1 })
        .then((result) => result.items.filter((item) => item.id !== r.id).slice(0, 4))
        .catch(() => [])
    : [];
  const structured = canonical ? {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: r.title,
    description: j.legalIssue,
    datePublished: j.approvedAt,
    publisher: { "@type": "Organization", name: "HOTTO" },
    isBasedOn: j.officialUrl,
    mainEntityOfPage: canonical,
  } : null;
  return <main id="contenido" className="case-detail-page">
    {structured && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }} />}
    <div className="shell">
      <Breadcrumbs items={[{ href: "/biblioteca", label: "Biblioteca" }, { href: "/biblioteca/jurisprudencia", label: "Jurisprudencia" }, { label: r.title }]} />
      <div className="case-detail-header">
        <p className="eyebrow">ANÁLISIS JURÍDICO · {j.court}</p>
        <h1>{r.title}</h1>
        <p>{j.topic}</p>
        {j.seoLevel === "B" && <p className="case-preliminary">Ficha preliminar · análisis editorial pendiente de aprobación</p>}
        <a className="case-official-link" href={j.officialUrl} target="_blank" rel="noopener noreferrer">Consultar sentencia en sitio oficial <ArrowUpRight size={18} aria-hidden="true" /></a>
      </div>
      <div className="case-detail-body">
        <aside className="case-facts" aria-label="Datos del fallo">
          <dl>
            <div><dt>Tribunal</dt><dd>{j.court}{j.chamber ? ` · ${j.chamber}` : ""}</dd></div>
            <div><dt>Jurisdicción</dt><dd>{j.jurisdiction}</dd></div>
            <div><dt>Expediente</dt><dd>{j.docket}</dd></div>
            {j.judicialId && <div><dt>Identificador</dt><dd>{j.judicialId}</dd></div>}
            <div><dt>Fecha</dt><dd>{new Intl.DateTimeFormat("es-AR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(j.date))}</dd></div>
          </dl>
          <div className="subject-tags">{r.subjectIds.map((id) => <SubjectLink id={id} key={id} />)}</div>
        </aside>
        <article className="case-analysis">
          {j.legalIssue && <section><h2>Problema jurídico</h2><p>{j.legalIssue}</p></section>}
          {j.facts && <section><h2>Hechos relevantes</h2><p>{j.facts}</p></section>}
          {j.decision && <section><h2>Decisión del tribunal</h2><p>{j.decision}</p></section>}
          {j.reasoning && <section><h2>Fundamentos principales</h2><p>{j.reasoning}</p></section>}
          {j.significance && <section><h2>Importancia jurisprudencial</h2><p>{j.significance}</p></section>}
          {j.applicableLaw && <section><h2>Normativa aplicable</h2><p>{j.applicableLaw}</p></section>}
          <p className="case-source-note">Este análisis es contenido editorial de HOTTO. Para citar el fallo, consultá y comprobá la sentencia en la fuente oficial.</p>
          <Link className="text-link" href="/biblioteca/jurisprudencia">Explorar más jurisprudencia</Link>
          {related.length > 0 && <div className="case-related"><h2>Fallos relacionados</h2>{related.map((item) => item.seoLevel === "A"
            ? <a href={item.officialUrl} target="_blank" rel="noopener noreferrer" key={item.id}>{item.title} · fuente oficial <ArrowUpRight size={14} aria-hidden="true" /></a>
            : <Link href={`/biblioteca/jurisprudencia/${item.slug}`} key={item.id}>{item.title}</Link>)}</div>}
        </article>
      </div>
    </div>
  </main>;
}

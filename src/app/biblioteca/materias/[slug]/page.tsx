import { getCatalog } from "@/lib/library/repository";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { subjects } from "@/lib/library/data";
import { getSubject } from "@/lib/library/repository";
import { parseLibraryQuery } from "@/lib/library/query";
import { resourceKinds, kindLabels } from "@/lib/library/types";
import {
  Breadcrumbs,
  DemoNotice,
  PageIntro,
  ExploreLink,
} from "@/components/library/presentation";
import { CatalogExplorer } from "@/components/library/catalog-explorer";
import { loadCatalog, type CatalogResult } from "@/lib/library/backend";
import { LibraryConnectionError } from "@/components/library/connection-error";
import { Badge } from "@/components/ui/badge";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export const dynamicParams = false;
export function generateStaticParams() {
  return subjects.map((s) => ({ slug: s.slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = getSubject((await params).slug);
  return {
    title: s?.name ?? "Materia no encontrada",
    description: s
      ? `Manuales, jurisprudencia, legislación y recursos de ${s.name}. Código ${s.code}, Abogacía UNLaM 2018.`
      : undefined,
  };
}
export default async function Subject({ params, searchParams }: Props) {
  const subject = getSubject((await params).slug);
  if (!subject) notFound();
  const initial = parseLibraryQuery(await searchParams);
  let result: CatalogResult | null = null;
  try {
    result = await loadCatalog({ ...initial, subject: subject.id });
  } catch {}
  const items = result?.remote
    ? result.items
    : getCatalog().filter((r) => r.subjectIds.includes(subject.id));
  return (
    <main id="contenido">
      <div className="shell">
        <Breadcrumbs
          items={[
            { href: "/biblioteca", label: "Biblioteca" },
            { href: "/biblioteca/materias", label: "Materias" },
            { label: subject.shortName },
          ]}
        />
      </div>
      <PageIntro
        eyebrow={`${subject.year}.º AÑO · CÓDIGO ${subject.code} · ABOGACÍA UNLaM`}
        title={subject.name}
      >
        <p>
          Un espacio para reunir lecturas, casos de estudio y recursos de la
          materia.
        </p>
        <div className="inline-badges">
          <Badge variant="secondary">{subject.area}</Badge>
          {subject.pilot && <Badge variant="outline">Materia piloto</Badge>}
        </div>
      </PageIntro>
      <div className="shell page-content">
        <div className="category-summary" aria-label="Recursos por categoría">
          {resourceKinds.map((kind) => (
            <div key={kind}>
              <strong>
                {result?.remote
                  ? "—"
                  : items.filter((r) => r.kind === kind).length}
              </strong>
              <span>{kindLabels[kind]}</span>
            </div>
          ))}
        </div>
        {!result ? (
          <LibraryConnectionError />
        ) : items.length || result.remote ? (
          <>
            {!result?.remote && <DemoNotice />}
            <CatalogExplorer
              action={`/biblioteca/materias/${subject.slug}`}
              items={items}
              remote={result?.remote}
              total={result?.total}
              subjects={subjects}
              initial={initial}
              fixedSubject={subject.id}
            />
          </>
        ) : (
          <div className="empty-state">
            <h2>El recorrido está por comenzar</h2>
            <p>
              Esta materia ya tiene su espacio. Aún no incorporamos recursos;
              podés explorar las muestras de nuestras dos materias piloto.
            </p>
            <div className="button-row">
              <ExploreLink href="/biblioteca/materias/introduccion-al-derecho">
                Introducción al Derecho
              </ExploreLink>
              <ExploreLink href="/biblioteca/materias/derecho-constitucional-i">
                Derecho Constitucional I
              </ExploreLink>
            </div>
          </div>
        )}
        <p className="source-note">
          Datos académicos de fuentes secundarias cotejadas. El programa oficial
          de la materia no está disponible en esta entrega.
        </p>
      </div>
    </main>
  );
}

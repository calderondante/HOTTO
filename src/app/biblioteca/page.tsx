import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, BookOpen, Scale } from "lucide-react";
import { CatalogExplorer } from "@/components/library/catalog-explorer";
import { Breadcrumbs, DemoNotice } from "@/components/library/presentation";
import { getCatalog } from "@/lib/library/repository";
import { subjects } from "@/lib/library/data";
import { parseLibraryQuery } from "@/lib/library/query";

export const metadata: Metadata = {
  title: "Biblioteca jurídica",
  description:
    "Explorá materias, manuales y casos de estudio. Buscá por título, autor y palabras clave en la biblioteca HOTTO.",
};
export default async function Library({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const initial = parseLibraryQuery(await searchParams);
  return (
    <main id="contenido">
      <section className="library-hero">
        <div className="shell">
          <Breadcrumbs items={[{ label: "Biblioteca" }]} />
          <div className="library-hero-row">
            <div>
              <p className="eyebrow">CONOCIMIENTO AL ALCANCE</p>
              <h1>
                Tu próxima lectura
                <br />
                <em>empieza acá.</em>
              </h1>
              <p>
                Un lugar para estudiar, consultar y seguir aprendiendo.
                <br className="desktop-only" /> Encontrá recursos jurídicos,
                organizados para vos.
              </p>
            </div>
            <div className="library-seal" aria-hidden="true">
              <BookOpen size={51} strokeWidth={1} />
              <span>
                BIBLIOTECA
                <br />
                JURÍDICA
              </span>
              <small>HOTTO</small>
            </div>
          </div>
          <div className="library-stats">
            <span>
              <strong>34</strong> materias
            </span>
            <span>
              <strong>2</strong> materias piloto
            </span>
            <span>
              <strong>13</strong> recursos de muestra
            </span>
            <span className="open-access">Acceso abierto</span>
          </div>
        </div>
      </section>
      <div className="shell library-content">
        <div className="library-paths">
          <Link href="/biblioteca/materias">
            <BookOpen size={23} strokeWidth={1.4} aria-hidden="true" />
            <div>
              <strong>Explorar por materia</strong>
              <span>Tu plan de estudio, en un solo lugar</span>
            </div>
            <ArrowUpRight size={21} aria-hidden="true" />
          </Link>
          <Link href="/biblioteca/jurisprudencia">
            <Scale size={23} strokeWidth={1.4} aria-hidden="true" />
            <div>
              <strong>Jurisprudencia</strong>
              <span>Casos de estudio y análisis jurídico</span>
            </div>
            <ArrowUpRight size={21} aria-hidden="true" />
          </Link>
        </div>
        <DemoNotice />
        <CatalogExplorer
          items={getCatalog()}
          subjects={subjects}
          initial={initial}
        />
      </div>
    </main>
  );
}

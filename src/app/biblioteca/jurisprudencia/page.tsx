import type { Metadata } from "next";
import { subjects } from "@/lib/library/data";
import { getCatalog } from "@/lib/library/repository";
import { parseLibraryQuery } from "@/lib/library/query";
import { CatalogExplorer } from "@/components/library/catalog-explorer";
import {
  Breadcrumbs,
  PageIntro,
  DemoNotice,
} from "@/components/library/presentation";
export const metadata: Metadata = {
  title: "Jurisprudencia · Casos de estudio",
  description:
    "Explorá casos ficticios de demostración para practicar análisis de decisiones y argumentación jurídica.",
};
export default async function Jurisprudence({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <main id="contenido">
      <div className="shell">
        <Breadcrumbs
          items={[
            { href: "/biblioteca", label: "Biblioteca" },
            { label: "Jurisprudencia" },
          ]}
        />
      </div>
      <PageIntro
        eyebrow="LEER, ANALIZAR, ARGUMENTAR"
        title="El Derecho en cada decisión."
      >
        <p>
          Un espacio para explorar decisiones judiciales y comprender sus
          fundamentos. Empezamos con tres casos ficticios de estudio, claramente
          identificados.
        </p>
      </PageIntro>
      <div className="shell page-content">
        <DemoNotice />
        <CatalogExplorer
          items={getCatalog().filter((r) => r.kind === "jurisprudence")}
          subjects={subjects}
          initial={parseLibraryQuery(await searchParams)}
          fixedKind="jurisprudence"
          action="/biblioteca/jurisprudencia"
        />
      </div>
    </main>
  );
}

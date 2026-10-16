import { getCatalog } from "@/lib/library/repository";
import type { Metadata } from "next";
import { subjects } from "@/lib/library/data";
import { loadCatalog, type CatalogResult } from "@/lib/library/backend";
import { libraryMode } from "@/lib/supabase/config";
import { LibraryConnectionError } from "@/components/library/connection-error";
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
  const initial = parseLibraryQuery(await searchParams);
  let result: CatalogResult | null = null;
  try {
    result = await loadCatalog({ ...initial, kind: "jurisprudence" });
  } catch {}
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
          fundamentos. Los recursos y las muestras se identifican por su
          procedencia.
        </p>
      </PageIntro>
      <div className="shell page-content">
        {libraryMode() === "demo" && <DemoNotice />}
        {result ? (
          <CatalogExplorer
            items={
              result.remote
                ? result.items
                : getCatalog().filter((r) => r.kind === "jurisprudence")
            }
            remote={result?.remote}
            total={result?.total}
            subjects={subjects}
            initial={initial}
            fixedKind="jurisprudence"
            action="/biblioteca/jurisprudencia"
          />
        ) : (
          <LibraryConnectionError />
        )}
      </div>
    </main>
  );
}

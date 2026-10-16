import type { Metadata } from "next";
import { getCatalog } from "@/lib/library/repository";
import { subjects } from "@/lib/library/data";
import { CatalogExplorer } from "@/components/library/catalog-explorer";
import { DemoNotice, PageIntro } from "@/components/library/presentation";
import { parseLibraryQuery } from "@/lib/library/query";
export const metadata: Metadata = {
  title: "Biblioteca de demostración",
  robots: { index: false, follow: false },
};
export default async function Demo({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <main id="contenido">
      <PageIntro
        title="Un recorrido de demostración."
        eyebrow="HOTTO · MUESTRAS DEL MVP"
      >
        <p>
          Estos ejemplos se conservan separados del catálogo definitivo. Son
          recursos ficticios y dos PDF originales de prueba.
        </p>
      </PageIntro>
      <div className="shell page-content">
        <DemoNotice />
        <CatalogExplorer
          items={getCatalog()}
          subjects={subjects}
          initial={parseLibraryQuery(await searchParams)}
          action="/biblioteca/demo"
        />
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import { SubjectExplorer } from "@/components/library/subject-explorer";
import { Breadcrumbs, PageIntro } from "@/components/library/presentation";
import { subjects } from "@/lib/library/data";
import { parseSubjectQuery } from "@/lib/library/query";

export const metadata: Metadata = {
  title: "Materias · Abogacía UNLaM",
  description:
    "Catálogo de las 34 materias jurídicas del plan de Abogacía 2018 de la UNLaM. Buscá por nombre, código o año.",
};
export default async function Subjects({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const initial = parseSubjectQuery(await searchParams);
  return (
    <main id="contenido">
      <div className="shell">
        <Breadcrumbs
          items={[
            { href: "/biblioteca", label: "Biblioteca" },
            { label: "Materias" },
          ]}
        />
      </div>
      <PageIntro
        eyebrow="ABOGACÍA · UNLaM · PLAN 2018"
        title="Cada materia, un nuevo horizonte."
      >
        <p>
          34 materias jurídicas para organizar tu aprendizaje. Introducción al
          Derecho y Derecho Constitucional I son nuestros primeros pilotos.
        </p>
      </PageIntro>
      <div className="shell page-content">
        <p className="source-note">
          Nombres y códigos cotejados entre dos transcripciones públicas del
          plan 2018. Validación con el documento institucional pendiente. Se
          excluyen Inglés I–IV y Computación I–II.
        </p>
        <SubjectExplorer subjects={subjects} initial={initial} />
      </div>
    </main>
  );
}

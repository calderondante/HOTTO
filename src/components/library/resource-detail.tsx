import Link from "next/link";
import { ArrowUpRight, Download, FileText, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { kindLabels, type Resource } from "@/lib/library/types";
import {
  authorLabel,
  editionFor,
  fileFor,
  relatedResources,
} from "@/lib/library/repository";
import {
  Breadcrumbs,
  BookCover,
  SubjectLink,
  ResourceGrid,
} from "./presentation";

export function ResourceDetail({ resource: r }: { resource: Resource }) {
  const file = fileFor(r),
    edition = editionFor(r),
    related = relatedResources(r);
  const isCase = r.kind === "jurisprudence";
  return (
    <main id="contenido">
      <div className="shell">
        <Breadcrumbs
          items={[
            { href: "/biblioteca", label: "Biblioteca" },
            ...(isCase
              ? [
                  {
                    href: "/biblioteca/jurisprudencia",
                    label: "Jurisprudencia",
                  },
                ]
              : []),
            { label: r.title },
          ]}
        />
        <section className="detail-layout">
          <div className="detail-art">
            {r.kind === "book" ? (
              <div className={`detail-cover-stage stage-${r.cover}`}>
                <BookCover
                  title={r.title}
                  subtitle={r.subtitle}
                  tone={r.cover}
                  large
                />
              </div>
            ) : (
              <div className={`case-detail-art stage-${r.cover}`}>
                {isCase ? (
                  <Scale size={85} strokeWidth={1} aria-hidden="true" />
                ) : (
                  <FileText size={85} strokeWidth={1} aria-hidden="true" />
                )}
                <span>
                  {isCase ? "CASO DE ESTUDIO" : "RECURSO COMPLEMENTARIO"}
                </span>
                <strong>H.</strong>
              </div>
            )}
            <p className="art-disclaimer">
              {r.kind === "book"
                ? "Cubierta tipográfica de muestra"
                : "Ilustración de demostración"}
            </p>
          </div>
          <div className="detail-copy">
            <p className="eyebrow">{kindLabels[r.kind]}</p>
            <h1>{r.title}</h1>
            <p className="detail-subtitle">{r.subtitle}</p>
            <p className="detail-author">{authorLabel(r)}</p>
            <div className="inline-badges">
              <Badge variant="secondary">Demostración</Badge>
              <Badge variant="outline">
                {file
                  ? "PDF de muestra disponible"
                  : r.kind === "book"
                    ? "Referencia sin archivo"
                    : "Lectura en esta ficha"}
              </Badge>
            </div>
            <p className="detail-description">{r.description}</p>
            <div className="detail-warning">
              <strong>
                {isCase
                  ? "Caso completamente ficticio"
                  : "Material original de prueba"}
              </strong>
              <p>
                {isCase
                  ? "El tribunal, el expediente y los hechos son ficticios. No es un fallo real ni puede citarse como precedente judicial."
                  : "El título y los autores fueron creados para probar HOTTO. No forman parte de la bibliografía oficial de la UNLaM."}
              </p>
            </div>
            <dl className="detail-facts">
              {edition && (
                <>
                  <div>
                    <dt>Edición</dt>
                    <dd>
                      {edition.label} · {edition.year}
                    </dd>
                  </div>
                  <div>
                    <dt>Editorial</dt>
                    <dd>{edition.publisher}</dd>
                  </div>
                </>
              )}
              {r.jurisprudence && (
                <>
                  <div>
                    <dt>Tribunal ficticio</dt>
                    <dd>{r.jurisprudence.court}</dd>
                  </div>
                  <div>
                    <dt>Expediente de prueba</dt>
                    <dd>{r.jurisprudence.docket}</dd>
                  </div>
                  <div>
                    <dt>Fecha de ejemplo</dt>
                    <dd>
                      {new Intl.DateTimeFormat("es-AR", {
                        dateStyle: "long",
                        timeZone: "UTC",
                      }).format(new Date(r.jurisprudence.date))}
                    </dd>
                  </div>
                </>
              )}
              <div>
                <dt>Disponibilidad</dt>
                <dd>
                  {file
                    ? "Archivo original de demostración · 1 página"
                    : r.kind === "book"
                      ? "Solo referencia: no hay archivo ni permiso de distribución atribuido"
                      : "Contenido de demostración en esta página"}
                </dd>
              </div>
            </dl>
            <div className="subject-tags">
              {r.subjectIds.map((id) => (
                <SubjectLink key={id} id={id} />
              ))}
            </div>
            {file && (
              <div className="button-row">
                <Button
                  render={
                    <a
                      href={file.path}
                      target="_blank"
                      aria-label="Abrir PDF de muestra (en otra pestaña)"
                      rel="noopener noreferrer"
                    />
                  }
                  nativeButton={false}
                  role="link"
                >
                  Abrir PDF de muestra
                  <ArrowUpRight size={17} aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  render={<a href={file.path} download />}
                  nativeButton={false}
                  role="link"
                >
                  Descargar muestra
                  <Download size={17} aria-hidden="true" />
                </Button>
              </div>
            )}
          </div>
        </section>
        <section className="reading-section">
          <p className="eyebrow">PARA EMPEZAR</p>
          <h2>
            {isCase ? "Claves del caso de estudio" : "Sobre esta lectura"}
          </h2>
          {r.jurisprudence ? (
            <>
              <p>{r.jurisprudence.holding}</p>
              <h3>Preguntas para trabajar</h3>
              <ul>
                <li>¿Qué derechos y principios aparecen en tensión?</li>
                <li>
                  ¿Cómo justificarías una interpretación a partir de las normas
                  aplicables?
                </li>
                <li>
                  ¿Qué información necesitarías para analizar un caso real?
                </li>
              </ul>
            </>
          ) : (
            <>
              <p>{r.description}</p>
              <p>
                Esta muestra propone identificar conceptos, formular preguntas y
                relacionar la lectura con las materias asociadas. Consultá las
                fuentes y el programa oficial antes de utilizar materiales para
                un trabajo académico.
              </p>
              {r.kind === "syllabus" && (
                <p>
                  Recorrido orientativo de prueba: conceptos iniciales, lectura
                  guiada y preguntas de repaso. No reemplaza el programa de la
                  universidad.
                </p>
              )}
            </>
          )}
          <div className="keyword-row">
            {r.keywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
        </section>
        {related.length > 0 && (
          <section className="related-section">
            <div className="results-heading">
              <h2>Seguí explorando</h2>
              <Link className="text-link" href="/biblioteca">
                Ver catálogo
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <ResourceGrid items={related} />
          </section>
        )}
      </div>
    </main>
  );
}

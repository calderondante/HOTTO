import Link from "next/link";
import { ArrowUpRight, Download, FileText, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  kindLabels,
  type Resource,
  type CatalogItem,
} from "@/lib/library/types";
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

export function ResourceDetail({
  resource: r,
  related: relatedItems,
}: {
  resource: Resource;
  related?: CatalogItem[];
}) {
  const file = fileFor(r),
    edition = editionFor(r),
    related = relatedItems ?? relatedResources(r);
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
                  demo={r.demo}
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
                  {isCase
                    ? r.demo
                      ? "CASO DE ESTUDIO"
                      : "JURISPRUDENCIA"
                    : "RECURSO COMPLEMENTARIO"}
                </span>
                <strong>H.</strong>
              </div>
            )}
            <p className="art-disclaimer">
              {r.kind === "book"
                ? r.demo
                  ? "Cubierta tipográfica de muestra"
                  : "Cubierta tipográfica de referencia"
                : r.demo
                  ? "Ilustración de demostración"
                  : "Ilustración editorial"}
            </p>
          </div>
          <div className="detail-copy">
            <p className="eyebrow">{kindLabels[r.kind]}</p>
            <h1>{r.title}</h1>
            <p className="detail-subtitle">{r.subtitle}</p>
            <p className="detail-author">{authorLabel(r)}</p>
            <div className="inline-badges">
              <Badge variant="secondary">
                {r.demo ? "Demostración" : "Recurso publicado"}
              </Badge>
              <Badge variant="outline">
                {file
                  ? r.demo
                    ? "PDF de muestra disponible"
                    : "PDF disponible"
                  : r.kind === "book"
                    ? "Referencia sin archivo"
                    : "Lectura en esta ficha"}
              </Badge>
            </div>
            <p className="detail-description">{r.description}</p>
            {r.demo && (
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
            )}
            <dl className="detail-facts">
              {edition && (
                <>
                  <div>
                    <dt>Edición</dt>
                    <dd>
                      {edition.label}
                      {edition.year ? ` · ${edition.year}` : ""}
                    </dd>
                  </div>
                  <div>
                    <dt>Editorial</dt>
                    <dd>{edition.publisher ?? "Sin editorial registrada"}</dd>
                  </div>
                </>
              )}
              {r.jurisprudence && (
                <>
                  <div>
                    <dt>{r.demo ? "Tribunal ficticio" : "Tribunal"}</dt>
                    <dd>{r.jurisprudence.court}</dd>
                  </div>
                  <div>
                    <dt>{r.demo ? "Expediente de prueba" : "Expediente"}</dt>
                    <dd>{r.jurisprudence.docket}</dd>
                  </div>
                  <div>
                    <dt>{r.demo ? "Fecha de ejemplo" : "Fecha de decisión"}</dt>
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
                    ? r.demo
                      ? "Archivo original de demostración · 1 página"
                      : "Archivo habilitado para lectura pública"
                    : r.kind === "book"
                      ? "Solo referencia: no hay archivo ni permiso de distribución atribuido"
                      : r.demo
                        ? "Contenido de demostración en esta página"
                        : r.publicData?.links.length
                          ? "Consulta en la fuente externa autorizada"
                          : "Referencia bibliográfica sin archivo"}
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
                      aria-label={
                        r.demo
                          ? "Abrir PDF de muestra (en otra pestaña)"
                          : "Abrir PDF (en otra pestaña)"
                      }
                      rel="noopener noreferrer"
                    />
                  }
                  nativeButton={false}
                  role="link"
                >
                  {r.demo ? "Abrir PDF de muestra" : "Abrir PDF"}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  render={
                    <a
                      href={
                        r.publicData ? `${file.path}?descargar=1` : file.path
                      }
                      download
                    />
                  }
                  nativeButton={false}
                  role="link"
                >
                  {r.demo ? "Descargar muestra" : "Descargar PDF"}
                  <Download size={17} aria-hidden="true" />
                </Button>
              </div>
            )}
          </div>
        </section>
        {r.publicData && (
          <section className="reading-section">
            <h2>Fuentes y documentos</h2>
            <p>{r.publicData.source.label}</p>
            <div className="source-links">
              {r.publicData.source.urls.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {url}
                </a>
              ))}
            </div>
            {r.publicData.files.map((f) => (
              <Link
                className="text-link"
                key={f.id}
                href={`/biblioteca/leer/${f.id}`}
              >
                Leer PDF en HOTTO{f.pages ? ` · ${f.pages} páginas` : ""}
              </Link>
            ))}
            {r.publicData.links.map((link) => (
              <a
                className="text-link"
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label} · Fuente externa
              </a>
            ))}
          </section>
        )}
        <section className="reading-section">
          <p className="eyebrow">PARA EMPEZAR</p>
          <h2>
            {isCase
              ? r.demo
                ? "Claves del caso de estudio"
                : "Claves del fallo"
              : "Sobre esta lectura"}
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
              {r.demo && (
                <p>
                  Esta muestra propone identificar conceptos, formular preguntas
                  y relacionar la lectura con las materias asociadas. Consultá
                  las fuentes y el programa oficial antes de utilizar materiales
                  para un trabajo académico.
                </p>
              )}
              {r.demo && r.kind === "syllabus" && (
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

"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReferencePicker } from "./reference-picker";
import type { AdminWork, AdminOptions } from "@/lib/admin/data";
import { EditorForm, TextField, SelectField, CheckField } from "./form";
import { FieldSet, FieldLegend } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { kindLabels } from "@/lib/library/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
const statusItems = [
  { id: "draft", name: "Borrador" },
  { id: "review", name: "En revisión" },
  { id: "published", name: "Publicado" },
  { id: "archived", name: "Archivado" },
];
function Upload({ id, hasFile }: { id: string; hasFile: boolean }) {
  const [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const router = useRouter();
  if (hasFile)
    return (
      <p className="field-hint">
        PDF registrado e inmutable. Para reemplazarlo, ingresá otro documento;
        el archivo existente se conserva.
      </p>
    );
  return (
    <form
      className="upload-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError("");
        const body = new FormData(e.currentTarget);
        body.set("document_id", id);
        try {
          const response = await fetch("/api/admin/upload", {
            method: "POST",
            body,
          });
          const data = await response.json();
          if (!response.ok) throw Error(data.error);
          router.refresh();
        } catch (e) {
          setError(e instanceof Error ? e.message : "No se subió el PDF.");
        } finally {
          setPending(false);
        }
      }}
    >
      <label htmlFor={`file-${id}`}>Seleccionar PDF (hasta 25 MB)</label>
      <input
        id={`file-${id}`}
        type="file"
        name="file"
        required
        accept="application/pdf,.pdf"
      />
      {error && <p role="alert">{error}</p>}
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Subiendo…" : "Subir PDF privado"}
      </Button>
    </form>
  );
}
function StatusActions({
  id,
  target,
  status,
}: {
  id: string;
  target: "works" | "documents";
  status: string;
}) {
  const actions =
    status === "draft"
      ? [["review", "Enviar a revisión"]]
      : status === "review"
        ? [
            ["published", "Publicar"],
            ["draft", "Volver a borrador"],
          ]
        : status === "published"
          ? [["draft", "Despublicar"]]
          : [["draft", "Recuperar borrador"]];
  return (
    <div className="button-row">
      {actions.map(([next, label]) => (
        <EditorForm
          key={next}
          endpoint="/api/admin/status"
          initial={{ id, target, status: next }}
          label={label}
        >
          {null}
        </EditorForm>
      ))}
    </div>
  );
}
export function WorkEditor({
  data,
  options,
}: {
  data: AdminWork;
  options: AdminOptions;
}) {
  const w = data.work;
  return (
    <div className="work-editor">
      <Alert>
        <AlertTitle>
          Ingreso → Metadatos → Clasificación → Permisos → Revisión →
          Publicación
        </AlertTitle>
        <AlertDescription>
          Una obra y sus documentos comparten las materias seleccionadas. Los
          PDF se guardan una sola vez y permanecen privados hasta cumplir la
          revisión. Guardar metadatos vuelve la obra a borrador.
        </AlertDescription>
      </Alert>
      <Card>
        <CardHeader>
          <CardTitle>Metadatos y clasificación</CardTitle>
          <CardDescription>
            {kindLabels[w.kind]} · URL permanente: {w.slug}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditorForm
            key={w.revision}
            endpoint="/api/admin/work"
            initial={{
              id: w.id,
              revision: w.revision,
              slug: w.slug,
              kind: w.kind,
              subject_ids: [],
              author_ids: [],
            }}
          >
            <TextField name="title" label="Título" value={w.title} required />
            <TextField name="subtitle" label="Subtítulo" value={w.subtitle} />
            <TextField
              name="description"
              label="Descripción pública"
              value={w.description}
              multiline
              maxLength={12000}
            />
            <TextField
              name="keywords"
              label="Palabras clave separadas por comas"
              value={w.keywords.join(", ")}
              maxLength={1000}
            />
            <ReferencePicker
              name="source_id"
              label="Fuente de procedencia"
              entity="sources"
              selected={[w.source_id]}
              options={options.sources.map((s) => ({
                id: s.id,
                name: s.label,
              }))}
            />
            <ReferencePicker
              name="license_id"
              label="Licencia de referencia de la obra"
              entity="licenses"
              selected={[w.license_id]}
              options={options.licenses.map((l) => ({
                id: l.id,
                name: l.name,
              }))}
            />
            <ReferencePicker
              name="author_ids"
              label="Autores"
              entity="authors"
              multiple
              selected={data.authorIds}
              options={options.authors.map((a) => ({ id: a.id, name: a.name }))}
            />
            <FieldSet>
              <FieldLegend>Materias asociadas</FieldLegend>
              <div className="classification-grid">
                {options.subjects.map((s) => (
                  <CheckField
                    key={s.id}
                    name="subject_ids[]"
                    value={s.id}
                    label={`${s.code} · ${s.name}`}
                    checked={data.subjectIds.includes(s.id)}
                  />
                ))}
              </div>
            </FieldSet>
          </EditorForm>
        </CardContent>
      </Card>
      {w.kind === "jurisprudence" && (
        <Card>
          <CardHeader>
            <CardTitle>Ficha judicial</CardTitle>
            <CardDescription>
              Usá datos del fallo y su fuente verificable. No completes
              identificadores por conjetura.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EditorForm
              endpoint="/api/admin/jurisprudence"
              initial={{ work_id: w.id }}
            >
              <TextField
                name="court"
                label="Tribunal"
                value={data.jurisprudence?.court}
                required
              />
              <TextField
                name="docket"
                label="Expediente / carátula"
                value={data.jurisprudence?.docket}
                required
              />
              <TextField
                name="decision_date"
                label="Fecha de decisión"
                type="date"
                value={data.jurisprudence?.decision_date}
                required
              />
              <TextField
                name="topic"
                label="Tema jurídico"
                value={data.jurisprudence?.topic}
                required
              />
              <TextField
                name="holding"
                label="Síntesis editorial"
                value={data.jurisprudence?.holding}
                multiline
                required
                maxLength={6000}
              />
            </EditorForm>
          </CardContent>
        </Card>
      )}
      {w.kind === "legislation" && (
        <Card>
          <CardHeader>
            <CardTitle>Ficha legislativa</CardTitle>
          </CardHeader>
          <CardContent>
            <EditorForm
              endpoint="/api/admin/legislation"
              initial={{ work_id: w.id }}
            >
              <TextField
                name="authority"
                label="Organismo emisor"
                value={data.legislation?.authority}
                required
              />
              <TextField
                name="identifier"
                label="Número / identificación de la norma"
                value={data.legislation?.identifier}
                required
              />
              <TextField
                name="jurisdiction"
                label="Jurisdicción"
                value={data.legislation?.jurisdiction}
                required
              />
              <TextField
                name="enacted_on"
                label="Fecha de sanción"
                type="date"
                value={data.legislation?.enacted_on}
              />
              <TextField
                name="validity_note"
                label="Nota de vigencia y fuente de comprobación"
                value={data.legislation?.validity_note}
                multiline
                required
                maxLength={3000}
              />
            </EditorForm>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Ediciones</CardTitle>
          <CardDescription>
            Los libros requieren una edición publicada antes de publicar sus
            documentos. Publicar una edición no publica la obra.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {[
            ...data.editions,
            {
              id: "",
              work_id: w.id,
              label: "",
              publication_year: null,
              publisher: null,
              isbn: null,
              editorial_status: "draft" as const,
            },
          ].map((edition, i) => (
            <details className="editor-disclosure" key={edition.id || "new"}>
              <summary>
                {edition.id
                  ? `${edition.label} · ${edition.editorial_status}`
                  : "Registrar una edición"}
              </summary>
              <EditorForm
                endpoint="/api/admin/edition"
                initial={{
                  work_id: w.id,
                  ...(edition.id ? { id: edition.id } : {}),
                }}
              >
                <TextField
                  name="label"
                  label="Nombre de la edición"
                  value={edition.label}
                  required
                  maxLength={200}
                />
                <TextField
                  name="publication_year"
                  label="Año de publicación"
                  type="number"
                  value={edition.publication_year}
                />
                <TextField
                  name="publisher"
                  label="Editorial"
                  value={edition.publisher}
                />
                <TextField
                  name="isbn"
                  label="ISBN (si consta en la fuente)"
                  value={edition.isbn}
                  maxLength={30}
                />
                <SelectField
                  name="editorial_status"
                  label="Estado de la edición"
                  value={edition.editorial_status}
                  items={statusItems}
                />
              </EditorForm>
              {i === data.editions.length && (
                <p className="field-hint">
                  Las ediciones se conservan separadas del archivo digital.
                </p>
              )}
            </details>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Documentos y permisos</CardTitle>
          <CardDescription>
            Verificá cada archivo o enlace. La evidencia de autorización es
            privada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.documents.map((d) => {
            const p = data.permissions.find((p) => p.document_id === d.id),
              file = data.files.find((f) => f.document_id === d.id);
            return (
              <section className="document-editor" key={d.id}>
                <div className="document-heading">
                  <h3>{d.label}</h3>
                  <Badge variant="secondary">
                    {statusItems.find((s) => s.id === d.editorial_status)?.name}
                  </Badge>
                </div>
                <details className="editor-disclosure">
                  <summary>Metadatos del documento</summary>
                  <EditorForm
                    endpoint="/api/admin/document"
                    initial={{
                      id: d.id,
                      work_id: w.id,
                      access_mode: d.access_mode,
                    }}
                  >
                    <TextField
                      name="label"
                      label="Nombre público del documento"
                      value={d.label}
                      required
                      maxLength={200}
                    />
                    <SelectField
                      name="edition_id"
                      label="Edición asociada"
                      value={d.edition_id}
                      required={false}
                      items={data.editions.map((e) => ({
                        id: e.id,
                        name: e.label,
                      }))}
                    />
                    {d.access_mode === "external" && (
                      <TextField
                        name="external_url"
                        label="Enlace HTTPS"
                        type="url"
                        value={d.external_url}
                        required
                        maxLength={2000}
                      />
                    )}
                  </EditorForm>
                </details>
                {d.access_mode === "pdf" && (
                  <Upload id={d.id} hasFile={Boolean(file)} />
                )}
                {file && (
                  <Link
                    className="text-link"
                    href={`/api/admin/files/${file.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir PDF privado para revisión
                  </Link>
                )}
                {file && (
                  <p className="field-hint">
                    {file.pages} páginas ·{" "}
                    {new Intl.NumberFormat("es-AR", {
                      maximumFractionDigits: 1,
                    }).format(file.bytes / 1024 / 1024)}{" "}
                    MB · PDF privado
                  </p>
                )}
                <details className="editor-disclosure">
                  <summary>
                    Verificar autorización ·{" "}
                    {p?.state === "verified" ? "verificada" : "pendiente"}
                  </summary>
                  <EditorForm
                    endpoint="/api/admin/permission"
                    initial={{ document_id: d.id }}
                  >
                    <ReferencePicker
                      name="license_id"
                      label="Licencia de este documento"
                      entity="licenses"
                      selected={[p?.license_id ?? w.license_id]}
                      options={options.licenses.map((l) => ({
                        id: l.id,
                        name: l.name,
                      }))}
                    />
                    <TextField
                      name="evidence"
                      label="Evidencia privada de permiso o legitimidad de referencia"
                      value={p?.evidence}
                      multiline
                      required
                      maxLength={6000}
                    />
                    <TextField
                      name="valid_until"
                      label="Válido hasta (opcional)"
                      type="date"
                      value={p?.valid_until}
                    />
                    <SelectField
                      name="state"
                      label="Resultado de verificación"
                      value={p?.state ?? "pending"}
                      items={[
                        { id: "pending", name: "Pendiente" },
                        { id: "verified", name: "Verificado" },
                        { id: "rejected", name: "Rechazado" },
                      ]}
                    />
                    <CheckField
                      name="allow_public"
                      label="Confirmo que la lectura pública o la referencia están autorizadas"
                      checked={p?.allow_public}
                    />
                  </EditorForm>
                </details>
                <StatusActions
                  id={d.id}
                  target="documents"
                  status={d.editorial_status}
                />
              </section>
            );
          })}
          <details className="editor-disclosure">
            <summary>Agregar otro documento a esta obra</summary>
            <EditorForm
              endpoint="/api/admin/document"
              initial={{ work_id: w.id }}
            >
              <TextField
                name="label"
                label="Nombre del documento"
                required
                maxLength={200}
              />
              <SelectField
                name="access_mode"
                label="Disponibilidad"
                value="reference"
                items={[
                  { id: "reference", name: "Solo referencia" },
                  { id: "external", name: "Enlace externo" },
                  { id: "pdf", name: "Archivo PDF" },
                ]}
              />
              <TextField
                name="external_url"
                label="Enlace HTTPS (solo para enlace externo)"
                type="url"
                maxLength={2000}
              />
              <SelectField
                name="edition_id"
                label="Edición asociada"
                required={false}
                items={data.editions.map((e) => ({ id: e.id, name: e.label }))}
              />
            </EditorForm>
          </details>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Publicación de la obra</CardTitle>
          <CardDescription>
            Primero publicá los documentos habilitados. Luego enviá la obra a
            revisión y publicala. Despublicar retira también el acceso público a
            sus archivos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="document-heading">
            <Badge variant="outline">
              {statusItems.find((s) => s.id === w.editorial_status)?.name}
            </Badge>
            <StatusActions
              id={w.id}
              target="works"
              status={w.editorial_status}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { TextField, SelectField } from "./form";
import { kindLabels, resourceKinds } from "@/lib/library/types";
export function Intake() {
  const [mode, setMode] = useState("pdf"),
    [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [created, setCreated] = useState("");
  const router = useRouter();
  const send = async (path: string, body: unknown) => {
    const response = await fetch(`/api/admin/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw Error(data.error || "No se completó el ingreso.");
    return data;
  };
  return (
    <form
      className="editor-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (pending || created) return;
        setPending(true);
        setError("");
        const data = new FormData(e.currentTarget),
          title = String(data.get("title")),
          file = data.get("file");
        try {
          if (mode === "pdf" && (!(file instanceof File) || !file.size))
            throw Error("Seleccioná un PDF.");
          if (file instanceof File && file.size > 25 * 1024 * 1024)
            throw Error("El PDF supera los 25 MB.");
          const slug = title
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 80)
            .replace(/-$/, "");
          const work = await send("work", {
            title,
            slug: `${slug || "recurso"}-${crypto.randomUUID().slice(0, 8)}`,
            kind: data.get("kind"),
            description: "",
            author_ids: [],
            subject_ids: [],
          });
          setCreated(work.id);
          const doc = await send("document", {
            work_id: work.id,
            label:
              mode === "pdf" && file instanceof File
                ? file.name.slice(0, 200)
                : title.slice(0, 200),
            access_mode: mode,
            external_url: data.get("external_url"),
          });
          if (mode === "pdf" && file instanceof File) {
            const upload = new FormData();
            upload.set("document_id", doc.id);
            upload.set("file", file);
            const response = await fetch("/api/admin/upload", {
              method: "POST",
              body: upload,
            });
            const result = await response.json();
            if (!response.ok)
              throw Error(result.error || "No se subió el PDF.");
          }
          router.push(`/admin/obras/${work.id}`);
        } catch (e) {
          setError(
            e instanceof Error ? e.message : "No se completó el ingreso.",
          );
        } finally {
          setPending(false);
        }
      }}
    >
      <FieldGroup>
        <FieldSet>
          <FieldLegend>1. Archivo o referencia</FieldLegend>
          <div className="intake-modes">
            {[
              ["pdf", "Archivo PDF"],
              ["external", "Enlace externo"],
              ["reference", "Solo referencia"],
            ].map(([value, label]) => (
              <label key={value} className="checkbox-label">
                <input
                  type="radio"
                  name="access_mode"
                  value={value}
                  checked={mode === value}
                  onChange={() => setMode(value)}
                />
                {label}
              </label>
            ))}
          </div>
        </FieldSet>
        {mode === "pdf" && (
          <Field>
            <FieldLabel htmlFor="intake-file">
              PDF autorizado para ingresar a revisión
            </FieldLabel>
            <Input
              id="intake-file"
              name="file"
              type="file"
              accept="application/pdf,.pdf"
              required
            />
            <p className="field-hint">
              Hasta 25 MB. Se guarda privado; el ingreso no autoriza su
              publicación.
            </p>
          </Field>
        )}
        {mode === "external" && (
          <TextField
            name="external_url"
            label="Enlace HTTPS a la fuente"
            type="url"
            required
            maxLength={2000}
          />
        )}
        <TextField name="title" label="Título de la obra" required />
        <SelectField
          name="kind"
          label="Tipo de recurso"
          value="book"
          items={resourceKinds.map((id) => ({ id, name: kindLabels[id] }))}
        />
        <p className="field-hint">
          Después del ingreso vas a completar autores, ediciones, materias y
          evidencia de permisos. Todo comienza como borrador.
        </p>
      </FieldGroup>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>El ingreso necesita atención</AlertTitle>
          <AlertDescription>
            {error}
            {created && (
              <p>
                La obra ya se guardó como borrador. Podés completar el archivo y
                los datos sin crearla nuevamente.
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}
      {created ? (
        <Link className="text-link" href={`/admin/obras/${created}`}>
          Abrir el borrador guardado
        </Link>
      ) : (
        <Button type="submit" disabled={pending}>
          {pending ? "Ingresando documento…" : "Crear ingreso privado"}
        </Button>
      )}
    </form>
  );
}

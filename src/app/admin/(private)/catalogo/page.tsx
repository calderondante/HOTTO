import { adminContext, adminOptions } from "@/lib/admin/data";
import {
  EditorForm,
  TextField,
  SelectField,
  CheckField,
} from "@/components/admin/form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
export default async function Catalog({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const ctx = await adminContext();
  if (ctx.status !== "ready") return null;
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.slice(0, 160) : "";
  const data = await adminOptions(q);
  if (!data) return null;
  return (
    <>
      <div className="admin-page-intro">
        <p className="eyebrow">BASE DE LA BIBLIOTECA</p>
        <h1>Autores, fuentes y permisos.</h1>
        <p>
          Registrá cada dato una vez para reutilizarlo en tus obras. La
          evidencia de licencias permanece privada.
        </p>
      </div>
      <form method="get" className="admin-search">
        <label>
          Buscar autor, fuente o licencia
          <input
            name="q"
            type="search"
            autoComplete="off"
            defaultValue={q}
            maxLength={160}
          />
        </label>
        <button type="submit">Buscar registros</button>
      </form>
      <p className="field-hint">
        Se muestran hasta 50 coincidencias por categoría. Usá la búsqueda para
        localizar registros anteriores.
      </p>
      <div className="catalog-settings">
        <Card>
          <CardHeader>
            <CardTitle>Autores</CardTitle>
            <CardDescription>
              Autoría bibliográfica o responsable institucional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {[...data.authors, { id: "", name: "", demo: false }].map((a) => (
              <details key={a.id || "new"} className="editor-disclosure">
                <summary>{a.name || "Registrar autor"}</summary>
                <EditorForm
                  endpoint="/api/admin/author"
                  initial={a.id ? { id: a.id } : {}}
                >
                  <TextField
                    name="name"
                    label="Nombre completo"
                    value={a.name}
                    required
                  />
                </EditorForm>
              </details>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fuentes de procedencia</CardTitle>
            <CardDescription>
              Usá referencias comprobables. Marcar una fuente publicada no
              habilita sus documentos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {[
              ...data.sources,
              {
                id: "",
                label: "",
                note: "",
                urls: [],
                verification: "unverified",
                editorial_status: "draft",
              },
            ].map((s) => (
              <details key={s.id || "new"} className="editor-disclosure">
                <summary>{s.label || "Registrar fuente"}</summary>
                <EditorForm
                  endpoint="/api/admin/source"
                  initial={s.id ? { id: s.id } : {}}
                >
                  <TextField
                    name="label"
                    label="Nombre público de la fuente"
                    value={s.label}
                    required
                  />
                  <TextField
                    name="urls"
                    label="Enlaces HTTPS, uno por línea"
                    value={s.urls.join("\n")}
                    multiline
                    maxLength={6000}
                  />
                  <TextField
                    name="note"
                    label="Nota pública de procedencia"
                    value={s.note}
                    multiline
                    required
                    maxLength={3000}
                  />
                  <SelectField
                    name="verification"
                    label="Nivel de comprobación"
                    value={s.verification}
                    items={[
                      { id: "unverified", name: "Pendiente de comprobar" },
                      { id: "official", name: "Fuente primaria comprobada" },
                      {
                        id: "secondary-crosschecked",
                        name: "Fuentes secundarias cotejadas",
                      },
                      { id: "original-demo", name: "Contenido original de prueba" },
                    ]}
                  />
                  <SelectField
                    name="editorial_status"
                    label="Visibilidad de la fuente"
                    value={s.editorial_status}
                    items={[
                      { id: "draft", name: "Privada / borrador" },
                      { id: "published", name: "Publicada" },
                    ]}
                  />
                </EditorForm>
              </details>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Licencias y autorizaciones</CardTitle>
            <CardDescription>
              Registrá evidencia específica: autorización del titular, licencia
              vigente o legitimidad de la referencia. El checkbox no sustituye
              esa evidencia.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {[
              ...data.licenses,
              {
                id: "",
                name: "",
                attribution: "",
                distribution_allowed: false,
                evidence: "",
                valid_until: null,
                revoked_at: null,
              },
            ].map((l) => (
              <details key={l.id || "new"} className="editor-disclosure">
                <summary>
                  {l.name || "Registrar licencia o autorización"}
                </summary>
                <EditorForm
                  endpoint="/api/admin/license"
                  initial={l.id ? { id: l.id } : {}}
                >
                  <TextField
                    name="name"
                    label="Nombre de licencia o autorización"
                    value={l.name}
                    required
                  />
                  <TextField
                    name="attribution"
                    label="Atribución requerida"
                    value={l.attribution}
                    maxLength={1000}
                  />
                  <TextField
                    name="evidence"
                    label="Evidencia privada de autorización"
                    value={l.evidence}
                    multiline
                    maxLength={6000}
                  />
                  <CheckField
                    name="distribution_allowed"
                    label="La evidencia autoriza distribuir el archivo PDF"
                    checked={l.distribution_allowed}
                  />
                  <TextField
                    name="valid_until"
                    label="Válida hasta (opcional)"
                    value={l.valid_until}
                    type="date"
                  />
                  <CheckField
                    name="revoked"
                    label="Autorización revocada: retirar acceso público"
                    checked={Boolean(l.revoked_at)}
                  />
                </EditorForm>
              </details>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

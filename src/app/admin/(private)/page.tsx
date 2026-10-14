import Link from "next/link";
import { adminContext } from "@/lib/admin/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { kindLabels } from "@/lib/library/types";
export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const ctx = await adminContext();
  if (ctx.status !== "ready") return null;
  const params = await searchParams,
    q = typeof params.q === "string" ? params.q.slice(0, 160) : "",
    state = typeof params.estado === "string" ? params.estado : "",
    page = Math.max(1, Math.min(10000, Number(params.pagina) || 1));
  let query = ctx.client
    .from("works")
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range((page - 1) * 50, page * 50 - 1);
  if (q)
    query = query.ilike(
      "title",
      `%${q.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`,
    );
  if (["draft", "review", "published", "archived"].includes(state))
    query = query.eq(
      "editorial_status",
      state as "draft" | "review" | "published" | "archived",
    );
  const result = await query;
  if (result.error) throw Error("No pudimos cargar los documentos.");
  return (
    <>
      <div className="results-heading">
        <div>
          <h1>Tu biblioteca, en orden.</h1>
          <p>{result.count ?? 0} obras · acceso administrativo verificado</p>
        </div>
        <Button
          render={<Link href="/admin/obras/nueva" />}
          nativeButton={false}
          role="link"
        >
          Nuevo ingreso
        </Button>
      </div>
      <form className="admin-search" method="get">
        <label>
          Buscar por título
          <input
            name="q"
            type="search"
            autoComplete="off"
            defaultValue={q}
            maxLength={160}
          />
        </label>
        <label>
          Estado
          <select name="estado" defaultValue={state}>
            <option value="">Todos los estados</option>
            {[
              ["draft", "Borrador"],
              ["review", "En revisión"],
              ["published", "Publicado"],
              ["archived", "Archivado"],
            ].map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" variant="outline">
          Buscar
        </Button>
      </form>
      <div className="admin-work-list">
        {result.data.map((w) => (
          <Link
            key={w.id}
            href={`/admin/obras/${w.id}`}
            className="admin-work-card"
          >
            <div>
              <span className="eyebrow">{kindLabels[w.kind]}</span>
              <h2>{w.title}</h2>
              <p>
                Actualizada{" "}
                {new Intl.DateTimeFormat("es-AR", {
                  dateStyle: "medium",
                }).format(new Date(w.updated_at))}
              </p>
            </div>
            <Badge
              variant={
                w.editorial_status === "published" ? "secondary" : "outline"
              }
            >
              {w.editorial_status === "draft"
                ? "Borrador"
                : w.editorial_status === "review"
                  ? "En revisión"
                  : w.editorial_status === "published"
                    ? "Publicado"
                    : "Archivado"}
            </Badge>
          </Link>
        ))}
      </div>
      {!result.data.length && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              {q || state
                ? "Sin coincidencias"
                : "Tu primer ingreso empieza acá"}
            </EmptyTitle>
            <EmptyDescription>
              {q || state
                ? "Cambiá la búsqueda o el estado para ver otras obras."
                : "Los documentos que incorpores aparecerán con su estado editorial. No se importaron los ejemplos del MVP."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      <nav className="pagination" aria-label="Páginas de obras">
        {page > 1 && (
          <Link
            href={`?q=${encodeURIComponent(q)}&estado=${state}&pagina=${page - 1}`}
          >
            Anterior
          </Link>
        )}
        <span>Página {page}</span>
        {page * 50 < (result.count ?? 0) && (
          <Link
            href={`?q=${encodeURIComponent(q)}&estado=${state}&pagina=${page + 1}`}
          >
            Siguiente
          </Link>
        )}
      </nav>
    </>
  );
}

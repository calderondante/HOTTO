"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { filterCatalog, parseLibraryQuery } from "@/lib/library/query";
import {
  kindLabels,
  resourceKinds,
  type CatalogItem,
  type LibraryQuery,
  type Subject,
} from "@/lib/library/types";
import { ResourceGrid } from "./presentation";

export function CatalogExplorer({
  items,
  subjects,
  initial,
  action = "/biblioteca",
  fixedSubject,
  fixedKind,
}: {
  items: CatalogItem[];
  subjects: readonly Subject[];
  initial: LibraryQuery;
  action?: string;
  fixedSubject?: string;
  fixedKind?: "jurisprudence";
}) {
  const [query, setQuery] = useState(initial);
  useEffect(() => {
    const restore = () => {
      const values = Object.fromEntries(
        new URLSearchParams(window.location.search),
      );
      setQuery(parseLibraryQuery(values));
    };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  const updateQuery = (next: LibraryQuery) => {
    setQuery(next);
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.subject && !fixedSubject) params.set("materia", next.subject);
    if (next.kind !== "all" && !fixedKind) params.set("tipo", next.kind);
    if (next.availableOnly) params.set("disponibles", "1");
    window.history.replaceState(
      null,
      "",
      `${action}${params.size ? `?${params}` : ""}`,
    );
  };
  const filtered = filterCatalog(items, {
    ...query,
    subject: fixedSubject ?? query.subject,
    kind: fixedKind ?? query.kind,
  });
  const hasFilters = Boolean(
    query.q || query.subject || query.kind !== "all" || query.availableOnly,
  );
  const clear = () =>
    updateQuery({ q: "", subject: "", kind: "all", availableOnly: false });
  return (
    <section className="catalog-explorer" aria-label="Buscar en el catálogo">
      <form method="get" action={action} className="catalog-form">
        <Field className="search-field">
          <FieldLabel htmlFor="resource-search">Buscar recursos</FieldLabel>
          <div className="search-input">
            <Search size={19} aria-hidden="true" />
            <Input
              id="resource-search"
              name="q"
              type="search"
              maxLength={160}
              placeholder="Título, autor o palabra clave…"
              value={query.q}
              onChange={(e) => updateQuery({ ...query, q: e.target.value })}
            />
          </div>
        </Field>
        <div className="filters-row">
          <SlidersHorizontal
            size={17}
            className="filter-icon"
            aria-hidden="true"
          />
          {!fixedSubject && (
            <Field>
              <FieldLabel htmlFor="subject-filter">Materia</FieldLabel>
              <select
                id="subject-filter"
                name="materia"
                value={query.subject}
                onChange={(e) =>
                  updateQuery({ ...query, subject: e.target.value })
                }
              >
                <option value="">Todas las materias</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shortName}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {!fixedKind && (
            <Field>
              <FieldLabel htmlFor="kind-filter">Tipo de recurso</FieldLabel>
              <select
                id="kind-filter"
                name="tipo"
                value={query.kind}
                onChange={(e) =>
                  updateQuery({
                    ...query,
                    kind: e.target.value as LibraryQuery["kind"],
                  })
                }
              >
                <option value="all">Todos los recursos</option>
                {resourceKinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {kindLabels[kind]}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="disponibles"
              value="1"
              checked={query.availableOnly}
              onChange={(e) =>
                updateQuery({ ...query, availableOnly: e.target.checked })
              }
            />{" "}
            Solo con PDF de muestra
          </label>
          <Button type="submit" variant="secondary">
            Aplicar
            <ArrowRight size={16} aria-hidden="true" />
          </Button>
        </div>
      </form>
      <div className="results-heading">
        <h2> {fixedKind ? "Casos de estudio" : "Explorá el catálogo"}</h2>
        <div className="results-controls">
          <p role="status" aria-live="polite" aria-atomic="true">
            <strong>{filtered.length}</strong>{" "}
            {filtered.length === 1 ? "recurso" : "recursos"}
          </p>
          {hasFilters && (
            <Button variant="ghost" onClick={clear}>
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>
      {filtered.length ? (
        <ResourceGrid items={filtered} />
      ) : (
        <div className="empty-state">
          <Search aria-hidden="true" size={30} />
          <h3>No encontramos recursos</h3>
          <p>
            Probá con otra palabra o quitá un filtro para seguir explorando.
          </p>
          <Button variant="outline" onClick={clear}>
            Restablecer búsqueda
          </Button>
        </div>
      )}
    </section>
  );
}

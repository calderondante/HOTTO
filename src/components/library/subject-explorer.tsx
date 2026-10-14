"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { normalizeSearch, parseSubjectQuery } from "@/lib/library/query";
import type { Subject } from "@/lib/library/types";

export function SubjectExplorer({
  subjects,
  initial,
}: {
  subjects: readonly Subject[];
  initial: { q: string; year: string };
}) {
  const [search, setSearch] = useState(initial.q);
  const [year, setYear] = useState(initial.year);
  useEffect(() => {
    const restore = () => {
      const next = parseSubjectQuery(
        Object.fromEntries(new URLSearchParams(location.search)),
      );
      setSearch(next.q);
      setYear(next.year);
    };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  const update = (q: string, year: string) => {
    setSearch(q);
    setYear(year);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (year) params.set("anio", year);
    window.history.replaceState(
      null,
      "",
      `/biblioteca/materias${params.size ? `?${params}` : ""}`,
    );
  };
  const filtered = subjects.filter(
    (s) =>
      (!year || s.year === Number(year)) &&
      normalizeSearch(`${s.name} ${s.code} ${s.aliases.join(" ")}`).includes(
        normalizeSearch(search),
      ),
  );
  return (
    <section aria-label="Catálogo de materias">
      <div className="subject-search">
        <Field>
          <FieldLabel htmlFor="subject-search">Buscar una materia</FieldLabel>
          <div className="search-input">
            <Search aria-hidden="true" size={18} />
            <Input
              id="subject-search"
              name="q"
              type="search"
              maxLength={160}
              placeholder="Nombre o código académico…"
              value={search}
              onChange={(e) => update(e.target.value, year)}
            />
          </div>
        </Field>
        <Field>
          <FieldLabel htmlFor="year-filter">Año del plan</FieldLabel>
          <select
            id="year-filter"
            name="anio"
            value={year}
            onChange={(e) => update(search, e.target.value)}
          >
            <option value="">Todos los años</option>
            {[1, 2, 3, 4, 5].map((y) => (
              <option value={y} key={y}>
                {y}.º año
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="results-heading">
        <h2>Tu recorrido académico</h2>
        <p role="status" aria-live="polite">
          {filtered.length} materias
        </p>
      </div>
      <div className="subject-grid">
        {filtered.map((s) => (
          <Link
            className={`subject-card${s.pilot ? " subject-pilot" : ""}`}
            key={s.id}
            href={`/biblioteca/materias/${s.slug}`}
          >
            <div className="subject-meta">
              <span>
                {s.year}.º AÑO · {s.code}
              </span>
              {s.pilot && <Badge variant="secondary">Materia piloto</Badge>}
            </div>
            <h3>{s.name}</h3>
            <div className="subject-bottom">
              <span>{s.area}</span>
              <ArrowUpRight size={21} aria-hidden="true" />
            </div>
          </Link>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <h3>No encontramos esa materia</h3>
          <p>Buscá por nombre o código, o cambiá el año.</p>
          <Button
            variant="outline"
            onClick={() => {
              update("", "");
            }}
          >
            Ver todas las materias
          </Button>
        </div>
      )}
    </section>
  );
}

"use client";
import { useEffect, useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
export function ReferencePicker({
  name,
  label,
  entity,
  options,
  selected,
  multiple = false,
}: {
  name: string;
  label: string;
  entity: "authors" | "sources" | "licenses";
  options: { id: string; name: string }[];
  selected: string[];
  multiple?: boolean;
}) {
  const id = useId(),
    [query, setQuery] = useState(""),
    [choices, setChoices] = useState(options),
    [selection, setSelection] = useState(selected),
    [known, setKnown] = useState(options),
    [error, setError] = useState("");
  useEffect(() => {
    if (!query) return;
    const abort = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/admin/options?entity=${entity}&q=${encodeURIComponent(query)}`,
          { cache: "no-store", signal: abort.signal },
        );
        const data = await response.json();
        if (!response.ok) throw Error(data.error);
        if (abort.signal.aborted) return;
        setChoices(data.items);
        setKnown((old) => [
          ...old,
          ...data.items.filter(
            (item: { id: string }) => !old.some((o) => o.id === item.id),
          ),
        ]);
        setError("");
      } catch (e) {
        if (!abort.signal.aborted)
          setError(e instanceof Error ? e.message : "No pudimos buscar.");
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  }, [query, entity]);
  const visible = query ? choices : options;
  const selectedOptions = known.filter(
    (o) => selection.includes(o.id) && !visible.some((v) => v.id === o.id),
  );
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type="search"
        name={`buscar_${name}`}
        placeholder="Buscar un registro…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        maxLength={160}
      />
      {error && <p role="alert">{error}</p>}
      {multiple ? (
        <>
          <div className="classification-grid">
            {[...selectedOptions, ...visible].map((o) => (
              <label className="checkbox-label" key={o.id}>
                <input
                  type="checkbox"
                  checked={selection.includes(o.id)}
                  onChange={(e) =>
                    setSelection((old) =>
                      e.target.checked
                        ? [...old, o.id]
                        : old.filter((id) => id !== o.id),
                    )
                  }
                />
                {o.name}
              </label>
            ))}
          </div>
          {selection.map((id) => (
            <input key={id} type="hidden" name={`${name}[]`} value={id} />
          ))}
        </>
      ) : (
        <select
          name={name}
          aria-label={`Seleccionar ${label.toLowerCase()}`}
          value={selection[0] ?? ""}
          required
          onChange={(e) => setSelection([e.target.value])}
        >
          <option value="">Seleccionar registro</option>
          {[...selectedOptions, ...visible].map((o) => (
            <option value={o.id} key={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      )}
      <p className="field-hint">
        Hasta 50 coincidencias. Los registros seleccionados se conservan al
        cambiar la búsqueda.
      </p>
    </Field>
  );
}

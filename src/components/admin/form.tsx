"use client";
import { useId, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
export function EditorForm({
  endpoint,
  initial = {},
  children,
  label = "Guardar",
  nextPath,
  onSaved,
}: {
  endpoint: string;
  initial?: Record<string, unknown>;
  children: ReactNode;
  label?: string;
  nextPath?: string;
  onSaved?: (id: string) => void;
}) {
  const [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  const router = useRouter();
  return (
    <form
      className="editor-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (pending) return;
        const form = e.currentTarget,
          values: Record<string, unknown> = { ...initial };
        for (const [key, value] of new FormData(form)) {
          if (key.endsWith("[]")) {
            const name = key.slice(0, -2);
            values[name] = [...((values[name] as unknown[]) ?? []), value];
          } else values[key] = value;
        }
        for (const input of form.querySelectorAll<HTMLInputElement>(
          'input[type=checkbox]:not([name$="[]"])',
        ))
          values[input.name] = input.checked;
        for (const key of ["author_ids", "subject_ids"])
          if (form.querySelector(`[name="${key}[]"]`) && !values[key])
            values[key] = [];
        setPending(true);
        setError("");
        setSaved(false);
        try {
          const result = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          const data = await result.json();
          if (!result.ok)
            throw Error(
              typeof data.error === "string"
                ? data.error
                : "No se guardó el cambio.",
            );
          setSaved(true);
          if (onSaved && typeof data.id === "string") onSaved(data.id);
          else if (nextPath) router.push(nextPath.replace("{id}", data.id));
          else router.refresh();
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "No pudimos completar la operación.",
          );
        } finally {
          setPending(false);
        }
      }}
    >
      <FieldGroup>{children}</FieldGroup>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>No se guardó el cambio</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {saved && (
        <p className="save-feedback" role="status">
          Cambio guardado.
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando…" : label}
      </Button>
    </form>
  );
}
export function TextField({
  name,
  label,
  value = "",
  required = false,
  multiline = false,
  type = "text",
  maxLength = 300,
  autoComplete = "off",
}: {
  name: string;
  label: string;
  value?: string | number | null;
  required?: boolean;
  multiline?: boolean;
  type?: string;
  maxLength?: number;
  autoComplete?: string;
}) {
  const id = useId();
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {multiline ? (
        <Textarea
          id={id}
          name={name}
          defaultValue={value ?? ""}
          required={required}
          maxLength={maxLength}
          rows={4}
        />
      ) : (
        <Input
          id={id}
          name={name}
          type={type}
          defaultValue={value ?? ""}
          required={required}
          maxLength={maxLength}
          autoComplete={autoComplete}
        />
      )}
    </Field>
  );
}
export function SelectField({
  name,
  label,
  value,
  items,
  required = true,
}: {
  name: string;
  label: string;
  value?: string | null;
  items: { id: string; name: string }[];
  required?: boolean;
}) {
  const id = useId();
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <select
        id={id}
        name={name}
        defaultValue={value ?? ""}
        required={required}
      >
        {!required && <option value="">Sin selección</option>}
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </Field>
  );
}
export function CheckField({
  name,
  label,
  checked = false,
  value,
}: {
  name: string;
  label: string;
  checked?: boolean;
  value?: string;
}) {
  return (
    <label className="checkbox-label">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={checked}
      />
      {label}
    </label>
  );
}

export const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function uuid(value: unknown): string {
  if (typeof value !== "string" || !uuidPattern.test(value))
    throw Error("Identificador inválido.");
  return value;
}
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw Error("Datos inválidos.");
  return value as Record<string, unknown>;
}
export function text(value: unknown, min = 1, max = 300): string {
  if (
    typeof value !== "string" ||
    value.trim().length < min ||
    value.length > max
  )
    throw Error(`El texto debe tener entre ${min} y ${max} caracteres.`);
  return value.trim();
}
export function optionalText(value: unknown, max = 300): string | null {
  return value === null || value === undefined || value === ""
    ? null
    : text(value, 1, max);
}
export function ids(value: unknown, max = 34): string[] {
  if (!Array.isArray(value) || value.length > max)
    throw Error("Selección inválida.");
  return [...new Set(value.map(uuid))];
}
export function choice<T extends string>(
  value: unknown,
  allowed: readonly T[],
): T {
  if (typeof value !== "string" || !allowed.includes(value as T))
    throw Error("Opción inválida.");
  return value as T;
}
export function httpsUrl(value: unknown): string {
  const s = text(value, 1, 2000),
    u = new URL(s);
  if (u.protocol !== "https:" || u.username || u.password)
    throw Error("Usá un enlace HTTPS sin credenciales.");
  return u.toString();
}
export function date(value: unknown): string | null {
  if (!value) return null;
  const s = text(value, 10, 10);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(s) ||
    Number.isNaN(Date.parse(s)) ||
    new Date(s).toISOString().slice(0, 10) !== s
  )
    throw Error("Fecha inválida.");
  return s;
}
export const states = ["draft", "review", "published", "archived"] as const;
export const kinds = [
  "book",
  "jurisprudence",
  "legislation",
  "syllabus",
  "complement",
] as const;
export function workPayload(input: unknown) {
  const v = record(input),
    slug = text(v.slug, 1, 100);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))
    throw Error("La URL usa letras minúsculas, números y guiones.");
  return {
    id: v.id ? uuid(v.id) : undefined,
    revision:
      typeof v.revision === "number" && Number.isInteger(v.revision)
        ? v.revision
        : undefined,
    slug,
    kind: choice(v.kind, kinds),
    title: text(v.title),
    subtitle: text(v.subtitle ?? "", 0, 300),
    description: text(v.description ?? "", 0, 12000),
    keywords: text(v.keywords ?? "", 0, 1000)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 30),
    source_id: v.source_id ? uuid(v.source_id) : undefined,
    license_id: v.license_id ? uuid(v.license_id) : undefined,
    subject_ids: ids(v.subject_ids ?? []),
    author_ids: ids(v.author_ids ?? [], 30),
  };
}

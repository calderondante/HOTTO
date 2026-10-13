import {
  authors,
  editions,
  files,
  licenses,
  resources,
  subjects,
} from "./data.ts";
import type { CatalogItem, Resource } from "./types.ts";

// An explicit local repository. No Supabase client, credentials or simulated connection.
export function getResource(slug: string) {
  return resources.find(
    (r) => r.slug === slug && r.editorialStatus === "published",
  );
}
export function getSubject(slug: string) {
  return subjects.find((s) => s.slug === slug);
}
export function resourceHref(r: Resource) {
  const section =
    r.kind === "book"
      ? "libros"
      : r.kind === "jurisprudence"
        ? "jurisprudencia"
        : "recursos";
  return `/biblioteca/${section}/${r.slug}`;
}
export function authorLabel(r: Resource) {
  return r.authorIds
    .map((id) => authors.find((a) => a.id === id)?.name)
    .filter(Boolean)
    .join(" · ");
}
export function fileFor(r: Resource) {
  const file = files.find((f) => f.id === r.fileId);
  return file &&
    file.editionId === r.editionId &&
    editions.find((e) => e.id === file.editionId)?.workId === r.id &&
    file.licenseId === r.licenseId &&
    licenses.find((l) => l.id === file.licenseId)?.distribution ===
      "original-demo"
    ? file
    : undefined;
}
export function editionFor(r: Resource) {
  return editions.find((e) => e.id === r.editionId);
}
export function toCatalogItem(r: Resource): CatalogItem {
  return {
    id: r.id,
    slug: r.slug,
    kind: r.kind,
    title: r.title,
    subtitle: r.subtitle,
    description: r.description,
    authors: authorLabel(r),
    subjectIds: r.subjectIds,
    keywords: r.keywords,
    demo: r.demo,
    available: Boolean(fileFor(r)),
    cover: r.cover,
    href: resourceHref(r),
  };
}
export function getCatalog(): CatalogItem[] {
  return resources
    .filter((r) => r.editorialStatus === "published")
    .map(toCatalogItem);
}
export function relatedResources(r: Resource) {
  return resources
    .filter(
      (other) =>
        other.id !== r.id &&
        other.editorialStatus === "published" &&
        other.subjectIds.some((id) => r.subjectIds.includes(id)),
    )
    .slice(0, 3)
    .map(toCatalogItem);
}

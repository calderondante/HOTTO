export const resourceKinds = [
  "book",
  "jurisprudence",
  "legislation",
  "syllabus",
  "complement",
] as const;
export type ResourceKind = (typeof resourceKinds)[number];
export type EditorialStatus = "draft" | "review" | "published" | "archived";
export type Verification =
  | "official"
  | "secondary-crosschecked"
  | "original-demo";

export interface AcademicUnit {
  id: string;
  name: string;
  program: string;
  curriculumYear: number;
}
export interface Subject {
  id: string;
  code: string | null;
  slug: string;
  name: string;
  shortName: string;
  year: number;
  area: string;
  pilot: boolean;
  academicUnitId: string;
  sourceId: string;
  verification: Verification;
  aliases: readonly string[];
}
export interface Author {
  id: string;
  name: string;
  demo: boolean;
}
export interface Source {
  id: string;
  label: string;
  urls: readonly string[];
  verification: Verification;
  note: string;
}
export interface License {
  id: string;
  name: string;
  distribution: "original-demo" | "reference-only";
  evidence: string;
}
export interface Edition {
  id: string;
  workId: string;
  label: string;
  year: number;
  publisher: string;
}
export interface FileAsset {
  id: string;
  editionId: string;
  path: string;
  mime: "application/pdf";
  licenseId: string;
  pages: number;
}
export interface Jurisprudence {
  court: string;
  docket: string;
  date: string;
  topic: string;
  holding: string;
}
export interface Resource {
  id: string;
  slug: string;
  kind: ResourceKind;
  title: string;
  subtitle: string;
  description: string;
  authorIds: readonly string[];
  subjectIds: readonly string[];
  keywords: readonly string[];
  sourceId: string;
  licenseId: string;
  editionId?: string;
  fileId?: string;
  jurisprudence?: Jurisprudence;
  editorialStatus: EditorialStatus;
  demo: boolean;
  cover: "plum" | "gold" | "ink" | "cream";
}
export interface CatalogItem {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  kind: ResourceKind;
  description: string;
  authors: string;
  subjectIds: readonly string[];
  keywords: readonly string[];
  available: boolean;
  demo: boolean;
  cover: Resource["cover"];
  href: string;
}
export interface LibraryQuery {
  q: string;
  subject: string;
  kind: ResourceKind | "all";
  availableOnly: boolean;
}
export const kindLabels: Record<ResourceKind, string> = {
  book: "Manuales y doctrina",
  jurisprudence: "Jurisprudencia",
  legislation: "Legislación",
  syllabus: "Programas académicos",
  complement: "Recursos complementarios",
};

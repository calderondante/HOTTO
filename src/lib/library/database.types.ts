// Application contracts for the versioned SQL schema (not claimed as remote-generated types).
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
export type State = "draft" | "review" | "published" | "archived";
export type Kind =
  | "book"
  | "jurisprudence"
  | "legislation"
  | "syllabus"
  | "complement";
export interface WorkRow {
  id: string;
  slug: string;
  kind: Kind;
  title: string;
  subtitle: string;
  description: string;
  keywords: string[];
  source_id: string;
  license_id: string;
  editorial_status: State;
  demo: boolean;
  enabled: boolean;
  revision: number;
  created_at: string;
  updated_at: string;
}
export interface SubjectRow {
  id: string;
  academic_unit_id: string;
  source_id: string;
  code: string | null;
  slug: string;
  name: string;
  aliases: string[];
  curriculum_year: number;
  editorial_area: string | null;
  pilot: boolean;
  editorial_status: State;
}
export interface AuthorRow {
  id: string;
  name: string;
  demo: boolean;
}
export interface SourceRow {
  id: string;
  label: string;
  urls: string[];
  verification:
    | "official"
    | "secondary-crosschecked"
    | "original-demo"
    | "unverified";
  note: string;
  editorial_status: State;
}
export interface LicenseRow {
  id: string;
  name: string;
  attribution: string | null;
  distribution_allowed: boolean;
  evidence: string | null;
  revoked_at: string | null;
  valid_until: string | null;
}
export interface EditionRow {
  id: string;
  work_id: string;
  label: string;
  publication_year: number | null;
  publisher: string | null;
  isbn: string | null;
  editorial_status: State;
}
export interface DocumentRow {
  id: string;
  work_id: string;
  edition_id: string | null;
  label: string;
  access_mode: "pdf" | "external" | "reference";
  external_url: string | null;
  editorial_status: State;
  enabled: boolean;
  metadata: Json;
  metadata_origin: "manual" | "assisted";
  created_at: string;
  updated_at: string;
}
export interface PermissionRow {
  document_id: string;
  license_id: string;
  state: "pending" | "verified" | "rejected";
  allow_public: boolean;
  evidence: string;
  verified_by: string | null;
  verified_at: string | null;
  valid_until: string | null;
}
export interface FileRow {
  id: string;
  document_id: string;
  edition_id: string | null;
  license_id: string;
  distribution_allowed: boolean;
  storage_bucket: string;
  storage_path: string;
  mime: string;
  bytes: number;
  pages: number | null;
  sha256: string;
  editorial_status: State;
  validated_at: string | null;
}
export interface CaseRow {
  work_id: string;
  court: string;
  docket: string;
  decision_date: string;
  topic: string;
  holding: string;
}
export interface LegislationRow {
  work_id: string;
  authority: string;
  identifier: string;
  enacted_on: string | null;
  jurisdiction: string;
  validity_note: string;
}
export interface EventRow {
  id: number;
  entity: string;
  entity_id: string;
  actor_id: string | null;
  before_status: string | null;
  after_status: string | null;
  occurred_at: string;
}
type Table<T> = {
  Row: { [K in keyof T]: T[K] };
  Insert: Partial<T>;
  Update: Partial<T>;
  Relationships: [];
};
export interface Database {
  public: {
    Tables: {
      works: Table<WorkRow>;
      subjects: Table<SubjectRow>;
      authors: Table<AuthorRow>;
      sources: Table<SourceRow>;
      licenses: Table<LicenseRow>;
      editions: Table<EditionRow>;
      documents: Table<DocumentRow>;
      document_permissions: Table<PermissionRow>;
      files: Table<FileRow>;
      jurisprudence: Table<CaseRow>;
      legislation: Table<LegislationRow>;
      editorial_events: Table<EventRow>;
      work_subjects: Table<{ work_id: string; subject_id: string }>;
      work_authors: Table<{
        work_id: string;
        author_id: string;
        position: number;
      }>;
    };
    Views: Record<string, never>;
    Functions: {
      is_library_editor: { Args: Record<string, never>; Returns: boolean };
      save_library_work: { Args: { payload: Json }; Returns: string };
      search_catalog: {
        Args: {
          query_text?: string;
          subject_code?: string;
          kind_filter?: string;
          available_only?: boolean;
          page_number?: number;
        };
        Returns: Json;
      };
    };
    Enums: { editorial_status: State; resource_kind: Kind };
    CompositeTypes: Record<string, never>;
  };
}

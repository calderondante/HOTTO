export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  private: {
    Tables: {
      library_admins: {
        Row: {
          active: boolean
          created_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      active_administrator: { Args: never; Returns: boolean }
      document_public: { Args: { document_uuid: string }; Returns: boolean }
      document_ready: { Args: { document_uuid: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      academic_units: {
        Row: {
          curriculum_year: number
          editorial_status: Database["public"]["Enums"]["editorial_status"]
          id: string
          name: string
          program: string
          slug: string
        }
        Insert: {
          curriculum_year: number
          editorial_status?: Database["public"]["Enums"]["editorial_status"]
          id?: string
          name: string
          program: string
          slug: string
        }
        Update: {
          curriculum_year?: number
          editorial_status?: Database["public"]["Enums"]["editorial_status"]
          id?: string
          name?: string
          program?: string
          slug?: string
        }
        Relationships: []
      }
      authors: {
        Row: {
          demo: boolean
          id: string
          name: string
        }
        Insert: {
          demo?: boolean
          id?: string
          name: string
        }
        Update: {
          demo?: boolean
          id?: string
          name?: string
        }
        Relationships: []
      }
      document_permissions: {
        Row: {
          allow_public: boolean
          document_id: string
          evidence: string
          license_id: string
          state: string
          valid_until: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          allow_public?: boolean
          document_id: string
          evidence?: string
          license_id: string
          state?: string
          valid_until?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          allow_public?: boolean
          document_id?: string
          evidence?: string
          license_id?: string
          state?: string
          valid_until?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_permissions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: true
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_permissions_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          access_mode: string
          created_at: string
          edition_id: string | null
          editorial_status: Database["public"]["Enums"]["editorial_status"]
          enabled: boolean
          external_url: string | null
          id: string
          label: string
          metadata: Json
          metadata_origin: string
          updated_at: string
          work_id: string
        }
        Insert: {
          access_mode: string
          created_at?: string
          edition_id?: string | null
          editorial_status?: Database["public"]["Enums"]["editorial_status"]
          enabled?: boolean
          external_url?: string | null
          id?: string
          label: string
          metadata?: Json
          metadata_origin?: string
          updated_at?: string
          work_id: string
        }
        Update: {
          access_mode?: string
          created_at?: string
          edition_id?: string | null
          editorial_status?: Database["public"]["Enums"]["editorial_status"]
          enabled?: boolean
          external_url?: string | null
          id?: string
          label?: string
          metadata?: Json
          metadata_origin?: string
          updated_at?: string
          work_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
        ]
      }
      editions: {
        Row: {
          editorial_status: Database["public"]["Enums"]["editorial_status"]
          id: string
          isbn: string | null
          label: string
          publication_year: number | null
          publisher: string | null
          work_id: string
        }
        Insert: {
          editorial_status?: Database["public"]["Enums"]["editorial_status"]
          id?: string
          isbn?: string | null
          label: string
          publication_year?: number | null
          publisher?: string | null
          work_id: string
        }
        Update: {
          editorial_status?: Database["public"]["Enums"]["editorial_status"]
          id?: string
          isbn?: string | null
          label?: string
          publication_year?: number | null
          publisher?: string | null
          work_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "editions_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
        ]
      }
      editorial_events: {
        Row: {
          actor_id: string | null
          after_status: string | null
          before_status: string | null
          entity: string
          entity_id: string
          id: number
          occurred_at: string
        }
        Insert: {
          actor_id?: string | null
          after_status?: string | null
          before_status?: string | null
          entity: string
          entity_id: string
          id?: never
          occurred_at?: string
        }
        Update: {
          actor_id?: string | null
          after_status?: string | null
          before_status?: string | null
          entity?: string
          entity_id?: string
          id?: never
          occurred_at?: string
        }
        Relationships: []
      }
      files: {
        Row: {
          bytes: number
          distribution_allowed: boolean
          document_id: string
          edition_id: string | null
          editorial_status: Database["public"]["Enums"]["editorial_status"]
          id: string
          license_id: string
          mime: string
          pages: number | null
          sha256: string
          storage_bucket: string
          storage_path: string
          validated_at: string | null
        }
        Insert: {
          bytes: number
          distribution_allowed?: boolean
          document_id: string
          edition_id?: string | null
          editorial_status?: Database["public"]["Enums"]["editorial_status"]
          id?: string
          license_id: string
          mime: string
          pages?: number | null
          sha256: string
          storage_bucket?: string
          storage_path: string
          validated_at?: string | null
        }
        Update: {
          bytes?: number
          distribution_allowed?: boolean
          document_id?: string
          edition_id?: string | null
          editorial_status?: Database["public"]["Enums"]["editorial_status"]
          id?: string
          license_id?: string
          mime?: string
          pages?: number | null
          sha256?: string
          storage_bucket?: string
          storage_path?: string
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: true
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_license_fk"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      jurisprudence: {
        Row: {
          analysis_state: string
          applicable_law: string
          approved_at: string | null
          approved_by: string | null
          chamber: string
          court: string
          decision: string
          decision_date: string
          docket: string
          facts: string
          holding: string | null
          judicial_id: string | null
          jurisdiction: string
          legal_issue: string
          official_url: string | null
          official_verified_at: string | null
          reasoning: string
          seo_level: string
          significance: string
          topic: string
          work_id: string
        }
        Insert: {
          analysis_state?: string
          applicable_law?: string
          approved_at?: string | null
          approved_by?: string | null
          chamber?: string
          court: string
          decision?: string
          decision_date: string
          docket: string
          facts?: string
          holding?: string | null
          judicial_id?: string | null
          jurisdiction?: string
          legal_issue?: string
          official_url?: string | null
          official_verified_at?: string | null
          reasoning?: string
          seo_level?: string
          significance?: string
          topic: string
          work_id: string
        }
        Update: {
          analysis_state?: string
          applicable_law?: string
          approved_at?: string | null
          approved_by?: string | null
          chamber?: string
          court?: string
          decision?: string
          decision_date?: string
          docket?: string
          facts?: string
          holding?: string | null
          judicial_id?: string | null
          jurisdiction?: string
          legal_issue?: string
          official_url?: string | null
          official_verified_at?: string | null
          reasoning?: string
          seo_level?: string
          significance?: string
          topic?: string
          work_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "jurisprudence_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: true
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
        ]
      }
      legislation: {
        Row: {
          authority: string
          enacted_on: string | null
          identifier: string
          jurisdiction: string
          validity_note: string
          work_id: string
        }
        Insert: {
          authority: string
          enacted_on?: string | null
          identifier: string
          jurisdiction: string
          validity_note: string
          work_id: string
        }
        Update: {
          authority?: string
          enacted_on?: string | null
          identifier?: string
          jurisdiction?: string
          validity_note?: string
          work_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legislation_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: true
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          attribution: string | null
          distribution_allowed: boolean
          evidence: string | null
          id: string
          name: string
          revoked_at: string | null
          valid_until: string | null
        }
        Insert: {
          attribution?: string | null
          distribution_allowed?: boolean
          evidence?: string | null
          id?: string
          name: string
          revoked_at?: string | null
          valid_until?: string | null
        }
        Update: {
          attribution?: string | null
          distribution_allowed?: boolean
          evidence?: string | null
          id?: string
          name?: string
          revoked_at?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      sources: {
        Row: {
          editorial_status: Database["public"]["Enums"]["editorial_status"]
          id: string
          label: string
          note: string
          urls: string[]
          verification: Database["public"]["Enums"]["source_verification"]
        }
        Insert: {
          editorial_status?: Database["public"]["Enums"]["editorial_status"]
          id?: string
          label: string
          note: string
          urls?: string[]
          verification: Database["public"]["Enums"]["source_verification"]
        }
        Update: {
          editorial_status?: Database["public"]["Enums"]["editorial_status"]
          id?: string
          label?: string
          note?: string
          urls?: string[]
          verification?: Database["public"]["Enums"]["source_verification"]
        }
        Relationships: []
      }
      subjects: {
        Row: {
          academic_unit_id: string
          aliases: string[]
          code: string | null
          curriculum_year: number
          editorial_area: string | null
          editorial_status: Database["public"]["Enums"]["editorial_status"]
          id: string
          name: string
          pilot: boolean
          slug: string
          source_id: string
        }
        Insert: {
          academic_unit_id: string
          aliases?: string[]
          code?: string | null
          curriculum_year: number
          editorial_area?: string | null
          editorial_status?: Database["public"]["Enums"]["editorial_status"]
          id?: string
          name: string
          pilot?: boolean
          slug: string
          source_id: string
        }
        Update: {
          academic_unit_id?: string
          aliases?: string[]
          code?: string | null
          curriculum_year?: number
          editorial_area?: string | null
          editorial_status?: Database["public"]["Enums"]["editorial_status"]
          id?: string
          name?: string
          pilot?: boolean
          slug?: string
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_academic_unit_id_fkey"
            columns: ["academic_unit_id"]
            isOneToOne: false
            referencedRelation: "academic_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subjects_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      work_authors: {
        Row: {
          author_id: string
          position: number
          work_id: string
        }
        Insert: {
          author_id: string
          position?: number
          work_id: string
        }
        Update: {
          author_id?: string
          position?: number
          work_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_authors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_authors_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
        ]
      }
      work_subjects: {
        Row: {
          subject_id: string
          work_id: string
        }
        Insert: {
          subject_id: string
          work_id: string
        }
        Update: {
          subject_id?: string
          work_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_subjects_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
        ]
      }
      works: {
        Row: {
          created_at: string
          demo: boolean
          description: string
          editorial_status: Database["public"]["Enums"]["editorial_status"]
          enabled: boolean
          id: string
          keywords: string[]
          kind: Database["public"]["Enums"]["resource_kind"]
          license_id: string
          revision: number
          slug: string
          source_id: string
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          demo?: boolean
          description: string
          editorial_status?: Database["public"]["Enums"]["editorial_status"]
          enabled?: boolean
          id?: string
          keywords?: string[]
          kind: Database["public"]["Enums"]["resource_kind"]
          license_id: string
          revision?: number
          slug: string
          source_id: string
          subtitle?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          demo?: boolean
          description?: string
          editorial_status?: Database["public"]["Enums"]["editorial_status"]
          enabled?: boolean
          id?: string
          keywords?: string[]
          kind?: Database["public"]["Enums"]["resource_kind"]
          license_id?: string
          revision?: number
          slug?: string
          source_id?: string
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "works_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "works_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_library_editor: { Args: never; Returns: boolean }
      save_library_work: { Args: { payload: Json }; Returns: string }
      search_catalog: {
        Args: {
          available_only?: boolean
          kind_filter?: string
          page_number?: number
          query_text?: string
          subject_code?: string
        }
        Returns: Json
      }
      search_jurisprudence: {
        Args: {
          court_filter?: string
          jurisdiction_filter?: string
          page_number?: number
          query_text?: string
          subject_code?: string
          year_filter?: number
        }
        Returns: Json
      }
    }
    Enums: {
      editorial_status: "draft" | "review" | "published" | "archived"
      resource_kind:
        | "book"
        | "jurisprudence"
        | "legislation"
        | "syllabus"
        | "complement"
      source_verification:
        | "official"
        | "secondary-crosschecked"
        | "original-demo"
        | "unverified"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  private: {
    Enums: {},
  },
  public: {
    Enums: {
      editorial_status: ["draft", "review", "published", "archived"],
      resource_kind: [
        "book",
        "jurisprudence",
        "legislation",
        "syllabus",
        "complement",
      ],
      source_verification: [
        "official",
        "secondary-crosschecked",
        "original-demo",
        "unverified",
      ],
    },
  },
} as const

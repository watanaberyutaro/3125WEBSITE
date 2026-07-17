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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          body_markdown: string
          category_id: string | null
          cover_image_path: string | null
          created_at: string
          excerpt: string | null
          faq: Json
          id: string
          og_image_path: string | null
          published_at: string | null
          reading_minutes: number
          related_article_ids: string[]
          seo_description: string | null
          seo_title: string | null
          slug: string
          source_link: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          body_markdown?: string
          category_id?: string | null
          cover_image_path?: string | null
          created_at?: string
          excerpt?: string | null
          faq?: Json
          id?: string
          og_image_path?: string | null
          published_at?: string | null
          reading_minutes?: number
          related_article_ids?: string[]
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          source_link?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          body_markdown?: string
          category_id?: string | null
          cover_image_path?: string | null
          created_at?: string
          excerpt?: string | null
          faq?: Json
          id?: string
          og_image_path?: string | null
          published_at?: string | null
          reading_minutes?: number
          related_article_ids?: string[]
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          source_link?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["category_kind"]
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["category_kind"]
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["category_kind"]
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      draft_versions: {
        Row: {
          body_markdown: string
          created_at: string
          created_by: string | null
          cta_href: string | null
          cta_label: string | null
          draft_id: string
          faq: Json
          generated_by: string
          id: string
          seo_description: string | null
          seo_title: string | null
          title: string
          version_number: number
        }
        Insert: {
          body_markdown?: string
          created_at?: string
          created_by?: string | null
          cta_href?: string | null
          cta_label?: string | null
          draft_id: string
          faq?: Json
          generated_by?: string
          id?: string
          seo_description?: string | null
          seo_title?: string | null
          title: string
          version_number: number
        }
        Update: {
          body_markdown?: string
          created_at?: string
          created_by?: string | null
          cta_href?: string | null
          cta_label?: string | null
          draft_id?: string
          faq?: Json
          generated_by?: string
          id?: string
          seo_description?: string | null
          seo_title?: string | null
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "draft_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_versions_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts"
            referencedColumns: ["id"]
          },
        ]
      }
      drafts: {
        Row: {
          content_type: string
          created_at: string
          created_by: string | null
          id: string
          status: string
          target_path: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content_type: string
          created_at?: string
          created_by?: string | null
          id?: string
          status?: string
          target_path?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          status?: string
          target_path?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "drafts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          budget: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          inquiry_type: string
          message: string
          name: string
          phone: string | null
          source_path: string | null
          status: string
        }
        Insert: {
          budget?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          inquiry_type: string
          message: string
          name: string
          phone?: string | null
          source_path?: string | null
          status?: string
        }
        Update: {
          budget?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          inquiry_type?: string
          message?: string
          name?: string
          phone?: string | null
          source_path?: string | null
          status?: string
        }
        Relationships: []
      }
      job_runs: {
        Row: {
          created_at: string
          created_by: string | null
          draft_id: string
          draft_version_id: string | null
          error_message: string | null
          id: string
          input: Json
          kind: string
          output: Json
          processed_at: string | null
          result_draft_version_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          draft_id: string
          draft_version_id?: string | null
          error_message?: string | null
          id?: string
          input?: Json
          kind: string
          output?: Json
          processed_at?: string | null
          result_draft_version_id?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          draft_id?: string
          draft_version_id?: string | null
          error_message?: string | null
          id?: string
          input?: Json
          kind?: string
          output?: Json
          processed_at?: string | null
          result_draft_version_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_runs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_runs_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_runs_draft_version_id_fkey"
            columns: ["draft_version_id"]
            isOneToOne: false
            referencedRelation: "draft_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_runs_result_draft_version_id_fkey"
            columns: ["result_draft_version_id"]
            isOneToOne: false
            referencedRelation: "draft_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          role?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
      publish_jobs: {
        Row: {
          commit_sha: string | null
          commit_url: string | null
          created_at: string
          created_by: string | null
          draft_id: string
          draft_version_id: string
          error_message: string | null
          id: string
          processed_at: string | null
          status: string
          target_path: string
        }
        Insert: {
          commit_sha?: string | null
          commit_url?: string | null
          created_at?: string
          created_by?: string | null
          draft_id: string
          draft_version_id: string
          error_message?: string | null
          id?: string
          processed_at?: string | null
          status?: string
          target_path: string
        }
        Update: {
          commit_sha?: string | null
          commit_url?: string | null
          created_at?: string
          created_by?: string | null
          draft_id?: string
          draft_version_id?: string
          error_message?: string | null
          id?: string
          processed_at?: string | null
          status?: string
          target_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "publish_jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publish_jobs_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publish_jobs_draft_version_id_fkey"
            columns: ["draft_version_id"]
            isOneToOne: false
            referencedRelation: "draft_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      redirects: {
        Row: {
          created_at: string
          from_path: string
          id: string
          status_code: number
          to_path: string
        }
        Insert: {
          created_at?: string
          from_path: string
          id?: string
          status_code?: number
          to_path: string
        }
        Update: {
          created_at?: string
          from_path?: string
          id?: string
          status_code?: number
          to_path?: string
        }
        Relationships: []
      }
      review_comments: {
        Row: {
          body: string
          comment_type: string
          created_at: string
          created_by: string | null
          draft_id: string
          draft_version_id: string | null
          id: string
        }
        Insert: {
          body: string
          comment_type: string
          created_at?: string
          created_by?: string | null
          draft_id: string
          draft_version_id?: string | null
          id?: string
        }
        Update: {
          body?: string
          comment_type?: string
          created_at?: string
          created_by?: string | null
          draft_id?: string
          draft_version_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_comments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_comments_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_comments_draft_version_id_fkey"
            columns: ["draft_version_id"]
            isOneToOne: false
            referencedRelation: "draft_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      tool_leads: {
        Row: {
          created_at: string
          email: string | null
          id: string
          input: Json
          output: Json | null
          tool_slug: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          input: Json
          output?: Json | null
          tool_slug: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          input?: Json
          output?: Json | null
          tool_slug?: string
        }
        Relationships: []
      }
      works: {
        Row: {
          category_id: string | null
          category_label: string | null
          client_name: string
          cover_image_path: string | null
          created_at: string
          description: string | null
          excerpt: string | null
          external_link: string | null
          gallery: Json
          id: string
          industry_id: string | null
          og_image_path: string | null
          project_name: string
          published_at: string | null
          scope: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          status: string
          tags: string[]
          updated_at: string
          year: string | null
        }
        Insert: {
          category_id?: string | null
          category_label?: string | null
          client_name: string
          cover_image_path?: string | null
          created_at?: string
          description?: string | null
          excerpt?: string | null
          external_link?: string | null
          gallery?: Json
          id?: string
          industry_id?: string | null
          og_image_path?: string | null
          project_name: string
          published_at?: string | null
          scope?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          status?: string
          tags?: string[]
          updated_at?: string
          year?: string | null
        }
        Update: {
          category_id?: string | null
          category_label?: string | null
          client_name?: string
          cover_image_path?: string | null
          created_at?: string
          description?: string | null
          excerpt?: string | null
          external_link?: string | null
          gallery?: Json
          id?: string
          industry_id?: string | null
          og_image_path?: string | null
          project_name?: string
          published_at?: string | null
          scope?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          status?: string
          tags?: string[]
          updated_at?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "works_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "works_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      category_kind: "work_category" | "work_industry" | "article_category"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      category_kind: ["work_category", "work_industry", "article_category"],
    },
  },
} as const

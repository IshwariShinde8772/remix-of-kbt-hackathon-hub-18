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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      problem_statements: {
        Row: {
          company_name: string
          company_website: string | null
          contact_person: string
          created_at: string
          domain: string
          email: string
          expected_outcome: string | null
          id: string
          payment_proof_url: string | null
          phone: string
          problem_description: string
          problem_title: string
          resource_file_url: string | null
          resources_provided: string | null
          source_of_info: string | null
          source_of_info_detail: string | null
          status: string
          targeted_audience: string | null
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          company_name: string
          company_website?: string | null
          contact_person: string
          created_at?: string
          domain: string
          email: string
          expected_outcome?: string | null
          id?: string
          payment_proof_url?: string | null
          phone: string
          problem_description: string
          problem_title: string
          resource_file_url?: string | null
          resources_provided?: string | null
          source_of_info?: string | null
          source_of_info_detail?: string | null
          status?: string
          targeted_audience?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string
          company_website?: string | null
          contact_person?: string
          created_at?: string
          domain?: string
          email?: string
          expected_outcome?: string | null
          id?: string
          payment_proof_url?: string | null
          phone?: string
          problem_description?: string
          problem_title?: string
          resource_file_url?: string | null
          resources_provided?: string | null
          source_of_info?: string | null
          source_of_info_detail?: string | null
          status?: string
          targeted_audience?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sponsorships: {
        Row: {
          additional_notes: string | null
          company_name: string
          company_website: string | null
          contact_person: string
          created_at: string
          email: string
          id: string
          payment_proof_url: string | null
          phone: string
          sponsorship_amount: string | null
          sponsorship_type: string
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          additional_notes?: string | null
          company_name: string
          company_website?: string | null
          contact_person: string
          created_at?: string
          email: string
          id?: string
          payment_proof_url?: string | null
          phone: string
          sponsorship_amount?: string | null
          sponsorship_type: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          additional_notes?: string | null
          company_name?: string
          company_website?: string | null
          contact_person?: string
          created_at?: string
          email?: string
          id?: string
          payment_proof_url?: string | null
          phone?: string
          sponsorship_amount?: string | null
          sponsorship_type?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_problem_statements: {
        Row: {
          created_at: string | null
          domain: string | null
          expected_outcome: string | null
          id: string | null
          problem_description: string | null
          problem_title: string | null
          resources_provided: string | null
          status: string | null
          targeted_audience: string | null
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          expected_outcome?: string | null
          id?: string | null
          problem_description?: string | null
          problem_title?: string | null
          resources_provided?: string | null
          status?: string | null
          targeted_audience?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          expected_outcome?: string | null
          id?: string | null
          problem_description?: string | null
          problem_title?: string | null
          resources_provided?: string | null
          status?: string | null
          targeted_audience?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

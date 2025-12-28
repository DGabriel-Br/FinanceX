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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          changed_fields: string[] | null
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      category_order: {
        Row: {
          category_key: string
          created_at: string
          id: string
          position: number
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_key: string
          created_at?: string
          id?: string
          position?: number
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_key?: string
          created_at?: string
          id?: string
          position?: number
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      debts: {
        Row: {
          created_at: number
          id: string
          monthly_installment: number
          name: string
          paid_value: number
          start_date: string
          total_value: number
          user_id: string
        }
        Insert: {
          created_at?: number
          id?: string
          monthly_installment: number
          name: string
          paid_value?: number
          start_date: string
          total_value: number
          user_id: string
        }
        Update: {
          created_at?: number
          id?: string
          monthly_installment?: number
          name?: string
          paid_value?: number
          start_date?: string
          total_value?: number
          user_id?: string
        }
        Relationships: []
      }
      hidden_default_categories: {
        Row: {
          category_key: string
          created_at: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          category_key: string
          created_at?: string
          id?: string
          type: string
          user_id: string
        }
        Update: {
          category_key?: string
          created_at?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      investment_goals: {
        Row: {
          created_at: string
          id: string
          target_value: number
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_value: number
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          target_value?: number
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          blocked_at: string | null
          blocked_by: string | null
          created_at: string
          full_name: string | null
          id: string
          is_blocked: boolean
          last_sign_in_at: string | null
        }
        Insert: {
          blocked_at?: string | null
          blocked_by?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_blocked?: boolean
          last_sign_in_at?: string | null
        }
        Update: {
          blocked_at?: string | null
          blocked_by?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_blocked?: boolean
          last_sign_in_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          category: string
          created_at: number
          date: string
          description: string
          id: string
          type: string
          user_id: string
          value: number
        }
        Insert: {
          category: string
          created_at?: number
          date: string
          description: string
          id?: string
          type: string
          user_id: string
          value: number
        }
        Update: {
          category?: string
          created_at?: number
          date?: string
          description?: string
          id?: string
          type?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_add_admin_role: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      admin_block_user: { Args: { target_user_id: string }; Returns: boolean }
      admin_get_active_users_in_range: {
        Args: { end_date: string; start_date: string }
        Returns: number
      }
      admin_get_active_users_today: { Args: never; Returns: number }
      admin_get_active_users_week: { Args: never; Returns: number }
      admin_get_all_admins: {
        Args: never
        Returns: {
          email: string
          full_name: string
          role_created_at: string
          user_id: string
        }[]
      }
      admin_get_audit_events_in_range: {
        Args: { end_date: string; start_date: string }
        Returns: number
      }
      admin_get_audit_events_today: { Args: never; Returns: number }
      admin_get_blocked_users_count: { Args: never; Returns: number }
      admin_get_financial_stats: {
        Args: never
        Returns: {
          active_users_with_transactions: number
          avg_transactions_per_user: number
          total_transactions: number
          total_users: number
        }[]
      }
      admin_get_financial_stats_in_range: {
        Args: { end_date: string; start_date: string }
        Returns: {
          active_users_with_transactions: number
          avg_transaction_value: number
          total_expense: number
          total_income: number
          total_transactions: number
        }[]
      }
      admin_get_new_users_in_range: {
        Args: { end_date: string; start_date: string }
        Returns: number
      }
      admin_get_recent_audit_events: {
        Args: { limit_count?: number }
        Returns: {
          action: string
          changed_fields: string[]
          created_at: string
          id: string
          record_id: string
          table_name: string
          user_id: string
        }[]
      }
      admin_get_total_users: { Args: never; Returns: number }
      admin_get_transactions_by_day: {
        Args: never
        Returns: {
          count: number
          date: string
          volume: number
        }[]
      }
      admin_get_transactions_by_day_in_range: {
        Args: { end_date: string; start_date: string }
        Returns: {
          count: number
          date: string
          volume: number
        }[]
      }
      admin_get_transactions_in_range: {
        Args: { end_date: string; start_date: string }
        Returns: number
      }
      admin_get_transactions_today: { Args: never; Returns: number }
      admin_get_users_blocked_in_range: {
        Args: { end_date: string; start_date: string }
        Returns: number
      }
      admin_get_users_list: {
        Args: never
        Returns: {
          created_at: string
          email: string
          full_name: string
          is_blocked: boolean
          last_sign_in_at: string
          transaction_count: number
          user_id: string
        }[]
      }
      admin_get_volume_in_range: {
        Args: { end_date: string; start_date: string }
        Returns: number
      }
      admin_get_volume_today: { Args: never; Returns: number }
      admin_remove_admin_role: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      admin_sync_missing_profiles: {
        Args: never
        Returns: {
          synced_count: number
          synced_emails: string[]
        }[]
      }
      admin_unblock_user: { Args: { target_user_id: string }; Returns: boolean }
      check_user_blocked: { Args: { user_id: string }; Returns: boolean }
      delete_user_account: { Args: never; Returns: boolean }
      get_my_profile: {
        Args: never
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_blocked: boolean
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const

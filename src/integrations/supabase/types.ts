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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      aircraft: {
        Row: {
          active: boolean
          admin_notes: string | null
          aircraft_type: string
          annual: boolean | null
          approved_at: string | null
          approved_by: string | null
          condition: string
          created_at: string | null
          damage: boolean | null
          description: string
          engine_hours: number | null
          engine2_hours: number | null
          external_id: string | null
          id: string
          interior_rating: string | null
          last_annual_date: string | null
          location: string
          logbooks: boolean | null
          make: string
          model: string
          paint_rating: string | null
          price: number
          propeller_hours: number | null
          propeller2_hours: number | null
          serial_number: string | null
          source: string | null
          source_url: string | null
          status: string | null
          title: string
          total_hours: number
          updated_at: string | null
          user_id: string | null
          year: number
        }
        Insert: {
          active?: boolean
          admin_notes?: string | null
          aircraft_type: string
          annual?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          condition: string
          created_at?: string | null
          damage?: boolean | null
          description: string
          engine_hours?: number | null
          engine2_hours?: number | null
          external_id?: string | null
          id?: string
          interior_rating?: string | null
          last_annual_date?: string | null
          location: string
          logbooks?: boolean | null
          make: string
          model: string
          paint_rating?: string | null
          price: number
          propeller_hours?: number | null
          propeller2_hours?: number | null
          serial_number?: string | null
          source?: string | null
          source_url?: string | null
          status?: string | null
          title: string
          total_hours: number
          updated_at?: string | null
          user_id?: string | null
          year: number
        }
        Update: {
          active?: boolean
          admin_notes?: string | null
          aircraft_type?: string
          annual?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          condition?: string
          created_at?: string | null
          damage?: boolean | null
          description?: string
          engine_hours?: number | null
          engine2_hours?: number | null
          external_id?: string | null
          id?: string
          interior_rating?: string | null
          last_annual_date?: string | null
          location?: string
          logbooks?: boolean | null
          make?: string
          model?: string
          paint_rating?: string | null
          price?: number
          propeller_hours?: number | null
          propeller2_hours?: number | null
          serial_number?: string | null
          source?: string | null
          source_url?: string | null
          status?: string | null
          title?: string
          total_hours?: number
          updated_at?: string | null
          user_id?: string | null
          year?: number
        }
        Relationships: []
      }
      aircraft_images: {
        Row: {
          aircraft_id: string
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
        }
        Insert: {
          aircraft_id: string
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
        }
        Update: {
          aircraft_id?: string
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "aircraft_images_aircraft_id_fkey"
            columns: ["aircraft_id"]
            isOneToOne: false
            referencedRelation: "aircraft"
            referencedColumns: ["id"]
          },
        ]
      }
      aircraft_logbook: {
        Row: {
          aircraft_id: string
          category_class: string
          complex: boolean | null
          created_at: string
          engine_type: string | null
          equipment_type: string
          gear_type: string | null
          high_performance: boolean | null
          id: string
          make: string
          model: string
          pressurized: boolean | null
          taa: boolean | null
          type_code: string | null
          updated_at: string
          user_id: string
          year: number | null
        }
        Insert: {
          aircraft_id: string
          category_class: string
          complex?: boolean | null
          created_at?: string
          engine_type?: string | null
          equipment_type: string
          gear_type?: string | null
          high_performance?: boolean | null
          id?: string
          make: string
          model: string
          pressurized?: boolean | null
          taa?: boolean | null
          type_code?: string | null
          updated_at?: string
          user_id: string
          year?: number | null
        }
        Update: {
          aircraft_id?: string
          category_class?: string
          complex?: boolean | null
          created_at?: string
          engine_type?: string | null
          equipment_type?: string
          gear_type?: string | null
          high_performance?: boolean | null
          id?: string
          make?: string
          model?: string
          pressurized?: boolean | null
          taa?: boolean | null
          type_code?: string | null
          updated_at?: string
          user_id?: string
          year?: number | null
        }
        Relationships: []
      }
      aircraft_logbooks: {
        Row: {
          aircraft_id: string
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          uploaded_at: string
        }
        Insert: {
          aircraft_id: string
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          uploaded_at?: string
        }
        Update: {
          aircraft_id?: string
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aircraft_logbooks_aircraft_id_fkey"
            columns: ["aircraft_id"]
            isOneToOne: false
            referencedRelation: "aircraft"
            referencedColumns: ["id"]
          },
        ]
      }
      airlines: {
        Row: {
          active: boolean | null
          additional_info: string[] | null
          application_url: string | null
          bases: string[] | null
          call_sign: string
          captain_pay_year_1: string | null
          captain_pay_year_10: string | null
          captain_pay_year_5: string | null
          category: string | null
          created_at: string
          description: string
          fleet_info: Json | null
          fleet_size: number
          fo_pay_year_1: string | null
          fo_pay_year_10: string | null
          fo_pay_year_5: string | null
          id: string
          inside_scoop: string[] | null
          is_hiring: boolean | null
          logo: string | null
          most_junior_base: string | null
          most_junior_captain_hire_date: string | null
          name: string
          pilot_group_size: string
          pilot_union: string
          preferred_qualifications: string[] | null
          required_qualifications: string[] | null
          retirements_in_2025: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          additional_info?: string[] | null
          application_url?: string | null
          bases?: string[] | null
          call_sign: string
          captain_pay_year_1?: string | null
          captain_pay_year_10?: string | null
          captain_pay_year_5?: string | null
          category?: string | null
          created_at?: string
          description: string
          fleet_info?: Json | null
          fleet_size?: number
          fo_pay_year_1?: string | null
          fo_pay_year_10?: string | null
          fo_pay_year_5?: string | null
          id?: string
          inside_scoop?: string[] | null
          is_hiring?: boolean | null
          logo?: string | null
          most_junior_base?: string | null
          most_junior_captain_hire_date?: string | null
          name: string
          pilot_group_size: string
          pilot_union: string
          preferred_qualifications?: string[] | null
          required_qualifications?: string[] | null
          retirements_in_2025?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          additional_info?: string[] | null
          application_url?: string | null
          bases?: string[] | null
          call_sign?: string
          captain_pay_year_1?: string | null
          captain_pay_year_10?: string | null
          captain_pay_year_5?: string | null
          category?: string | null
          created_at?: string
          description?: string
          fleet_info?: Json | null
          fleet_size?: number
          fo_pay_year_1?: string | null
          fo_pay_year_10?: string | null
          fo_pay_year_5?: string | null
          id?: string
          inside_scoop?: string[] | null
          is_hiring?: boolean | null
          logo?: string | null
          most_junior_base?: string | null
          most_junior_captain_hire_date?: string | null
          name?: string
          pilot_group_size?: string
          pilot_union?: string
          preferred_qualifications?: string[] | null
          required_qualifications?: string[] | null
          retirements_in_2025?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      flight_entries: {
        Row: {
          actual_instrument: number | null
          aircraft_registration: string
          aircraft_type: string
          approaches: string
          arrival_airport: string
          created_at: string
          cross_country_time: number
          date: string
          day_landings: number | null
          day_takeoffs: number | null
          departure_airport: string
          dual_given: number | null
          dual_received: number | null
          end_time: string | null
          ground_training: number | null
          holds: number | null
          id: string
          instrument_time: number
          landings: number
          night_landings: number | null
          night_takeoffs: number | null
          night_time: number
          pic_time: number
          remarks: string | null
          route: string | null
          sic_time: number | null
          simulated_flight: number | null
          simulated_instrument: number | null
          solo_time: number | null
          start_time: string | null
          total_time: number
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_instrument?: number | null
          aircraft_registration: string
          aircraft_type: string
          approaches?: string
          arrival_airport: string
          created_at?: string
          cross_country_time?: number
          date: string
          day_landings?: number | null
          day_takeoffs?: number | null
          departure_airport: string
          dual_given?: number | null
          dual_received?: number | null
          end_time?: string | null
          ground_training?: number | null
          holds?: number | null
          id?: string
          instrument_time?: number
          landings?: number
          night_landings?: number | null
          night_takeoffs?: number | null
          night_time?: number
          pic_time?: number
          remarks?: string | null
          route?: string | null
          sic_time?: number | null
          simulated_flight?: number | null
          simulated_instrument?: number | null
          solo_time?: number | null
          start_time?: string | null
          total_time?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_instrument?: number | null
          aircraft_registration?: string
          aircraft_type?: string
          approaches?: string
          arrival_airport?: string
          created_at?: string
          cross_country_time?: number
          date?: string
          day_landings?: number | null
          day_takeoffs?: number | null
          departure_airport?: string
          dual_given?: number | null
          dual_received?: number | null
          end_time?: string | null
          ground_training?: number | null
          holds?: number | null
          id?: string
          instrument_time?: number
          landings?: number
          night_landings?: number | null
          night_takeoffs?: number | null
          night_time?: number
          pic_time?: number
          remarks?: string | null
          route?: string | null
          sic_time?: number | null
          simulated_flight?: number | null
          simulated_instrument?: number | null
          solo_time?: number | null
          start_time?: string | null
          total_time?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      route_step_connections: {
        Row: {
          created_at: string
          from_step_id: string
          id: string
          to_step_id: string
        }
        Insert: {
          created_at?: string
          from_step_id: string
          id?: string
          to_step_id: string
        }
        Update: {
          created_at?: string
          from_step_id?: string
          id?: string
          to_step_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_step_connections_from_step_id_fkey"
            columns: ["from_step_id"]
            isOneToOne: false
            referencedRelation: "route_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_step_connections_to_step_id_fkey"
            columns: ["to_step_id"]
            isOneToOne: false
            referencedRelation: "route_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      route_step_details: {
        Row: {
          checked: boolean
          created_at: string
          description: string
          flight_hours: number | null
          id: string
          order_number: number
          route_step_id: string
          title: string
          updated_at: string
        }
        Insert: {
          checked?: boolean
          created_at?: string
          description: string
          flight_hours?: number | null
          id?: string
          order_number?: number
          route_step_id: string
          title: string
          updated_at?: string
        }
        Update: {
          checked?: boolean
          created_at?: string
          description?: string
          flight_hours?: number | null
          id?: string
          order_number?: number
          route_step_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_step_details_route_step_id_fkey"
            columns: ["route_step_id"]
            isOneToOne: false
            referencedRelation: "route_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      route_step_sub_topics: {
        Row: {
          checked: boolean
          created_at: string
          flight_hours: number | null
          id: string
          order_number: number
          route_step_detail_id: string
          title: string
          updated_at: string
        }
        Insert: {
          checked?: boolean
          created_at?: string
          flight_hours?: number | null
          id?: string
          order_number?: number
          route_step_detail_id: string
          title: string
          updated_at?: string
        }
        Update: {
          checked?: boolean
          created_at?: string
          flight_hours?: number | null
          id?: string
          order_number?: number
          route_step_detail_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      route_steps: {
        Row: {
          allow_customer_reorder: boolean
          created_at: string
          description: string
          icon: string
          id: string
          mandatory: boolean
          order_number: number
          overview: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          allow_customer_reorder?: boolean
          created_at?: string
          description: string
          icon?: string
          id?: string
          mandatory?: boolean
          order_number: number
          overview?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          allow_customer_reorder?: boolean
          created_at?: string
          description?: string
          icon?: string
          id?: string
          mandatory?: boolean
          order_number?: number
          overview?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
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

// Hand-written to match db/migrations/001_init.sql.
// Regenerate with `npm run db:types` once the Supabase CLI is linked.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          preferred_language: string;
          marketing_consent: boolean;
          member_since: string;
          total_trips: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          preferred_language?: string;
          marketing_consent?: boolean;
          member_since?: string;
          total_trips?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          preferred_language?: string;
          marketing_consent?: boolean;
          member_since?: string;
          total_trips?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      buildings: {
        Row: {
          id: string;
          name: string;
          address: string;
          neighborhood_slug: string;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          address: string;
          neighborhood_slug: string;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          neighborhood_slug?: string;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          building_id: string | null;
          hostaway_listing_id: string | null;
          slug: string;
          name: string;
          subtitle: string | null;
          neighborhood: string;
          description: string | null;
          content: Json;
          images: Json;
          max_guests: number;
          bedrooms: number;
          bathrooms: number;
          price_from_ron: number | null;
          active: boolean;
          last_synced_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          building_id?: string | null;
          hostaway_listing_id?: string | null;
          slug: string;
          name: string;
          subtitle?: string | null;
          neighborhood: string;
          description?: string | null;
          content?: Json;
          images?: Json;
          max_guests?: number;
          bedrooms?: number;
          bathrooms?: number;
          price_from_ron?: number | null;
          active?: boolean;
          last_synced_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          building_id?: string | null;
          hostaway_listing_id?: string | null;
          slug?: string;
          name?: string;
          subtitle?: string | null;
          neighborhood?: string;
          description?: string | null;
          content?: Json;
          images?: Json;
          max_guests?: number;
          bedrooms?: number;
          bathrooms?: number;
          price_from_ron?: number | null;
          active?: boolean;
          last_synced_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      availability: {
        Row: {
          property_id: string;
          date: string;
          available: boolean;
          price_ron: number;
          min_stay: number;
        };
        Insert: {
          property_id: string;
          date: string;
          available: boolean;
          price_ron: number;
          min_stay?: number;
        };
        Update: {
          property_id?: string;
          date?: string;
          available?: boolean;
          price_ron?: number;
          min_stay?: number;
        };
        Relationships: [];
      };
      exchange_rates: {
        Row: {
          date: string;
          currency: string;
          rate: number;
          fetched_at: string;
        };
        Insert: {
          date: string;
          currency: string;
          rate: number;
          fetched_at?: string;
        };
        Update: {
          date?: string;
          currency?: string;
          rate?: number;
          fetched_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price_eur: number;
          unit: 'per_stay' | 'per_night' | 'per_person' | 'per_person_night';
          active: boolean;
          sort: number;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          price_eur: number;
          unit: 'per_stay' | 'per_night' | 'per_person' | 'per_person_night';
          active?: boolean;
          sort?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price_eur?: number;
          unit?: 'per_stay' | 'per_night' | 'per_person' | 'per_person_night';
          active?: boolean;
          sort?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          order_id: string;
          user_id: string;
          property_id: string;
          hostaway_reservation_id: string | null;
          check_in: string;
          check_out: string;
          guests: number;
          adults: number;
          children: number;
          infants: number;
          rate_plan: 'non_refundable' | 'flexible';
          accommodation_ron: number;
          extras_ron: number;
          city_tax_ron: number;
          total_ron: number;
          extras: Json;
          display_currency: string;
          display_fx_rate: number | null;
          currency: string;
          status: 'pending' | 'confirmed' | 'cancelled';
          stripe_session_id: string | null;
          stripe_payment_intent_id: string | null;
          guest_name: string;
          guest_email: string;
          guest_phone: string | null;
          invoice_company: string | null;
          invoice_vat: string | null;
          invoice_reg_com: string | null;
          invoice_address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          user_id: string;
          property_id: string;
          hostaway_reservation_id?: string | null;
          check_in: string;
          check_out: string;
          guests: number;
          adults?: number;
          children?: number;
          infants?: number;
          rate_plan: 'non_refundable' | 'flexible';
          accommodation_ron: number;
          extras_ron?: number;
          city_tax_ron: number;
          total_ron: number;
          extras?: Json;
          display_currency?: string;
          display_fx_rate?: number | null;
          currency?: string;
          status?: 'pending' | 'confirmed' | 'cancelled';
          stripe_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          guest_name: string;
          guest_email: string;
          guest_phone?: string | null;
          invoice_company?: string | null;
          invoice_vat?: string | null;
          invoice_reg_com?: string | null;
          invoice_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          user_id?: string;
          property_id?: string;
          hostaway_reservation_id?: string | null;
          check_in?: string;
          check_out?: string;
          guests?: number;
          adults?: number;
          children?: number;
          infants?: number;
          rate_plan?: 'non_refundable' | 'flexible';
          accommodation_ron?: number;
          extras_ron?: number;
          city_tax_ron?: number;
          total_ron?: number;
          extras?: Json;
          display_currency?: string;
          display_fx_rate?: number | null;
          currency?: string;
          status?: 'pending' | 'confirmed' | 'cancelled';
          stripe_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          guest_name?: string;
          guest_email?: string;
          guest_phone?: string | null;
          invoice_company?: string | null;
          invoice_vat?: string | null;
          invoice_reg_com?: string | null;
          invoice_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      processed_stripe_events: {
        Row: {
          event_id: string;
          type: string;
          created_at: string;
        };
        Insert: {
          event_id: string;
          type: string;
          created_at?: string;
        };
        Update: {
          event_id?: string;
          type?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      booking_services: {
        Row: {
          booking_id: string;
          service_id: string;
          qty: number;
          unit_price_eur: number;
        };
        Insert: {
          booking_id: string;
          service_id: string;
          qty?: number;
          unit_price_eur: number;
        };
        Update: {
          booking_id?: string;
          service_id?: string;
          qty?: number;
          unit_price_eur?: number;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          property_id: string;
          source: 'hostaway' | 'manual';
          author: string | null;
          rating: number;
          text: string | null;
          stayed_at: string | null;
          published: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          property_id: string;
          source?: 'hostaway' | 'manual';
          author?: string | null;
          rating: number;
          text?: string | null;
          stayed_at?: string | null;
          published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          source?: 'hostaway' | 'manual';
          author?: string | null;
          rating?: number;
          text?: string | null;
          stayed_at?: string | null;
          published?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      integration_tokens: {
        Row: {
          provider: string;
          access_token: string;
          token_type: string;
          expires_at: string;
          updated_at: string;
        };
        Insert: {
          provider: string;
          access_token: string;
          token_type?: string;
          expires_at: string;
          updated_at?: string;
        };
        Update: {
          provider?: string;
          access_token?: string;
          token_type?: string;
          expires_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

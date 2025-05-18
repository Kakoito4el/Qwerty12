export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          first_name: string | null;
          last_name: string | null;
          is_admin: boolean;
          email_confirmed_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          first_name?: string | null;
          last_name?: string | null;
          is_admin?: boolean;
          email_confirmed_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          first_name?: string | null;
          last_name?: string | null;
          is_admin?: boolean;
          email_confirmed_at?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
      };
      products: {
        Row: {
          category: any;
          id: string;
          name: string;
          description: string;
          price: number;
          image_url: string;
          stock: number;
          category_id: string | null;
          specifications: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          price: number;
          image_url: string;
          stock: number;
          category_id?: string | null;
          specifications?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: number;
          image_url?: string;
          stock?: number;
          category_id?: string | null;
          specifications?: Record<string, any>;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          total_price: number;
          shipping_info: {
            address: string;
            city: string;
            state: string;
            zip: string;
            country: string;
          };
          payment_info: {
            method: string;
            card_number: string;
            cardholder: string;
            expiry: string;
            cvv: string;
          };
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_price: number;
          shipping_info: {
            address: string;
            city: string;
            state: string;
            zip: string;
            country: string;
          };
          payment_info: {
            method: string;
            card_number: string;
            cardholder: string;
            expiry: string;
            cvv: string;
          };
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_price?: number;
          shipping_info?: {
            address?: string;
            city?: string;
            state?: string;
            zip?: string;
            country?: string;
          };
          payment_info?: {
            method?: string;
            card_number?: string;
            cardholder?: string;
            expiry?: string;
            cvv?: string;
          };
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          price?: number;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

export type User = Database['public']['Tables']['users']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];

export type CartItem = {
  product: Product;
  quantity: number;
};

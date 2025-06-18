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
          product_id: string | null;
          build_id: string | null;
          quantity: number;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          build_id?: string | null;
          quantity: number;
          price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          build_id?: string | null;
          quantity?: number;
          price?: number;
          created_at?: string;
        };
      };

      pc_builds: {
        Row: {
          id: string;
          components: string[]; // массив ID товаров
          created_at: string;
        };
        Insert: {
          id?: string;
          components: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          components?: string[];
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

// --- Типы, которые ты используешь в приложении ---

export type User = Database['public']['Tables']['users']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];

// Расширенный тип Product с вложенной категорией
export type Product = Database['public']['Tables']['products']['Row'] & {
  category?: Category;
  
};

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type PCBuild = Database['public']['Tables']['pc_builds']['Row'];

// Тип элемента в корзине
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  isBuild?: boolean;     // Добавь это
  buildId?: string;      // И это (уникальный id для сборки)
  components?: Product[]; // 🟢 добавляем это
}

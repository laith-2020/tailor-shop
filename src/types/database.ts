export type UserRole = 'owner' | 'staff';

export type OrderStatus = 'new' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';

export interface Shop {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  currency: string;
  measurement_unit: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  shop_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  shop_id: string;
  full_name: string;
  phone: string;
  alternative_phone?: string | null;
  address?: string | null;
  notes?: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  shop_id: string;
  customer_id: string;
  order_number: string;
  order_date: string;
  expected_delivery_date: string;
  actual_delivery_date?: string | null;
  garment_type: string;
  fabric?: string | null;
  color?: string | null;
  price: number;
  paid_amount: number;
  status: OrderStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  customer?: Customer;
  measurements?: Measurement;
}

export interface Measurement {
  id: string;
  shop_id: string;
  order_id: string;
  
  // Standard Garment measurements (in cm)
  length?: number | null;
  shoulder?: number | null;
  sleeve_length?: number | null;
  chest?: number | null;
  waist?: number | null;
  hip?: number | null;
  neck?: number | null;
  arm_width?: number | null;
  wrist?: number | null;
  bottom_width?: number | null;
  
  // Pants / Sirwal measurements
  pants_length?: number | null;
  pants_waist?: number | null;
  pants_thigh?: number | null;
  pants_bottom?: number | null;
  
  additional_measurements?: Record<string, number | string | null>;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      shops: {
        Row: Shop;
        Insert: Omit<Shop, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Shop, 'id' | 'created_at'>>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      customers: {
        Row: Customer;
        Insert: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'is_archived'> & {
          id?: string;
          is_archived?: boolean;
        };
        Update: Partial<Omit<Customer, 'id' | 'created_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Order, 'id' | 'created_at'>>;
      };
      measurements: {
        Row: Measurement;
        Insert: Omit<Measurement, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Measurement, 'id' | 'created_at'>>;
      };
    };
  };
}

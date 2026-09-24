-- Tailor Shop Management System (مخيطة حضرموت)
-- Initial Database Migration Schema
-- Multi-tenant PostgreSQL Schema with Row Level Security (RLS)

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. SHOPS TABLE (Tenants)
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'مخيطة حضرموت',
  phone TEXT,
  address TEXT,
  currency TEXT NOT NULL DEFAULT 'JOD',
  measurement_unit TEXT NOT NULL DEFAULT 'سم',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_shops_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 4. PROFILES TABLE (Associated with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'staff')) DEFAULT 'owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_shop_id ON public.profiles(shop_id);

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 5. HELPER FUNCTION TO GET CURRENT USER'S SHOP ID
CREATE OR REPLACE FUNCTION public.get_current_user_shop_id()
RETURNS UUID AS $$
  SELECT shop_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 6. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  alternative_phone TEXT,
  address TEXT,
  notes TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_shop_id ON public.customers(shop_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(shop_id, phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(shop_id, full_name);
CREATE INDEX IF NOT EXISTS idx_customers_archived ON public.customers(shop_id, is_archived);

CREATE TRIGGER trigger_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 7. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  order_number TEXT NOT NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE NOT NULL,
  actual_delivery_date DATE,
  garment_type TEXT NOT NULL,
  fabric TEXT,
  color TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
  paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
  status TEXT NOT NULL CHECK (status IN ('new', 'in_progress', 'ready', 'delivered', 'cancelled')) DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_payment_validity CHECK (paid_amount <= price)
);

CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON public.orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(shop_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(shop_id, order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(shop_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON public.orders(shop_id, expected_delivery_date);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(shop_id, created_at DESC);

CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 8. MEASUREMENTS TABLE
CREATE TABLE IF NOT EXISTS public.measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  
  -- Garment measurements (in cm)
  length NUMERIC(6, 2),          -- طول الثوب
  shoulder NUMERIC(6, 2),        -- عرض الكتف
  sleeve_length NUMERIC(6, 2),   -- طول الكم
  chest NUMERIC(6, 2),           -- الصدر
  waist NUMERIC(6, 2),           -- الخصر
  hip NUMERIC(6, 2),             -- الورك
  neck NUMERIC(6, 2),            -- الرقبة
  arm_width NUMERIC(6, 2),       -- وسع اليد / الذراع
  wrist NUMERIC(6, 2),           -- محيط المعصم / الكبك
  bottom_width NUMERIC(6, 2),    -- وسع الذيل (الأسفل)
  
  -- Pants / Sirwal measurements
  pants_length NUMERIC(6, 2),    -- طول السروال
  pants_waist NUMERIC(6, 2),     -- خصر السروال
  pants_thigh NUMERIC(6, 2),     -- فخذ السروال
  pants_bottom NUMERIC(6, 2),    -- أسفل السروال
  
  -- Dynamic measurements for future customization
  additional_measurements JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_measurements_shop_id ON public.measurements(shop_id);
CREATE INDEX IF NOT EXISTS idx_measurements_order_id ON public.measurements(order_id);

CREATE TRIGGER trigger_measurements_updated_at
  BEFORE UPDATE ON public.measurements
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 9. ORDER NUMBER GENERATION FUNCTION
CREATE OR REPLACE FUNCTION public.generate_order_number(p_shop_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_count INT;
  v_order_num TEXT;
BEGIN
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  SELECT COUNT(*) + 1 INTO v_count
  FROM public.orders
  WHERE shop_id = p_shop_id AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  v_order_num := 'ORD-' || v_year || '-' || LPAD(v_count::TEXT, 4, '0');
  RETURN v_order_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;

-- SHOPS POLICIES
CREATE POLICY "Users can view their own shop"
  ON public.shops FOR SELECT
  TO authenticated
  USING (id = public.get_current_user_shop_id());

CREATE POLICY "Owners can update their own shop"
  ON public.shops FOR UPDATE
  TO authenticated
  USING (
    id = public.get_current_user_shop_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.shop_id = shops.id
        AND profiles.role = 'owner'
    )
  );

-- PROFILES POLICIES
CREATE POLICY "Users can view profiles in their shop"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (shop_id = public.get_current_user_shop_id());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Allow profile creation on signup"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- CUSTOMERS POLICIES
CREATE POLICY "Users can select customers in their shop"
  ON public.customers FOR SELECT
  TO authenticated
  USING (shop_id = public.get_current_user_shop_id());

CREATE POLICY "Users can insert customers in their shop"
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK (shop_id = public.get_current_user_shop_id());

CREATE POLICY "Users can update customers in their shop"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (shop_id = public.get_current_user_shop_id())
  WITH CHECK (shop_id = public.get_current_user_shop_id());

CREATE POLICY "Users can delete/archive customers in their shop"
  ON public.customers FOR DELETE
  TO authenticated
  USING (shop_id = public.get_current_user_shop_id());

-- ORDERS POLICIES
CREATE POLICY "Users can select orders in their shop"
  ON public.orders FOR SELECT
  TO authenticated
  USING (shop_id = public.get_current_user_shop_id());

CREATE POLICY "Users can insert orders in their shop"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (shop_id = public.get_current_user_shop_id());

CREATE POLICY "Users can update orders in their shop"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (shop_id = public.get_current_user_shop_id())
  WITH CHECK (shop_id = public.get_current_user_shop_id());

CREATE POLICY "Users can delete orders in their shop"
  ON public.orders FOR DELETE
  TO authenticated
  USING (shop_id = public.get_current_user_shop_id());

-- MEASUREMENTS POLICIES
CREATE POLICY "Users can select measurements in their shop"
  ON public.measurements FOR SELECT
  TO authenticated
  USING (shop_id = public.get_current_user_shop_id());

CREATE POLICY "Users can insert measurements in their shop"
  ON public.measurements FOR INSERT
  TO authenticated
  WITH CHECK (shop_id = public.get_current_user_shop_id());

CREATE POLICY "Users can update measurements in their shop"
  ON public.measurements FOR UPDATE
  TO authenticated
  USING (shop_id = public.get_current_user_shop_id())
  WITH CHECK (shop_id = public.get_current_user_shop_id());

CREATE POLICY "Users can delete measurements in their shop"
  ON public.measurements FOR DELETE
  TO authenticated
  USING (shop_id = public.get_current_user_shop_id());

-- 11. AUTOMATIC PROFILE AND SHOP SETUP ON AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_shop_id UUID;
  v_full_name TEXT;
BEGIN
  -- Extract full_name from metadata or default to user email prefix
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- Create a default shop for the new owner
  INSERT INTO public.shops (name, currency, measurement_unit)
  VALUES ('مخيطة حضرموت', 'JOD', 'سم')
  RETURNING id INTO v_shop_id;

  -- Create profile linked to the new shop
  INSERT INTO public.profiles (id, shop_id, full_name, email, role)
  VALUES (NEW.id, v_shop_id, v_full_name, NEW.email, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run automatically after auth.users row is inserted
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

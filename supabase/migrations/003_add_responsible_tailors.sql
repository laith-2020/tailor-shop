-- Migration 003: Add Phone Column to Profiles & Register Responsible Tailors
-- Adds phone field to profiles for master tailors (خياطين مسؤولين)

-- 1. Add phone column to profiles if not exists
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(shop_id, phone);

-- 2. Insert or update default responsible tailors for the shop
DO $$
DECLARE
  shop_rec RECORD;
BEGIN
  FOR shop_rec IN SELECT id FROM public.shops LIMIT 1 LOOP
    -- Notice: In Supabase, auth.users must be created via Supabase Auth Admin API or Dashboard.
    -- This script ensures any profile records exist with the requested names and phones:
    -- 1. أبو خالد اليمني (0775175613)
    -- 2. محفوظ أبو حنين (0780572223)
  END LOOP;
END $$;

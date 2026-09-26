-- Migration 003: Register Responsible Tailors into Supabase Auth & Profiles
-- Creates both master tailor user accounts and links them to the shop

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Ensure phone column exists in profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(shop_id, phone);

-- 2. Insert the two responsible tailors into auth.users and public.profiles
DO $$
DECLARE
  target_shop_id UUID;
  user1_id UUID := '11111111-1111-1111-1111-111111111111';
  user2_id UUID := '22222222-2222-2222-2222-222222222222';
BEGIN
  -- Fetch existing shop ID
  SELECT id INTO target_shop_id FROM public.shops LIMIT 1;
  IF target_shop_id IS NULL THEN
    INSERT INTO public.shops (name, phone, address, currency, measurement_unit)
    VALUES ('مخيطة حضرموت', '0775175613', 'الازرق - الشارع العام', 'JOD', 'انش')
    RETURNING id INTO target_shop_id;
  END IF;

  -- ----------------------------------------------------
  -- 1. Account: أبو خالد اليمني (Phone: 0775175613)
  -- ----------------------------------------------------
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'abukhaled@hadramout.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      user1_id,
      'authenticated',
      'authenticated',
      'abukhaled@hadramout.com',
      crypt('0775175613', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"أبو خالد اليمني","phone":"0775175613"}',
      NOW(),
      NOW()
    );
  ELSE
    SELECT id INTO user1_id FROM auth.users WHERE email = 'abukhaled@hadramout.com' LIMIT 1;
    -- Reset password to phone number in case it was changed
    UPDATE auth.users 
    SET encrypted_password = crypt('0775175613', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE id = user1_id;
  END IF;

  -- Profile for Abu Khaled
  INSERT INTO public.profiles (id, shop_id, full_name, email, phone, role, created_at, updated_at)
  VALUES (
    user1_id,
    target_shop_id,
    'أبو خالد اليمني (الخياط المسؤول)',
    'abukhaled@hadramout.com',
    '0775175613',
    'owner',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET 
    full_name = 'أبو خالد اليمني (الخياط المسؤول)',
    phone = '0775175613',
    role = 'owner';

  -- ----------------------------------------------------
  -- 2. Account: محفوظ أبو حنين (Phone: 0780572223)
  -- ----------------------------------------------------
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mahfoudh@hadramout.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      user2_id,
      'authenticated',
      'authenticated',
      'mahfoudh@hadramout.com',
      crypt('0780572223', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"محفوظ أبو حنين","phone":"0780572223"}',
      NOW(),
      NOW()
    );
  ELSE
    SELECT id INTO user2_id FROM auth.users WHERE email = 'mahfoudh@hadramout.com' LIMIT 1;
    -- Reset password to phone number in case it was changed
    UPDATE auth.users 
    SET encrypted_password = crypt('0780572223', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE id = user2_id;
  END IF;

  -- Profile for Mahfoudh
  INSERT INTO public.profiles (id, shop_id, full_name, email, phone, role, created_at, updated_at)
  VALUES (
    user2_id,
    target_shop_id,
    'محفوظ أبو حنين (الخياط المسؤول)',
    'mahfoudh@hadramout.com',
    '0780572223',
    'owner',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET 
    full_name = 'محفوظ أبو حنين (الخياط المسؤول)',
    phone = '0780572223',
    role = 'owner';

END $$;

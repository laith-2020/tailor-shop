-- Development & Demo Seed Data for Tailor Shop System
-- Note: Replace '<YOUR_SHOP_ID>' with an actual shop ID when running manually in Supabase.
-- Or this script creates a demonstration shop if run directly.

DO $$
DECLARE
  demo_shop_id UUID;
  cust1 UUID;
  cust2 UUID;
  cust3 UUID;
  cust4 UUID;
  cust5 UUID;
  ord1 UUID;
  ord2 UUID;
  ord3 UUID;
  ord4 UUID;
  ord5 UUID;
  ord6 UUID;
  ord7 UUID;
BEGIN
  -- Insert or fetch demo shop
  INSERT INTO public.shops (name, phone, address, currency, measurement_unit)
  VALUES ('مخيطة حضرموت', '0791234567', 'عمان - شارع وصفي التل', 'JOD', 'سم')
  RETURNING id INTO demo_shop_id;

  -- 1. Insert 5 Customers
  INSERT INTO public.customers (id, shop_id, full_name, phone, alternative_phone, address, notes)
  VALUES 
    (gen_random_uuid(), demo_shop_id, 'أحمد محمود القيسي', '0795551122', '0788881122', 'عمان - الجبيهة', 'يفضل الخياطة المزدوجة للأكمام'),
    (gen_random_uuid(), demo_shop_id, 'عمر خالد النجار', '0781239876', NULL, 'عمان - تلاع العلي', 'زبون قديم منذ 2021'),
    (gen_random_uuid(), demo_shop_id, 'محمد عبد الله العبادي', '0777123456', '0799994433', 'عمان - الصويفية', 'يفضل الأقمشة القطنية اليابانية'),
    (gen_random_uuid(), demo_shop_id, 'طارق زياد الكردي', '0796543210', NULL, 'عمان - الشميساني', 'مستعجل دائماً للمناسبات'),
    (gen_random_uuid(), demo_shop_id, 'يوسف سليم التميمي', '0785559988', NULL, 'عمان - دابوق', 'تفصيل دشاديش كلاسيكية وسراويل قطنية')
  RETURNING id INTO cust1;

  -- Retrieve all created customer IDs
  SELECT id INTO cust1 FROM public.customers WHERE phone = '0795551122' LIMIT 1;
  SELECT id INTO cust2 FROM public.customers WHERE phone = '0781239876' LIMIT 1;
  SELECT id INTO cust3 FROM public.customers WHERE phone = '0777123456' LIMIT 1;
  SELECT id INTO cust4 FROM public.customers WHERE phone = '0796543210' LIMIT 1;
  SELECT id INTO cust5 FROM public.customers WHERE phone = '0785559988' LIMIT 1;

  -- 2. Insert Orders with various realistic statuses
  -- Customer 1 Orders
  INSERT INTO public.orders (shop_id, customer_id, order_number, order_date, expected_delivery_date, garment_type, fabric, color, price, paid_amount, status, notes)
  VALUES (demo_shop_id, cust1, 'ORD-2026-0001', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '2 days', 'ثوب كويتي قلاب', 'قطن ياباني نخب أول', 'أبيض ناصع', 45.00, 45.00, 'delivered', 'تم الاستلام وهو راضٍ جداً')
  RETURNING id INTO ord1;

  INSERT INTO public.orders (shop_id, customer_id, order_number, order_date, expected_delivery_date, garment_type, fabric, color, price, paid_amount, status, notes)
  VALUES (demo_shop_id, cust1, 'ORD-2026-0002', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '5 days', 'ثوب سعودي كلاسيك', 'سلك كوري ممتاز', 'كريمي فاتح', 40.00, 20.00, 'in_progress', 'دفعة أولى 20 د.أ والباقي عند الاستلام')
  RETURNING id INTO ord2;

  -- Customer 2 Orders
  INSERT INTO public.orders (shop_id, customer_id, order_number, order_date, expected_delivery_date, garment_type, fabric, color, price, paid_amount, status, notes)
  VALUES (demo_shop_id, cust2, 'ORD-2026-0003', CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE, 'دشداشة عمانية مطرزة', 'لينن مخلوط', 'كحلي غامق', 55.00, 55.00, 'ready', 'جاهز للتسليم اليوم')
  RETURNING id INTO ord3;

  -- Customer 3 Orders
  INSERT INTO public.orders (shop_id, customer_id, order_number, order_date, expected_delivery_date, garment_type, fabric, color, price, paid_amount, status, notes)
  VALUES (demo_shop_id, cust3, 'ORD-2026-0004', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '7 days', 'ثوب قطري مميز', 'شكيبا ياباني أصلي', 'أبيض سكري', 50.00, 25.00, 'new', 'طلب جديد قيد التجهيز للقص')
  RETURNING id INTO ord4;

  -- Customer 4 Orders (Overdue order test case)
  INSERT INTO public.orders (shop_id, customer_id, order_number, order_date, expected_delivery_date, garment_type, fabric, color, price, paid_amount, status, notes)
  VALUES (demo_shop_id, cust4, 'ORD-2026-0005', CURRENT_DATE - INTERVAL '8 days', CURRENT_DATE - INTERVAL '1 day', 'ثوب إماراتي مع كبك', 'قطن تويوبو', 'رصاصي ثلجي', 48.00, 20.00, 'in_progress', 'متأخر يرجى سرعة الإنجاز')
  RETURNING id INTO ord5;

  -- Customer 5 Orders
  INSERT INTO public.orders (shop_id, customer_id, order_number, order_date, expected_delivery_date, garment_type, fabric, color, price, paid_amount, status, notes)
  VALUES (demo_shop_id, cust5, 'ORD-2026-0006', CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE + INTERVAL '2 days', 'ثوب كويتي مع سديري', 'صوف خفيف مخلوط', 'بيج دافئ', 65.00, 65.00, 'ready', 'جاهز للاستلام')
  RETURNING id INTO ord6;

  INSERT INTO public.orders (shop_id, customer_id, order_number, order_date, expected_delivery_date, garment_type, fabric, color, price, paid_amount, status, notes)
  VALUES (demo_shop_id, cust5, 'ORD-2026-0007', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '8 days', 'سروال قطني عدد 3', 'قطن مصري 100%', 'أبيض', 30.00, 30.00, 'delivered', 'تم التسليم بالموعد')
  RETURNING id INTO ord7;

  -- 3. Insert Measurements for the Orders
  INSERT INTO public.measurements (shop_id, order_id, length, shoulder, sleeve_length, chest, waist, hip, neck, arm_width, wrist, bottom_width, pants_length, pants_waist, pants_thigh, pants_bottom, notes)
  VALUES 
    (demo_shop_id, ord1, 148.5, 46.0, 62.0, 112.0, 108.0, 116.0, 42.0, 21.0, 16.0, 78.0, 102.0, 94.0, 34.0, 22.0, 'مقاس مريح وواسع'),
    (demo_shop_id, ord2, 149.0, 46.5, 62.0, 113.0, 109.0, 117.0, 42.5, 21.5, 16.0, 79.0, 102.0, 94.0, 34.0, 22.0, 'نفس مقاس الطلب السابق مع زيادة نصف سم في الطول'),
    (demo_shop_id, ord3, 144.0, 44.0, 60.0, 104.0, 98.0, 106.0, 40.0, 19.5, 15.0, 74.0, 98.0, 88.0, 32.0, 20.0, 'تطريز يدوي على الصدر والياقة'),
    (demo_shop_id, ord4, 152.0, 48.0, 64.0, 118.0, 114.0, 122.0, 44.0, 23.0, 17.5, 82.0, 105.0, 100.0, 36.0, 24.0, 'ثوب شتوي واسع'),
    (demo_shop_id, ord5, 146.0, 45.0, 61.0, 108.0, 102.0, 110.0, 41.0, 20.0, 15.5, 76.0, 100.0, 90.0, 33.0, 21.0, 'كبك مخفي'),
    (demo_shop_id, ord6, 150.0, 47.0, 63.0, 115.0, 110.0, 118.0, 43.0, 22.0, 17.0, 80.0, 103.0, 96.0, 35.0, 23.0, 'سديري متناسق مع لون الثوب'),
    (demo_shop_id, ord7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 103.0, 96.0, 35.0, 23.0, 'سراويل بمطاط عريض');

END $$;

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Order, OrderStatus, Measurement, Customer } from '@/types/database';
import type { OrderFormData } from '@/schemas/order';
import { customerService } from './customerService';

export interface GetOrdersParams {
  shopId: string;
  search?: string;
  status?: OrderStatus | 'all';
  deliveryDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'expected_delivery_date' | 'order_date' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export interface GetOrdersResponse {
  data: Order[];
  total: number;
  page: number;
  totalPages: number;
}

const DEMO_ORDERS_STORAGE_KEY = 'tailor_demo_orders';
const DEMO_MEASUREMENTS_STORAGE_KEY = 'tailor_demo_measurements';

const INITIAL_DEMO_MEASUREMENTS: Measurement[] = [
  {
    id: 'm-001',
    shop_id: '00000000-0000-0000-0000-000000000001',
    order_id: 'ord-001',
    length: 148.5,
    shoulder: 46.0,
    sleeve_length: 62.0,
    chest: 112.0,
    waist: 108.0,
    hip: 116.0,
    neck: 42.0,
    arm_width: 21.0,
    wrist: 16.0,
    bottom_width: 78.0,
    pants_length: 102.0,
    pants_waist: 94.0,
    pants_thigh: 34.0,
    pants_bottom: 22.0,
    notes: 'مقاس مريح وواسع للدوام',
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm-002',
    shop_id: '00000000-0000-0000-0000-000000000001',
    order_id: 'ord-002',
    length: 149.0,
    shoulder: 46.5,
    sleeve_length: 62.0,
    chest: 113.0,
    waist: 109.0,
    hip: 117.0,
    neck: 42.5,
    arm_width: 21.5,
    wrist: 16.0,
    bottom_width: 79.0,
    pants_length: 102.0,
    pants_waist: 94.0,
    pants_thigh: 34.0,
    pants_bottom: 22.0,
    notes: 'نفس مقاس الطلب السابق مع زيادة نصف سم في الطول',
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm-003',
    shop_id: '00000000-0000-0000-0000-000000000001',
    order_id: 'ord-003',
    length: 144.0,
    shoulder: 44.0,
    sleeve_length: 60.0,
    chest: 104.0,
    waist: 98.0,
    hip: 106.0,
    neck: 40.0,
    arm_width: 19.5,
    wrist: 15.0,
    bottom_width: 74.0,
    pants_length: 98.0,
    pants_waist: 88.0,
    pants_thigh: 32.0,
    pants_bottom: 20.0,
    notes: 'تطريز يدوي على الصدر والياقة',
    created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm-004',
    shop_id: '00000000-0000-0000-0000-000000000001',
    order_id: 'ord-004',
    length: 152.0,
    shoulder: 48.0,
    sleeve_length: 64.0,
    chest: 118.0,
    waist: 114.0,
    hip: 122.0,
    neck: 44.0,
    arm_width: 23.0,
    wrist: 17.5,
    bottom_width: 82.0,
    pants_length: 105.0,
    pants_waist: 100.0,
    pants_thigh: 36.0,
    pants_bottom: 24.0,
    notes: 'ثوب شتوي واسع',
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm-005',
    shop_id: '00000000-0000-0000-0000-000000000001',
    order_id: 'ord-005',
    length: 146.0,
    shoulder: 45.0,
    sleeve_length: 61.0,
    chest: 108.0,
    waist: 102.0,
    hip: 110.0,
    neck: 41.0,
    arm_width: 20.0,
    wrist: 15.5,
    bottom_width: 76.0,
    pants_length: 100.0,
    pants_waist: 90.0,
    pants_thigh: 33.0,
    pants_bottom: 21.0,
    notes: 'كبك مخفي مع جيب للمحفظة',
    created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm-006',
    shop_id: '00000000-0000-0000-0000-000000000001',
    order_id: 'ord-006',
    length: 150.0,
    shoulder: 47.0,
    sleeve_length: 63.0,
    chest: 115.0,
    waist: 110.0,
    hip: 118.0,
    neck: 43.0,
    arm_width: 22.0,
    wrist: 17.0,
    bottom_width: 80.0,
    pants_length: 103.0,
    pants_waist: 96.0,
    pants_thigh: 35.0,
    pants_bottom: 23.0,
    notes: 'سديري متناسق',
    created_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm-007',
    shop_id: '00000000-0000-0000-0000-000000000001',
    order_id: 'ord-007',
    pants_length: 103.0,
    pants_waist: 96.0,
    pants_thigh: 35.0,
    pants_bottom: 23.0,
    notes: 'سراويل قطنية 100%',
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function getDemoOrders(): Order[] {
  const stored = localStorage.getItem(DEMO_ORDERS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  // Initialize with seed orders
  const seedOrders: Order[] = [
    {
      id: 'ord-001',
      shop_id: '00000000-0000-0000-0000-000000000001',
      customer_id: 'c101-uuid-0001',
      order_number: 'ORD-2026-0001',
      order_date: '2026-09-14',
      expected_delivery_date: '2026-09-22',
      actual_delivery_date: '2026-09-22',
      garment_type: 'ثوب كويتي قلاب',
      fabric: 'قطن ياباني نخب أول',
      color: 'أبيض ناصع',
      price: 45,
      paid_amount: 45,
      status: 'delivered',
      notes: 'تم الاستلام وهو راضٍ جداً',
      created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ord-002',
      shop_id: '00000000-0000-0000-0000-000000000001',
      customer_id: 'c101-uuid-0001',
      order_number: 'ORD-2026-0002',
      order_date: '2026-09-22',
      expected_delivery_date: '2026-09-29',
      garment_type: 'ثوب سعودي كلاسيك',
      fabric: 'سلك كوري ممتاز',
      color: 'كريمي فاتح',
      price: 40,
      paid_amount: 20,
      status: 'in_progress',
      notes: 'دفعة أولى 20 د.أ والباقي عند الاستلام',
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ord-003',
      shop_id: '00000000-0000-0000-0000-000000000001',
      customer_id: 'c102-uuid-0002',
      order_number: 'ORD-2026-0003',
      order_date: '2026-09-20',
      expected_delivery_date: new Date().toISOString().split('T')[0], // Delivery Today
      garment_type: 'دشداشة عمانية مطرزة',
      fabric: 'لينن مخلوط',
      color: 'كحلي غامق',
      price: 55,
      paid_amount: 55,
      status: 'ready',
      notes: 'جاهز للتسليم اليوم',
      created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ord-004',
      shop_id: '00000000-0000-0000-0000-000000000001',
      customer_id: 'c103-uuid-0003',
      order_number: 'ORD-2026-0004',
      order_date: '2026-09-23',
      expected_delivery_date: '2026-09-30',
      garment_type: 'ثوب قطري مميز',
      fabric: 'شكيبا ياباني أصلي',
      color: 'أبيض سكري',
      price: 50,
      paid_amount: 25,
      status: 'new',
      notes: 'طلب جديد قيد التجهيز للقص',
      created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ord-005',
      shop_id: '00000000-0000-0000-0000-000000000001',
      customer_id: 'c104-uuid-0004',
      order_number: 'ORD-2026-0005',
      order_date: '2026-09-16',
      expected_delivery_date: '2026-09-23', // Overdue
      garment_type: 'ثوب إماراتي مع كبك',
      fabric: 'قطن تويوبو',
      color: 'رصاصي ثلجي',
      price: 48,
      paid_amount: 20,
      status: 'in_progress',
      notes: 'متأخر يرجى سرعة الإنجاز للتسليم',
      created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ord-006',
      shop_id: '00000000-0000-0000-0000-000000000001',
      customer_id: 'c105-uuid-0005',
      order_number: 'ORD-2026-0006',
      order_date: '2026-09-18',
      expected_delivery_date: '2026-09-26',
      garment_type: 'ثوب كويتي مع سديري',
      fabric: 'صوف خفيف مخلوط',
      color: 'بيج دافئ',
      price: 65,
      paid_amount: 65,
      status: 'ready',
      notes: 'جاهز للاستلام بانتظار العميل',
      created_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ord-007',
      shop_id: '00000000-0000-0000-0000-000000000001',
      customer_id: 'c105-uuid-0005',
      order_number: 'ORD-2026-0007',
      order_date: '2026-09-09',
      expected_delivery_date: '2026-09-16',
      actual_delivery_date: '2026-09-16',
      garment_type: 'سروال قطني عدد 3',
      fabric: 'قطن مصري 100%',
      color: 'أبيض',
      price: 30,
      paid_amount: 30,
      status: 'delivered',
      notes: 'تم التسليم بالموعد المحدد',
      created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  localStorage.setItem(DEMO_ORDERS_STORAGE_KEY, JSON.stringify(seedOrders));
  return seedOrders;
}

function saveDemoOrders(orders: Order[]) {
  localStorage.setItem(DEMO_ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

function getDemoMeasurements(): Measurement[] {
  const stored = localStorage.getItem(DEMO_MEASUREMENTS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  localStorage.setItem(DEMO_MEASUREMENTS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_MEASUREMENTS));
  return INITIAL_DEMO_MEASUREMENTS;
}

function saveDemoMeasurements(measurements: Measurement[]) {
  localStorage.setItem(DEMO_MEASUREMENTS_STORAGE_KEY, JSON.stringify(measurements));
}

export const orderService = {
  /**
   * Fetch paginated and filtered orders with customer relationships
   */
  async getOrders({
    shopId,
    search = '',
    status = 'all',
    deliveryDate,
    page = 1,
    limit = 10,
    sortBy = 'created_at',
    sortOrder = 'desc',
  }: GetOrdersParams): Promise<GetOrdersResponse> {
    if (!isSupabaseConfigured) {
      // Demo implementation
      let orders = getDemoOrders().filter((o) => o.shop_id === shopId);
      const measurements = getDemoMeasurements();

      // Attach customer data
      const customersRes = await customerService.getCustomers({ shopId, limit: 1000, includeArchived: true });
      const customersMap = customersRes.data.reduce((acc, c) => {
        acc[c.id] = c;
        return acc;
      }, {} as Record<string, Customer>);

      orders = orders.map((o) => ({
        ...o,
        customer: customersMap[o.customer_id],
        measurements: measurements.find((m) => m.order_id === o.id),
      }));

      // Filter by status
      if (status !== 'all') {
        orders = orders.filter((o) => o.status === status);
      }

      // Filter by delivery date
      if (deliveryDate) {
        orders = orders.filter((o) => o.expected_delivery_date === deliveryDate);
      }

      // Search filter
      const term = search.trim().toLowerCase();
      if (term) {
        orders = orders.filter(
          (o) =>
            o.order_number.toLowerCase().includes(term) ||
            o.garment_type.toLowerCase().includes(term) ||
            (o.fabric && o.fabric.toLowerCase().includes(term)) ||
            (o.customer && (
              o.customer.full_name.toLowerCase().includes(term) ||
              o.customer.phone.includes(term)
            ))
        );
      }

      // Sort
      orders.sort((a, b) => {
        const valA = a[sortBy] || '';
        const valB = b[sortBy] || '';
        if (sortOrder === 'asc') return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });

      const total = orders.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const startIndex = (page - 1) * limit;
      const paginatedData = orders.slice(startIndex, startIndex + limit);

      return {
        data: paginatedData,
        total,
        page,
        totalPages,
      };
    }

    // Live Supabase query
    const offset = (page - 1) * limit;

    let query = supabase
      .from('orders')
      .select('*, customer:customers(*), measurements(*)', { count: 'exact' })
      .eq('shop_id', shopId);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (deliveryDate) {
      query = query.eq('expected_delivery_date', deliveryDate);
    }

    if (search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`order_number.ilike.${term},garment_type.ilike.${term}`);
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      throw new Error('فشل جلب قائمة الطلبات');
    }

    const orders = (data || []) as Order[];
    const total = count || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: orders,
      total,
      page,
      totalPages,
    };
  },

  /**
   * Get single order by ID with customer and measurements
   */
  async getOrderById(orderId: string, shopId: string): Promise<Order | null> {
    if (!isSupabaseConfigured) {
      const orders = getDemoOrders();
      const order = orders.find((o) => o.id === orderId && o.shop_id === shopId);
      if (!order) return null;

      const customer = await customerService.getCustomerById(order.customer_id, shopId);
      const measurements = getDemoMeasurements().find((m) => m.order_id === order.id);

      return {
        ...order,
        customer: customer || undefined,
        measurements: measurements || undefined,
      };
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*, customer:customers(*), measurements(*)')
      .eq('id', orderId)
      .eq('shop_id', shopId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching order details:', error);
      throw new Error('فشل جلب تفاصيل الطلب');
    }

    return (data as Order) || null;
  },

  /**
   * Get latest measurements recorded for a customer (for "استخدام مقاسات آخر طلب")
   */
  async getLastCustomerMeasurements(customerId: string, shopId: string): Promise<Measurement | null> {
    if (!isSupabaseConfigured) {
      const orders = getDemoOrders().filter((o) => o.customer_id === customerId && o.shop_id === shopId);
      if (orders.length === 0) return null;
      // Sort orders descending
      orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const lastOrder = orders[0];
      const measurements = getDemoMeasurements();
      return measurements.find((m) => m.order_id === lastOrder.id) || null;
    }

    const { data: latestOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('customer_id', customerId)
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latestOrder) return null;

    const { data: measurement } = await supabase
      .from('measurements')
      .select('*')
      .eq('order_id', latestOrder.id)
      .maybeSingle();

    return (measurement as Measurement) || null;
  },

  /**
   * Create order with auto-generated order number and measurements
   */
  async createOrder(
    shopId: string,
    orderData: OrderFormData
  ): Promise<Order> {
    const year = new Date().getFullYear();

    if (!isSupabaseConfigured) {
      const orders = getDemoOrders();
      const thisYearOrders = orders.filter((o) => o.shop_id === shopId && o.order_number.includes(`ORD-${year}`));
      const nextSeq = thisYearOrders.length + 1;
      const orderNumber = `ORD-${year}-${String(nextSeq).padStart(4, '0')}`;

      const newOrderId = 'ord-' + Date.now();
      const newOrder: Order = {
        id: newOrderId,
        shop_id: shopId,
        customer_id: orderData.customer_id,
        order_number: orderNumber,
        order_date: orderData.order_date,
        expected_delivery_date: orderData.expected_delivery_date,
        actual_delivery_date: orderData.actual_delivery_date || null,
        garment_type: orderData.garment_type,
        fabric: orderData.fabric || null,
        color: orderData.color || null,
        price: orderData.price,
        paid_amount: orderData.paid_amount,
        status: orderData.status,
        notes: orderData.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      orders.unshift(newOrder);
      saveDemoOrders(orders);

      // Save measurements
      if (orderData.measurements) {
        const measurements = getDemoMeasurements();
        const newMeasurement: Measurement = {
          id: 'm-' + Date.now(),
          shop_id: shopId,
          order_id: newOrderId,
          ...orderData.measurements,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        measurements.push(newMeasurement);
        saveDemoMeasurements(measurements);
        newOrder.measurements = newMeasurement;
      }

      return newOrder;
    }

    // Call Supabase function or compute order_number
    const { count } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', shopId);

    const nextSeq = (count || 0) + 1;
    const orderNumber = `ORD-${year}-${String(nextSeq).padStart(4, '0')}`;

    const { data: createdOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        shop_id: shopId,
        customer_id: orderData.customer_id,
        order_number: orderNumber,
        order_date: orderData.order_date,
        expected_delivery_date: orderData.expected_delivery_date,
        actual_delivery_date: orderData.actual_delivery_date || null,
        garment_type: orderData.garment_type,
        fabric: orderData.fabric || null,
        color: orderData.color || null,
        price: orderData.price,
        paid_amount: orderData.paid_amount,
        status: orderData.status,
        notes: orderData.notes || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error(orderError.message || 'فشل حفظ الطلب');
    }

    // Insert measurements if provided
    if (orderData.measurements && createdOrder) {
      const { error: measError } = await supabase
        .from('measurements')
        .insert({
          shop_id: shopId,
          order_id: createdOrder.id,
          ...orderData.measurements,
        });

      if (measError) {
        console.error('Error inserting measurements:', measError);
      }
    }

    return createdOrder as Order;
  },

  /**
   * Update order and associated measurements
   */
  async updateOrder(
    orderId: string,
    shopId: string,
    orderData: OrderFormData
  ): Promise<Order> {
    if (!isSupabaseConfigured) {
      const orders = getDemoOrders();
      const index = orders.findIndex((o) => o.id === orderId && o.shop_id === shopId);
      if (index === -1) throw new Error('الطلب غير موجود');

      orders[index] = {
        ...orders[index],
        customer_id: orderData.customer_id,
        order_date: orderData.order_date,
        expected_delivery_date: orderData.expected_delivery_date,
        actual_delivery_date: orderData.actual_delivery_date || null,
        garment_type: orderData.garment_type,
        fabric: orderData.fabric || null,
        color: orderData.color || null,
        price: orderData.price,
        paid_amount: orderData.paid_amount,
        status: orderData.status,
        notes: orderData.notes || null,
        updated_at: new Date().toISOString(),
      };
      saveDemoOrders(orders);

      if (orderData.measurements) {
        const measurements = getDemoMeasurements();
        const mIndex = measurements.findIndex((m) => m.order_id === orderId);
        if (mIndex !== -1) {
          measurements[mIndex] = {
            ...measurements[mIndex],
            ...orderData.measurements,
            updated_at: new Date().toISOString(),
          };
        } else {
          measurements.push({
            id: 'm-' + Date.now(),
            shop_id: shopId,
            order_id: orderId,
            ...orderData.measurements,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
        saveDemoMeasurements(measurements);
      }

      return orders[index];
    }

    const { data: updated, error } = await supabase
      .from('orders')
      .update({
        customer_id: orderData.customer_id,
        order_date: orderData.order_date,
        expected_delivery_date: orderData.expected_delivery_date,
        actual_delivery_date: orderData.actual_delivery_date || null,
        garment_type: orderData.garment_type,
        fabric: orderData.fabric || null,
        color: orderData.color || null,
        price: orderData.price,
        paid_amount: orderData.paid_amount,
        status: orderData.status,
        notes: orderData.notes || null,
      })
      .eq('id', orderId)
      .eq('shop_id', shopId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order:', error);
      throw new Error(error.message || 'فشل تعديل الطلب');
    }

    // Upsert measurements
    if (orderData.measurements) {
      await supabase
        .from('measurements')
        .upsert({
          shop_id: shopId,
          order_id: orderId,
          ...orderData.measurements,
        }, { onConflict: 'order_id' });
    }

    return updated as Order;
  },

  /**
   * Fast status update (e.g. from table or dashboard)
   */
  async updateOrderStatus(orderId: string, shopId: string, status: OrderStatus): Promise<void> {
    const isDelivered = status === 'delivered';
    const actualDelivery = isDelivered ? new Date().toISOString().split('T')[0] : null;

    if (!isSupabaseConfigured) {
      const orders = getDemoOrders();
      const index = orders.findIndex((o) => o.id === orderId && o.shop_id === shopId);
      if (index !== -1) {
        orders[index].status = status;
        if (isDelivered) {
          orders[index].actual_delivery_date = actualDelivery;
        }
        orders[index].updated_at = new Date().toISOString();
        saveDemoOrders(orders);
      }
      return;
    }

    const { error } = await supabase
      .from('orders')
      .update({
        status,
        ...(isDelivered ? { actual_delivery_date: actualDelivery } : {}),
      })
      .eq('id', orderId)
      .eq('shop_id', shopId);

    if (error) throw new Error('فشل تحديث حالة الطلب');
  },

  /**
   * Soft cancel order
   */
  async cancelOrder(orderId: string, shopId: string): Promise<void> {
    await this.updateOrderStatus(orderId, shopId, 'cancelled');
  },

  /**
   * Quick update of paid amount
   */
  async updateOrderPayment(orderId: string, shopId: string, paidAmount: number): Promise<void> {
    if (!isSupabaseConfigured) {
      const orders = getDemoOrders();
      const index = orders.findIndex((o) => o.id === orderId && o.shop_id === shopId);
      if (index !== -1) {
        orders[index].paid_amount = paidAmount;
        orders[index].updated_at = new Date().toISOString();
        saveDemoOrders(orders);
      }
      return;
    }

    const { error } = await supabase
      .from('orders')
      .update({ paid_amount: paidAmount })
      .eq('id', orderId)
      .eq('shop_id', shopId);

    if (error) throw new Error('فشل تسجيل الدفعة');
  },

  /**
   * Delete order permanently
   */
  async deleteOrder(orderId: string, shopId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      // 1. Remove from demo orders
      const orders = getDemoOrders();
      const filteredOrders = orders.filter((o) => !(o.id === orderId && o.shop_id === shopId));
      saveDemoOrders(filteredOrders);

      // 2. Remove associated measurements
      const measurements = getDemoMeasurements();
      const filteredMeasurements = measurements.filter(
        (m) => !(m.order_id === orderId && m.shop_id === shopId)
      );
      saveDemoMeasurements(filteredMeasurements);
      return;
    }

    // Supabase mode: delete measurements first, then order
    const { error: mError } = await supabase
      .from('measurements')
      .delete()
      .eq('order_id', orderId)
      .eq('shop_id', shopId);

    if (mError) {
      console.warn('Note: Could not delete order measurements or none existed:', mError.message);
    }

    const { error: oError } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)
      .eq('shop_id', shopId);

    if (oError) {
      console.error('Error deleting order:', oError);
      throw new Error(oError.message || 'فشل حذف الطلب');
    }
  },
};

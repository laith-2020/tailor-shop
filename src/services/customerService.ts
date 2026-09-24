import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Customer, Order } from '@/types/database';
import { normalizePhoneNumber } from '@/schemas/customer';

export interface CustomerStats {
  totalOrders: number;
  totalSales: number;
  totalPaid: number;
  remainingBalance: number;
  lastOrderDate: string | null;
}

export interface CustomerWithStats extends Customer {
  stats?: CustomerStats;
}

export interface GetCustomersParams {
  shopId: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'full_name' | 'phone';
  sortOrder?: 'asc' | 'desc';
  includeArchived?: boolean;
}

export interface GetCustomersResponse {
  data: CustomerWithStats[];
  total: number;
  page: number;
  totalPages: number;
}

// Local mock storage for demo / testing mode
const DEMO_STORAGE_KEY = 'tailor_demo_customers';
const DEMO_ORDERS_KEY = 'tailor_demo_orders';

const INITIAL_DEMO_CUSTOMERS: Customer[] = [
  {
    id: 'c101-uuid-0001',
    shop_id: '00000000-0000-0000-0000-000000000001',
    full_name: 'أحمد محمود القيسي',
    phone: '0795551122',
    alternative_phone: '0788881122',
    address: 'عمان - الجبيهة',
    notes: 'يفضل الخياطة المزدوجة للأكمام وياقة كويتية صلبة',
    is_archived: false,
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c102-uuid-0002',
    shop_id: '00000000-0000-0000-0000-000000000001',
    full_name: 'عمر خالد النجار',
    phone: '0781239876',
    alternative_phone: null,
    address: 'عمان - تلاع العلي',
    notes: 'زبون دائم منذ 2021، يفضل قماش الشكيبا الأصلي',
    is_archived: false,
    created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c103-uuid-0003',
    shop_id: '00000000-0000-0000-0000-000000000001',
    full_name: 'محمد عبد الله العبادي',
    phone: '0777123456',
    alternative_phone: '0799994433',
    address: 'عمان - الصويفية',
    notes: 'يفضل الأقمشة القطنية اليابانية وأزرار صدف طبيعي',
    is_archived: false,
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c104-uuid-0004',
    shop_id: '00000000-0000-0000-0000-000000000001',
    full_name: 'طارق زياد الكردي',
    phone: '0796543210',
    alternative_phone: null,
    address: 'عمان - الشميساني',
    notes: 'مستعجل دائماً للمناسبات والاجتماعات الرسمية',
    is_archived: false,
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c105-uuid-0005',
    shop_id: '00000000-0000-0000-0000-000000000001',
    full_name: 'يوسف سليم التميمي',
    phone: '0785559988',
    alternative_phone: null,
    address: 'عمان - دابوق',
    notes: 'تفصيل دشاديش كلاسيكية وسراويل قطنية عريضة',
    is_archived: false,
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_DEMO_ORDERS: Partial<Order>[] = [
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
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
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
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'ord-003',
    shop_id: '00000000-0000-0000-0000-000000000001',
    customer_id: 'c102-uuid-0002',
    order_number: 'ORD-2026-0003',
    order_date: '2026-09-20',
    expected_delivery_date: '2026-09-24',
    garment_type: 'دشداشة عمانية مطرزة',
    fabric: 'لينن مخلوط',
    color: 'كحلي غامق',
    price: 55,
    paid_amount: 55,
    status: 'ready',
    created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
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
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'ord-005',
    shop_id: '00000000-0000-0000-0000-000000000001',
    customer_id: 'c104-uuid-0004',
    order_number: 'ORD-2026-0005',
    order_date: '2026-09-16',
    expected_delivery_date: '2026-09-23',
    garment_type: 'ثوب إماراتي مع كبك',
    fabric: 'قطن تويوبو',
    color: 'رصاصي ثلجي',
    price: 48,
    paid_amount: 20,
    status: 'in_progress',
    created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
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
    created_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
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
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
  },
];

function getDemoCustomers(): Customer[] {
  const stored = localStorage.getItem(DEMO_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_CUSTOMERS));
  return INITIAL_DEMO_CUSTOMERS;
}

function saveDemoCustomers(customers: Customer[]) {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(customers));
}

function getDemoOrders(): Partial<Order>[] {
  const stored = localStorage.getItem(DEMO_ORDERS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  localStorage.setItem(DEMO_ORDERS_KEY, JSON.stringify(INITIAL_DEMO_ORDERS));
  return INITIAL_DEMO_ORDERS;
}

export const customerService = {
  /**
   * Fetch paginated and filtered customers with statistics
   */
  async getCustomers({
    shopId,
    search = '',
    page = 1,
    limit = 10,
    sortBy = 'created_at',
    sortOrder = 'desc',
    includeArchived = false,
  }: GetCustomersParams): Promise<GetCustomersResponse> {
    if (!isSupabaseConfigured) {
      // Demo mock implementation
      let customers = getDemoCustomers().filter((c) => c.shop_id === shopId);
      if (!includeArchived) {
        customers = customers.filter((c) => !c.is_archived);
      }

      const trimmedSearch = search.trim().toLowerCase();
      if (trimmedSearch) {
        customers = customers.filter(
          (c) =>
            c.full_name.toLowerCase().includes(trimmedSearch) ||
            c.phone.includes(trimmedSearch) ||
            (c.alternative_phone && c.alternative_phone.includes(trimmedSearch))
        );
      }

      // Sort
      customers.sort((a, b) => {
        const valA = a[sortBy] || '';
        const valB = b[sortBy] || '';
        if (sortOrder === 'asc') return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });

      const total = customers.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const startIndex = (page - 1) * limit;
      const paginatedData = customers.slice(startIndex, startIndex + limit);

      // Attach stats
      const orders = getDemoOrders();
      const withStats: CustomerWithStats[] = paginatedData.map((c) => {
        const custOrders = orders.filter((o) => o.customer_id === c.id);
        const validOrders = custOrders.filter((o) => o.status !== 'cancelled');
        const totalSales = validOrders.reduce((sum, o) => sum + (o.price || 0), 0);
        const totalPaid = validOrders.reduce((sum, o) => sum + (o.paid_amount || 0), 0);
        return {
          ...c,
          stats: {
            totalOrders: custOrders.length,
            totalSales,
            totalPaid,
            remainingBalance: Math.max(0, totalSales - totalPaid),
            lastOrderDate: custOrders.length > 0 ? custOrders[custOrders.length - 1].order_date || null : null,
          },
        };
      });

      return {
        data: withStats,
        total,
        page,
        totalPages,
      };
    }

    // Live Supabase query
    const offset = (page - 1) * limit;

    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('shop_id', shopId);

    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    if (search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`full_name.ilike.${term},phone.ilike.${term}`);
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching customers:', error);
      throw new Error('فشل جلب قائمة العملاء');
    }

    const customers = (data || []) as Customer[];
    const total = count || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // Fetch order stats for these customers
    const customerIds = customers.map((c) => c.id);
    let statsMap: Record<string, CustomerStats> = {};

    if (customerIds.length > 0) {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('customer_id, price, paid_amount, status, order_date')
        .in('customer_id', customerIds);

      if (ordersData) {
        statsMap = customerIds.reduce((acc, id) => {
          const custOrders = ordersData.filter((o) => o.customer_id === id);
          const validOrders = custOrders.filter((o) => o.status !== 'cancelled');
          const totalSales = validOrders.reduce((sum, o) => sum + Number(o.price || 0), 0);
          const totalPaid = validOrders.reduce((sum, o) => sum + Number(o.paid_amount || 0), 0);
          
          acc[id] = {
            totalOrders: custOrders.length,
            totalSales,
            totalPaid,
            remainingBalance: Math.max(0, totalSales - totalPaid),
            lastOrderDate: custOrders.length > 0 ? custOrders[0].order_date : null,
          };
          return acc;
        }, {} as Record<string, CustomerStats>);
      }
    }

    const dataWithStats: CustomerWithStats[] = customers.map((c) => ({
      ...c,
      stats: statsMap[c.id] || {
        totalOrders: 0,
        totalSales: 0,
        totalPaid: 0,
        remainingBalance: 0,
        lastOrderDate: null,
      },
    }));

    return {
      data: dataWithStats,
      total,
      page,
      totalPages,
    };
  },

  /**
   * Get customer by ID
   */
  async getCustomerById(customerId: string, shopId: string): Promise<Customer | null> {
    if (!isSupabaseConfigured) {
      const customers = getDemoCustomers();
      return customers.find((c) => c.id === customerId && c.shop_id === shopId) || null;
    }

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('shop_id', shopId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching customer details:', error);
      throw new Error('فشل جلب تفاصيل العميل');
    }

    return (data as Customer) || null;
  },

  /**
   * Get customer statistics & aggregated financial totals
   */
  async getCustomerStats(customerId: string, shopId: string): Promise<CustomerStats> {
    if (!isSupabaseConfigured) {
      const orders = getDemoOrders().filter((o) => o.customer_id === customerId);
      const validOrders = orders.filter((o) => o.status !== 'cancelled');
      const totalSales = validOrders.reduce((sum, o) => sum + (o.price || 0), 0);
      const totalPaid = validOrders.reduce((sum, o) => sum + (o.paid_amount || 0), 0);
      return {
        totalOrders: orders.length,
        totalSales,
        totalPaid,
        remainingBalance: Math.max(0, totalSales - totalPaid),
        lastOrderDate: orders.length > 0 ? orders[orders.length - 1].order_date || null : null,
      };
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('price, paid_amount, status, order_date')
      .eq('customer_id', customerId)
      .eq('shop_id', shopId)
      .order('order_date', { ascending: false });

    if (error) {
      console.error('Error fetching customer order stats:', error);
      throw new Error('فشل حساب إحصائيات العميل');
    }

    const validOrders = (orders || []).filter((o) => o.status !== 'cancelled');
    const totalSales = validOrders.reduce((sum, o) => sum + Number(o.price || 0), 0);
    const totalPaid = validOrders.reduce((sum, o) => sum + Number(o.paid_amount || 0), 0);

    return {
      totalOrders: (orders || []).length,
      totalSales,
      totalPaid,
      remainingBalance: Math.max(0, totalSales - totalPaid),
      lastOrderDate: orders && orders.length > 0 ? orders[0].order_date : null,
    };
  },

  /**
   * Get all previous orders for a customer (Order History)
   */
  async getCustomerOrders(customerId: string, shopId: string): Promise<Order[]> {
    if (!isSupabaseConfigured) {
      const orders = getDemoOrders().filter((o) => o.customer_id === customerId);
      return orders as Order[];
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customer orders:', error);
      throw new Error('فشل جلب سجل طلبات العميل');
    }

    return (data || []) as Order[];
  },

  /**
   * Check for phone number duplication in the shop to show friendly warning
   */
  async checkPhoneDuplicate(
    phone: string,
    shopId: string,
    excludeCustomerId?: string
  ): Promise<Customer | null> {
    const normalized = normalizePhoneNumber(phone);
    if (!normalized) return null;

    if (!isSupabaseConfigured) {
      const customers = getDemoCustomers();
      return (
        customers.find(
          (c) =>
            c.shop_id === shopId &&
            c.id !== excludeCustomerId &&
            normalizePhoneNumber(c.phone) === normalized
        ) || null
      );
    }

    let query = supabase
      .from('customers')
      .select('id, full_name, phone')
      .eq('shop_id', shopId)
      .eq('phone', normalized);

    if (excludeCustomerId) {
      query = query.neq('id', excludeCustomerId);
    }

    const { data } = await query.maybeSingle();
    return (data as Customer) || null;
  },

  /**
   * Create a new customer
   */
  async createCustomer(
    shopId: string,
    data: {
      full_name: string;
      phone: string;
      alternative_phone?: string | null;
      address?: string | null;
      notes?: string | null;
    }
  ): Promise<Customer> {
    const normalizedPhone = normalizePhoneNumber(data.phone);
    const normalizedAlt = data.alternative_phone
      ? normalizePhoneNumber(data.alternative_phone)
      : null;

    if (!isSupabaseConfigured) {
      const customers = getDemoCustomers();
      const newCustomer: Customer = {
        id: 'cust-' + Date.now(),
        shop_id: shopId,
        full_name: data.full_name.trim(),
        phone: normalizedPhone,
        alternative_phone: normalizedAlt,
        address: data.address?.trim() || null,
        notes: data.notes?.trim() || null,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      customers.unshift(newCustomer);
      saveDemoCustomers(customers);
      return newCustomer;
    }

    const { data: created, error } = await supabase
      .from('customers')
      .insert({
        shop_id: shopId,
        full_name: data.full_name.trim(),
        phone: normalizedPhone,
        alternative_phone: normalizedAlt,
        address: data.address?.trim() || null,
        notes: data.notes?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      throw new Error(error.message || 'فشل حفظ بيانات العميل');
    }

    return created as Customer;
  },

  /**
   * Update an existing customer
   */
  async updateCustomer(
    customerId: string,
    shopId: string,
    data: {
      full_name: string;
      phone: string;
      alternative_phone?: string | null;
      address?: string | null;
      notes?: string | null;
    }
  ): Promise<Customer> {
    const normalizedPhone = normalizePhoneNumber(data.phone);
    const normalizedAlt = data.alternative_phone
      ? normalizePhoneNumber(data.alternative_phone)
      : null;

    if (!isSupabaseConfigured) {
      const customers = getDemoCustomers();
      const index = customers.findIndex((c) => c.id === customerId && c.shop_id === shopId);
      if (index === -1) throw new Error('العميل غير موجود');

      customers[index] = {
        ...customers[index],
        full_name: data.full_name.trim(),
        phone: normalizedPhone,
        alternative_phone: normalizedAlt,
        address: data.address?.trim() || null,
        notes: data.notes?.trim() || null,
        updated_at: new Date().toISOString(),
      };
      saveDemoCustomers(customers);
      return customers[index];
    }

    const { data: updated, error } = await supabase
      .from('customers')
      .update({
        full_name: data.full_name.trim(),
        phone: normalizedPhone,
        alternative_phone: normalizedAlt,
        address: data.address?.trim() || null,
        notes: data.notes?.trim() || null,
      })
      .eq('id', customerId)
      .eq('shop_id', shopId)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer:', error);
      throw new Error(error.message || 'فشل تحديث بيانات العميل');
    }

    return updated as Customer;
  },

  /**
   * Soft-delete (archive) or delete customer safely
   */
  async archiveOrDeleteCustomer(customerId: string, shopId: string): Promise<{ action: 'archived' | 'deleted' }> {
    // Check if customer has any orders
    let hasOrders = false;

    if (!isSupabaseConfigured) {
      const orders = getDemoOrders();
      hasOrders = orders.some((o) => o.customer_id === customerId);

      const customers = getDemoCustomers();
      if (hasOrders) {
        // Soft delete / archive
        const index = customers.findIndex((c) => c.id === customerId);
        if (index !== -1) {
          customers[index].is_archived = true;
          saveDemoCustomers(customers);
        }
        return { action: 'archived' };
      } else {
        const filtered = customers.filter((c) => c.id !== customerId);
        saveDemoCustomers(filtered);
        return { action: 'deleted' };
      }
    }

    const { count } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customerId);

    hasOrders = Boolean(count && count > 0);

    if (hasOrders) {
      // Soft-delete/archive customer to preserve order records safely
      const { error } = await supabase
        .from('customers')
        .update({ is_archived: true })
        .eq('id', customerId)
        .eq('shop_id', shopId);

      if (error) throw new Error('فشل أرشفة العميل');
      return { action: 'archived' };
    } else {
      // Hard delete only if zero orders exist
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)
        .eq('shop_id', shopId);

      if (error) throw new Error('فشل حذف العميل');
      return { action: 'deleted' };
    }
  },
};

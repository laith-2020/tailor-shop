import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/orderService';
import { customerService } from '@/services/customerService';
import type { Order } from '@/types/database';

export interface DashboardStats {
  totalCustomers: number;
  todayOrdersCount: number;
  inProgressCount: number;
  readyCount: number;
  deliveryTodayCount: number;
  outstandingBalance: number;
  thisMonthSales: number;
  followUpOrders: Order[];
}

export function useDashboardStats() {
  const { shop } = useAuth();
  const shopId = shop?.id || '00000000-0000-0000-0000-000000000001';

  return useQuery({
    queryKey: ['dashboard-stats', shopId],
    queryFn: async (): Promise<DashboardStats> => {
      const today = new Date().toISOString().split('T')[0];
      const currentYearMonth = today.slice(0, 7); // YYYY-MM

      // 1. Fetch customers
      const customersRes = await customerService.getCustomers({ shopId, limit: 1000, includeArchived: false });
      const totalCustomers = customersRes.total;

      // 2. Fetch orders
      const ordersRes = await orderService.getOrders({ shopId, limit: 1000 });
      const allOrders = ordersRes.data;

      let todayOrdersCount = 0;
      let inProgressCount = 0;
      let readyCount = 0;
      let deliveryTodayCount = 0;
      let outstandingBalance = 0;
      let thisMonthSales = 0;

      const followUpOrders: Order[] = [];

      allOrders.forEach((o) => {
        const orderDateStr = o.order_date;
        const deliveryDateStr = o.expected_delivery_date;
        const remaining = Math.max(0, (o.price || 0) - (o.paid_amount || 0));

        if (o.status !== 'cancelled') {
          outstandingBalance += remaining;
        }

        // Today's orders
        if (orderDateStr === today) {
          todayOrdersCount++;
        }

        // This month sales
        if (orderDateStr.startsWith(currentYearMonth) && o.status !== 'cancelled') {
          thisMonthSales += o.price || 0;
        }

        // Status counts
        if (o.status === 'in_progress') {
          inProgressCount++;
        }
        if (o.status === 'ready') {
          readyCount++;
        }
        if (deliveryDateStr === today && o.status !== 'delivered' && o.status !== 'cancelled') {
          deliveryTodayCount++;
        }

        // Follow up orders:
        // 1. Overdue orders (deliveryDate < today and status not delivered/cancelled)
        // 2. Due today (deliveryDate === today and status not delivered/cancelled)
        // 3. Ready orders not delivered yet
        const isOverdue = deliveryDateStr < today && o.status !== 'delivered' && o.status !== 'cancelled';
        const isDueToday = deliveryDateStr === today && o.status !== 'delivered' && o.status !== 'cancelled';
        const isReadyNotDelivered = o.status === 'ready';

        if (isOverdue || isDueToday || isReadyNotDelivered) {
          followUpOrders.push(o);
        }
      });

      // Sort followUpOrders: overdue first, then due today, then ready
      followUpOrders.sort((a, b) => (a.expected_delivery_date > b.expected_delivery_date ? 1 : -1));

      return {
        totalCustomers,
        todayOrdersCount,
        inProgressCount,
        readyCount,
        deliveryTodayCount,
        outstandingBalance,
        thisMonthSales,
        followUpOrders: followUpOrders.slice(0, 15),
      };
    },
    enabled: Boolean(shopId),
    refetchInterval: 30000, // Background refresh every 30s
  });
}

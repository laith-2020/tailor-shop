import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { orderService, type GetOrdersParams } from '@/services/orderService';
import type { OrderFormData } from '@/schemas/order';
import type { OrderStatus } from '@/types/database';

export function useOrders(params: Omit<GetOrdersParams, 'shopId'>) {
  const { shop } = useAuth();
  const shopId = shop?.id || '00000000-0000-0000-0000-000000000001';

  return useQuery({
    queryKey: ['orders', shopId, params],
    queryFn: () => orderService.getOrders({ ...params, shopId }),
    enabled: Boolean(shopId),
    placeholderData: (previousData) => previousData,
  });
}

export function useOrder(orderId?: string) {
  const { shop } = useAuth();
  const shopId = shop?.id || '00000000-0000-0000-0000-000000000001';

  return useQuery({
    queryKey: ['order', orderId, shopId],
    queryFn: () => (orderId ? orderService.getOrderById(orderId, shopId) : null),
    enabled: Boolean(orderId && shopId),
  });
}

export function useLastCustomerMeasurements(customerId?: string) {
  const { shop } = useAuth();
  const shopId = shop?.id || '00000000-0000-0000-0000-000000000001';

  return useQuery({
    queryKey: ['last-measurements', customerId, shopId],
    queryFn: () => (customerId ? orderService.getLastCustomerMeasurements(customerId, shopId) : null),
    enabled: Boolean(customerId && shopId),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { shop } = useAuth();
  const shopId = shop?.id || '00000000-0000-0000-0000-000000000001';

  return useMutation({
    mutationFn: (data: OrderFormData) => orderService.createOrder(shopId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['customer-orders', variables.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['customer-stats', variables.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  const { shop } = useAuth();
  const shopId = shop?.id || '00000000-0000-0000-0000-000000000001';

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OrderFormData }) =>
      orderService.updateOrder(id, shopId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { shop } = useAuth();
  const shopId = shop?.id || '00000000-0000-0000-0000-000000000001';

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      orderService.updateOrderStatus(orderId, shopId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  const { shop } = useAuth();
  const shopId = shop?.id || '00000000-0000-0000-0000-000000000001';

  return useMutation({
    mutationFn: (orderId: string) => orderService.cancelOrder(orderId, shopId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateOrderPayment() {
  const queryClient = useQueryClient();
  const { shop } = useAuth();
  const shopId = shop?.id || '00000000-0000-0000-0000-000000000001';

  return useMutation({
    mutationFn: ({ orderId, paidAmount }: { orderId: string; paidAmount: number }) =>
      orderService.updateOrderPayment(orderId, shopId, paidAmount),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

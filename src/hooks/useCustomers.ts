import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { customerService, type GetCustomersParams } from '@/services/customerService';
import type { CustomerFormData } from '@/schemas/customer';

export function useCustomers(params: Omit<GetCustomersParams, 'shopId'>) {
  const { shop } = useAuth();
  const shopId = shop?.id || '00000000-0000-0000-0000-000000000001';

  return useQuery({
    queryKey: ['customers', shopId, params],
    queryFn: () => customerService.getCustomers({ ...params, shopId }),
    enabled: Boolean(shopId),
    placeholderData: (previousData) => previousData,
  });
}

export function useCustomer(customerId?: string) {
  const { shop } = useAuth();
  const shopId = shop?.id || '00000000-0000-0000-0000-000000000001';

  return useQuery({
    queryKey: ['customer', customerId, shopId],
    queryFn: () => (customerId ? customerService.getCustomerById(customerId, shopId) : null),
    enabled: Boolean(customerId && shopId),
  });
}

export function useCustomerStats(customerId?: string) {
  const { shop } = useAuth();
  const shopId = shop?.id || '00000000-0000-0000-0000-000000000001';

  return useQuery({
    queryKey: ['customer-stats', customerId, shopId],
    queryFn: () => (customerId ? customerService.getCustomerStats(customerId, shopId) : null),
    enabled: Boolean(customerId && shopId),
  });
}

export function useCustomerOrders(customerId?: string) {
  const { shop } = useAuth();
  const shopId = shop?.id || '00000000-0000-0000-0000-000000000001';

  return useQuery({
    queryKey: ['customer-orders', customerId, shopId],
    queryFn: () => (customerId ? customerService.getCustomerOrders(customerId, shopId) : []),
    enabled: Boolean(customerId && shopId),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const { shop } = useAuth();
  const shopId = shop?.id || '00000000-0000-0000-0000-000000000001';

  return useMutation({
    mutationFn: (data: CustomerFormData) => customerService.createCustomer(shopId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  const { shop } = useAuth();
  const shopId = shop?.id || '00000000-0000-0000-0000-000000000001';

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CustomerFormData }) =>
      customerService.updateCustomer(id, shopId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  const { shop } = useAuth();
  const shopId = shop?.id || '00000000-0000-0000-0000-000000000001';

  return useMutation({
    mutationFn: (customerId: string) =>
      customerService.archiveOrDeleteCustomer(customerId, shopId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

import { useState, useDeferredValue } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  X,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OrderList } from '@/components/orders/OrderList';
import { OrderFormModal } from '@/components/orders/OrderFormModal';
import { OrderConfirmationModal } from '@/components/orders/OrderConfirmationModal';
import {
  useOrders,
  useCreateOrder,
  useUpdateOrder,
  useUpdateOrderStatus,
} from '@/hooks/useOrders';
import type { Order, OrderStatus } from '@/types/database';
import type { OrderFormData } from '@/schemas/order';

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCustomerParam = searchParams.get('newCustomerOrder');
  const initialCopyLastParam = searchParams.get('copyLast') === 'true';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [deliveryDateFilter, setDeliveryDateFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(Boolean(initialCustomerParam));
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const deferredSearch = useDeferredValue(searchTerm);

  // Queries & Mutations
  const { data, isLoading } = useOrders({
    search: deferredSearch,
    status: statusFilter,
    deliveryDate: deliveryDateFilter || undefined,
    page,
    limit: 10,
  });

  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder();
  const updateStatusMutation = useUpdateOrderStatus();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenNewOrder = () => {
    setEditingOrder(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (order: Order) => {
    setEditingOrder(order);
    setFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setFormModalOpen(false);
    setEditingOrder(null);
    if (initialCustomerParam) {
      searchParams.delete('newCustomerOrder');
      searchParams.delete('copyLast');
      setSearchParams(searchParams);
    }
  };

  const handleFormSubmit = async (formData: OrderFormData): Promise<Order> => {
    if (editingOrder) {
      const updated = await updateOrderMutation.mutateAsync({
        id: editingOrder.id,
        data: formData,
      });
      showToast('تم تحديث الطلب بنجاح');
      return updated;
    } else {
      const created = await createOrderMutation.mutateAsync(formData);
      return created;
    }
  };

  const handleOrderSaved = (savedOrder: Order) => {
    if (!editingOrder) {
      setConfirmedOrder(savedOrder);
      setConfirmationModalOpen(true);
    }
  };

  const handleQuickStatusChange = async (orderId: string, status: OrderStatus) => {
    await updateStatusMutation.mutateAsync({ orderId, status });
    showToast('تم تحديث حالة الطلب بنجاح');
  };

  const statuses: { label: string; value: OrderStatus | 'all' }[] = [
    { label: 'كافة الطلبات', value: 'all' },
    { label: 'جديد', value: 'new' },
    { label: 'قيد التفصيل', value: 'in_progress' },
    { label: 'جاهز', value: 'ready' },
    { label: 'تم التسليم', value: 'delivered' },
    { label: 'ملغي', value: 'cancelled' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">سجل طلبات الخياطة</h1>
            <span className="text-xs bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full font-mono">
              {data?.total || 0} طلب
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            متابعة مراحل تفصيل الأثواب، مواعيد التسليم، والحسابات والمدفوعات
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenNewOrder} className="shadow-sm">
          <Plus className="w-4 h-4 ml-1.5" />
          إنشاء طلب جديد
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {statuses.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === tab.value
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input & Delivery Date Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="بحث برقم الطلب، اسم الزبون، أو الهاتف..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              icon={<Search className="w-4 h-4 text-slate-400" />}
              className="pr-10"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-500 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>موعد التسليم:</span>
              <input
                type="date"
                value={deliveryDateFilter}
                onChange={(e) => {
                  setDeliveryDateFilter(e.target.value);
                  setPage(1);
                }}
                className="text-xs bg-transparent border-0 focus:outline-none font-mono"
              />
              {deliveryDateFilter && (
                <button
                  onClick={() => setDeliveryDateFilter('')}
                  className="text-slate-400 hover:text-slate-600 mr-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Orders List Component */}
      <OrderList
        orders={data?.data || []}
        total={data?.total || 0}
        page={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
        onEdit={handleOpenEdit}
        onQuickStatusChange={handleQuickStatusChange}
        isLoading={isLoading}
      />

      {/* Add / Edit Order Modal */}
      <OrderFormModal
        isOpen={formModalOpen}
        onClose={handleCloseFormModal}
        order={editingOrder}
        initialCustomerId={initialCustomerParam || undefined}
        initialCopyLast={initialCopyLastParam}
        onSubmit={handleFormSubmit}
        onOrderSaved={handleOrderSaved}
        isLoading={createOrderMutation.isPending || updateOrderMutation.isPending}
      />

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={confirmationModalOpen}
        onClose={() => setConfirmationModalOpen(false)}
        order={confirmedOrder}
        onNewOrder={() => {
          setEditingOrder(null);
          setFormModalOpen(true);
        }}
      />
    </div>
  );
}

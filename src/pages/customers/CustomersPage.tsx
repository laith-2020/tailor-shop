import { useState, useDeferredValue } from 'react';
import {
  UserPlus,
  Search,
  X,
  Archive,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CustomerList } from '@/components/customers/CustomerList';
import { CustomerFormModal } from '@/components/customers/CustomerFormModal';
import { DeleteCustomerDialog } from '@/components/customers/DeleteCustomerDialog';
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from '@/hooks/useCustomers';
import type { CustomerWithStats } from '@/services/customerService';
import type { CustomerFormData } from '@/schemas/customer';

export function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [includeArchived, setIncludeArchived] = useState(false);
  
  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerWithStats | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerWithStats | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Defer search input for responsive typing
  const deferredSearch = useDeferredValue(searchTerm);

  // Queries & Mutations
  const { data, isLoading } = useCustomers({
    search: deferredSearch,
    page,
    limit: 10,
    includeArchived,
  });

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (customer: CustomerWithStats) => {
    setEditingCustomer(customer);
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (formData: CustomerFormData) => {
    if (editingCustomer) {
      await updateMutation.mutateAsync({ id: editingCustomer.id, data: formData });
      showToast('تم تحديث بيانات العميل بنجاح');
    } else {
      await createMutation.mutateAsync(formData);
      showToast('تمت إضافة العميل بنجاح');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCustomer) return;
    const result = await deleteMutation.mutateAsync(deletingCustomer.id);
    setDeletingCustomer(null);
    if (result.action === 'archived') {
      showToast('تم أرشفة العميل بنجاح وحفظ سجلاته');
    } else {
      showToast('تم حذف العميل بنجاح');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">سجل العملاء</h1>
            <span className="text-xs bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
              {data?.total || 0} عميل
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            إدارة بيانات العملاء، أرقام الهواتف، المقاسات، والذمم المالية المستحقة
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenAdd} className="shadow-sm">
          <UserPlus className="w-4 h-4 ml-1.5" />
          إضافة عميل جديد
        </Button>
      </div>

      {/* Search and Filter controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="بحث باسم العميل أو رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset to page 1 on new search
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
          <Button
            variant={includeArchived ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => {
              setIncludeArchived(!includeArchived);
              setPage(1);
            }}
            className="text-xs h-10 gap-1.5"
          >
            <Archive className="w-4 h-4" />
            {includeArchived ? 'إخفاء المؤرشفين' : 'عرض المؤرشفين'}
          </Button>
        </div>
      </div>

      {/* Customer List table & cards */}
      <CustomerList
        customers={data?.data || []}
        total={data?.total || 0}
        page={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
        onEdit={handleOpenEdit}
        onDelete={setDeletingCustomer}
        isLoading={isLoading}
      />

      {/* Add / Edit Customer Modal */}
      <CustomerFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        customer={editingCustomer}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Safe Delete / Archive Dialog */}
      <DeleteCustomerDialog
        isOpen={Boolean(deletingCustomer)}
        onClose={() => setDeletingCustomer(null)}
        customer={deletingCustomer}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

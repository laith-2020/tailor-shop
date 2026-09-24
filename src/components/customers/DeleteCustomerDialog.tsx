import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Archive, Trash2 } from 'lucide-react';
import type { CustomerWithStats } from '@/services/customerService';

interface DeleteCustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerWithStats | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function DeleteCustomerDialog({
  isOpen,
  onClose,
  customer,
  onConfirm,
  isLoading = false,
}: DeleteCustomerDialogProps) {
  if (!customer) return null;

  const hasOrders = Boolean(customer.stats && customer.stats.totalOrders > 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={hasOrders ? 'أرشفة سجل العميل' : 'حذف العميل'}
      className="max-w-md"
    >
      <div className="space-y-4 text-right">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            العميل: <strong>{customer.full_name}</strong> ({customer.phone})
          </span>
        </div>

        {hasOrders ? (
          <p className="text-sm text-slate-600 leading-relaxed">
            يوجد لهذا العميل <strong className="text-slate-900">{customer.stats?.totalOrders} طلبات سابقة</strong> في النظام.
            حفاظاً على سلامة السجلات المالية والطلبات، سيتم <strong>أرشفة</strong> العميل وإخفاؤه من القائمة النشطة بدلاً من حذفه نهائياً.
          </p>
        ) : (
          <p className="text-sm text-slate-600 leading-relaxed">
            هل أنت متأكد من رغبتك في حذف هذا العميل؟ لا توجد طلبات سابقة مرتبطة به، وسيتم حذفه من النظام نهائياً.
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            إلغاء
          </Button>
          <Button
            variant={hasOrders ? 'primary' : 'destructive'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {hasOrders ? (
              <>
                <Archive className="w-4 h-4 ml-1.5" />
                أرشفة العميل
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 ml-1.5" />
                حذف نهائي
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

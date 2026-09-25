import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import type { Order } from '@/types/database';

interface DeleteOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function DeleteOrderDialog({
  isOpen,
  onClose,
  order,
  onConfirm,
  isLoading = false,
}: DeleteOrderDialogProps) {
  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تأكيد حذف الطلب"
      className="max-w-md"
    >
      <div className="space-y-4 text-right">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">
              طلب رقم: <span className="font-mono text-rose-700">{order.order_number}</span>
            </span>
            <span className="text-xs text-rose-800 block">
              الزبون: {order.customer?.full_name || 'غير محدد'} | النوع: {order.garment_type}
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          هل أنت متأكد من رغبتك في <strong>حذف هذا الطلب نهائياً</strong>؟ سيتم حذف بيانات الطلب، المدفوعات المسجلة عليه، والمقاسات المرتبطة به. هذا الإجراء لا يمكن التراجع عنه.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            إلغاء
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            <Trash2 className="w-4 h-4 ml-1.5" />
            حذف الطلب نهائياً
          </Button>
        </div>
      </div>
    </Modal>
  );
}

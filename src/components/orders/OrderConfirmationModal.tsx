import { Link } from 'react-router-dom';
import { CheckCircle2, Printer, Eye, PlusCircle, ArrowLeft } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Order } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onNewOrder?: () => void;
}

export function OrderConfirmationModal({
  isOpen,
  onClose,
  order,
  onNewOrder,
}: OrderConfirmationModalProps) {
  const { shop } = useAuth();
  const currency = shop?.currency === 'JOD' ? 'د.أ' : (shop?.currency || 'د.أ');

  if (!order) return null;

  const remaining = Math.max(0, (order.price || 0) - (order.paid_amount || 0));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تم حفظ الطلب بنجاح" className="max-w-md text-center">
      <div className="py-4 space-y-4">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h4 className="text-xl font-black font-mono text-amber-700">{order.order_number}</h4>
          <p className="text-sm font-semibold text-slate-800 mt-1">
            {order.customer?.full_name || 'العميل'}
          </p>
          <p className="text-xs text-slate-500">
            {order.garment_type} - {order.fabric || 'بدون تحديد القماش'}
          </p>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">السعر</span>
            <span className="font-bold text-slate-800">{order.price} {currency}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">المدفوع</span>
            <span className="font-bold text-emerald-700">{order.paid_amount} {currency}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">المتبقي</span>
            <span className="font-bold text-rose-600">{remaining} {currency}</span>
          </div>
        </div>

        <div className="text-xs text-slate-500 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/50">
          موعد التسليم المتوقع: <strong className="text-slate-800 font-mono">{order.expected_delivery_date}</strong>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          <Link to={`/orders/${order.id}?print=true`} onClick={onClose} className="w-full">
            <Button variant="primary" size="md" className="w-full text-xs">
              <Printer className="w-4 h-4 ml-1.5" />
              طباعة السند / الفاتورة
            </Button>
          </Link>

          <Link to={`/orders/${order.id}`} onClick={onClose} className="w-full">
            <Button variant="outline" size="md" className="w-full text-xs">
              <Eye className="w-4 h-4 ml-1.5" />
              عرض تفاصيل الطلب
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          {onNewOrder ? (
            <button
              onClick={() => {
                onClose();
                onNewOrder();
              }}
              className="text-amber-700 font-bold hover:underline inline-flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              تسجيل طلب آخر
            </button>
          ) : <div />}

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
          >
            إغلاق النافذة
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Modal>
  );
}

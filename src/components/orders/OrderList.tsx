import { Link } from 'react-router-dom';
import {
  Calendar,
  Eye,
  Edit,
  Printer,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type { Order, OrderStatus } from '@/types/database';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

interface OrderListProps {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onEdit: (order: Order) => void;
  onQuickStatusChange: (orderId: string, status: OrderStatus) => void;
  isLoading?: boolean;
}

export function OrderList({
  orders,
  total,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onQuickStatusChange,
  isLoading,
}: OrderListProps) {
  const { shop } = useAuth();
  const currency = shop?.currency === 'JOD' ? 'د.أ' : (shop?.currency || 'د.أ');

  const today = new Date().toISOString().split('T')[0];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-18 bg-white rounded-xl border border-slate-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-6">
        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-800">لا توجد طلبات مطابقة</h4>
        <p className="text-xs text-slate-500 mt-1">لم يتم العثور على أي طلبات تطابق معايير البحث والفلترة</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. DESKTOP TABLE VIEW */}
      <div className="hidden lg:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-600">
            <tr>
              <th className="py-3.5 px-4">رقم الطلب</th>
              <th className="py-3.5 px-4">الزبون</th>
              <th className="py-3.5 px-4">نوع الثوب / القماش</th>
              <th className="py-3.5 px-4">تاريخ الطلب</th>
              <th className="py-3.5 px-4">تاريخ التسليم</th>
              <th className="py-3.5 px-4 text-center">السعر</th>
              <th className="py-3.5 px-4 text-center">المدفوع</th>
              <th className="py-3.5 px-4 text-center">المتبقي</th>
              <th className="py-3.5 px-4 text-center">الحالة</th>
              <th className="py-3.5 px-4 text-left">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((ord) => {
              const remaining = Math.max(0, (ord.price || 0) - (ord.paid_amount || 0));
              const isOverdue =
                ord.expected_delivery_date < today &&
                ord.status !== 'delivered' &&
                ord.status !== 'cancelled';
              const isToday =
                ord.expected_delivery_date === today &&
                ord.status !== 'delivered' &&
                ord.status !== 'cancelled';

              return (
                <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-amber-700">
                    <Link to={`/orders/${ord.id}`} className="hover:underline">
                      {ord.order_number}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    {ord.customer ? (
                      <div>
                        <Link
                          to={`/customers/${ord.customer.id}`}
                          className="font-semibold text-slate-800 hover:text-amber-600 block"
                        >
                          {ord.customer.full_name}
                        </Link>
                        <span className="text-xs text-slate-400 font-mono" dir="ltr">
                          {ord.customer.phone}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">عميل غير معروف</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800 block">{ord.garment_type}</span>
                    {ord.fabric && (
                      <span className="text-xs text-slate-400 block">{ord.fabric}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-500">
                    {ord.order_date}
                  </td>
                  <td className="py-3 px-4 text-xs font-mono">
                    <span
                      className={`inline-flex items-center gap-1 ${
                        isOverdue
                          ? 'text-rose-600 font-bold'
                          : isToday
                          ? 'text-amber-600 font-bold'
                          : 'text-slate-600'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      {ord.expected_delivery_date}
                    </span>
                    {isOverdue && (
                      <span className="block text-[10px] text-rose-500 font-sans font-semibold">
                        متأخر عن الموعد!
                      </span>
                    )}
                    {isToday && (
                      <span className="block text-[10px] text-amber-600 font-sans font-semibold">
                        موعد التسليم اليوم
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800">
                    {ord.price} {currency}
                  </td>
                  <td className="py-3 px-4 text-center font-medium text-emerald-700">
                    {ord.paid_amount} {currency}
                  </td>
                  <td className="py-3 px-4 text-center font-bold">
                    {remaining > 0 ? (
                      <span className="text-rose-600">
                        {remaining} {currency}
                      </span>
                    ) : (
                      <span className="text-emerald-600 text-xs font-semibold">خالص</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex flex-col items-center gap-1">
                      <OrderStatusBadge status={ord.status} />
                      {/* Fast status transition buttons */}
                      {ord.status === 'in_progress' && (
                        <button
                          onClick={() => onQuickStatusChange(ord.id, 'ready')}
                          className="text-[10px] text-emerald-600 hover:underline flex items-center gap-0.5 mt-0.5"
                          title="تحديد الطلب كجاهز"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          تحديد كجاهز
                        </button>
                      )}
                      {ord.status === 'ready' && (
                        <button
                          onClick={() => onQuickStatusChange(ord.id, 'delivered')}
                          className="text-[10px] text-slate-600 hover:underline flex items-center gap-0.5 mt-0.5 font-bold"
                          title="تأكيد تسليم الطلب للزبون"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          تم التسليم
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-left">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/orders/${ord.id}`} title="عرض تفاصيل الطلب">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-amber-600">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/orders/${ord.id}?print=true`} title="طباعة السند">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-blue-600">
                          <Printer className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="تعديل الطلب"
                        onClick={() => onEdit(ord)}
                        className="h-8 w-8 text-slate-600 hover:text-slate-900"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 2. MOBILE CARD LIST VIEW */}
      <div className="lg:hidden space-y-3">
        {orders.map((ord) => {
          const remaining = Math.max(0, (ord.price || 0) - (ord.paid_amount || 0));
          const isOverdue =
            ord.expected_delivery_date < today &&
            ord.status !== 'delivered' &&
            ord.status !== 'cancelled';
          const isToday =
            ord.expected_delivery_date === today &&
            ord.status !== 'delivered' &&
            ord.status !== 'cancelled';

          return (
            <div
              key={ord.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/orders/${ord.id}`}
                      className="font-mono font-bold text-base text-amber-700 hover:underline"
                    >
                      {ord.order_number}
                    </Link>
                    <OrderStatusBadge status={ord.status} />
                  </div>
                  {ord.customer && (
                    <Link
                      to={`/customers/${ord.customer.id}`}
                      className="font-semibold text-sm text-slate-800 mt-1 block"
                    >
                      {ord.customer.full_name}
                    </Link>
                  )}
                </div>

                <div className="text-left font-mono">
                  <span className="text-base font-bold text-slate-900 block">
                    {ord.price} {currency}
                  </span>
                  {remaining > 0 ? (
                    <span className="text-xs text-rose-600 font-bold block">
                      متبقي: {remaining} {currency}
                    </span>
                  ) : (
                    <span className="text-xs text-emerald-600 font-semibold block">خالص</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>{ord.garment_type} {ord.fabric ? `(${ord.fabric})` : ''}</span>
                <span
                  className={`inline-flex items-center gap-1 font-mono font-semibold ${
                    isOverdue
                      ? 'text-rose-600'
                      : isToday
                      ? 'text-amber-600'
                      : 'text-slate-600'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  تسليم: {ord.expected_delivery_date}
                  {isOverdue && ' (متأخر)'}
                  {isToday && ' (اليوم)'}
                </span>
              </div>

              {/* Mobile actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                {/* Fast status advance button */}
                <div>
                  {ord.status === 'in_progress' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onQuickStatusChange(ord.id, 'ready')}
                      className="text-xs h-8 text-emerald-700 border-emerald-200 bg-emerald-50/50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
                      جاهز
                    </Button>
                  )}
                  {ord.status === 'ready' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onQuickStatusChange(ord.id, 'delivered')}
                      className="text-xs h-8 text-slate-700 border-slate-300 font-bold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 ml-1 text-emerald-600" />
                      تسليم للزبون
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <Link to={`/orders/${ord.id}`}>
                    <Button variant="outline" size="sm" className="text-xs h-8 px-2.5">
                      <Eye className="w-3.5 h-3.5 ml-1" />
                      عرض
                    </Button>
                  </Link>
                  <Link to={`/orders/${ord.id}?print=true`}>
                    <Button variant="outline" size="sm" className="text-xs h-8 px-2.5 text-blue-700">
                      <Printer className="w-3.5 h-3.5 ml-1" />
                      طباعة
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(ord)}
                    className="text-xs h-8 px-2"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 px-1 text-xs text-slate-500">
          <span>
            عرض {(page - 1) * 10 + 1} إلى {Math.min(page * 10, total)} من أصل {total} طلب
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="h-8 px-2.5 text-xs"
            >
              <ChevronRight className="w-4 h-4 ml-1" />
              السابق
            </Button>

            <span className="px-3 font-semibold text-slate-700">
              صفحة {page} من {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="h-8 px-2.5 text-xs"
            >
              التالي
              <ChevronLeft className="w-4 h-4 mr-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

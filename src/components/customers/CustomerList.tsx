import { Link } from 'react-router-dom';
import {
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Calendar,
  AlertCircle,
  Archive,
} from 'lucide-react';
import type { CustomerWithStats } from '@/services/customerService';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';

interface CustomerListProps {
  customers: CustomerWithStats[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onEdit: (customer: CustomerWithStats) => void;
  onDelete: (customer: CustomerWithStats) => void;
  isLoading?: boolean;
}

export function CustomerList({
  customers,
  total,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  isLoading,
}: CustomerListProps) {
  const { shop } = useAuth();
  const currency = shop?.currency === 'JOD' ? 'د.أ' : (shop?.currency || 'د.أ');

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-18 bg-white rounded-xl border border-slate-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-6">
        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-800">لا توجد نتائج مطابقة</h4>
        <p className="text-xs text-slate-500 mt-1">لم يتم العثور على أي عملاء بالاسم أو رقم الهاتف المدخل</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. DESKTOP TABLE VIEW */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-600">
            <tr>
              <th className="py-3.5 px-4">العميل</th>
              <th className="py-3.5 px-4">رقم الهاتف</th>
              <th className="py-3.5 px-4">العنوان</th>
              <th className="py-3.5 px-4 text-center">الطلبات</th>
              <th className="py-3.5 px-4 text-center">المتبقي للتحصيل</th>
              <th className="py-3.5 px-4">آخر طلب</th>
              <th className="py-3.5 px-4 text-left">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => {
              const remaining = c.stats?.remainingBalance || 0;
              return (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    <Link
                      to={`/customers/${c.id}`}
                      className="hover:text-amber-600 transition-colors inline-flex items-center gap-1.5"
                    >
                      {c.full_name}
                      {c.is_archived && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm">
                          مؤرشف
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600" dir="ltr">
                    <a
                      href={`tel:${c.phone}`}
                      className="hover:text-amber-600 transition-colors inline-flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {c.phone}
                    </a>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500 max-w-[150px] truncate">
                    {c.address ? (
                      <span className="inline-flex items-center gap-1 truncate" title={c.address}>
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {c.address}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700">
                    {c.stats?.totalOrders || 0}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {remaining > 0 ? (
                      <Badge variant="warning">
                        {remaining} {currency}
                      </Badge>
                    ) : (
                      <span className="text-xs text-emerald-600 font-semibold">خالص</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {c.stats?.lastOrderDate ? (
                      <span className="inline-flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {c.stats.lastOrderDate}
                      </span>
                    ) : (
                      <span className="text-slate-400">لا يوجد طلبات</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-left">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/customers/${c.id}`} title="عرض تفاصيل العميل">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-amber-600">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="تعديل العميل"
                        onClick={() => onEdit(c)}
                        className="h-8 w-8 text-slate-600 hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={c.stats && c.stats.totalOrders > 0 ? 'أرشفة العميل' : 'حذف العميل'}
                        onClick={() => onDelete(c)}
                        className="h-8 w-8 text-slate-400 hover:text-rose-600"
                      >
                        {c.stats && c.stats.totalOrders > 0 ? (
                          <Archive className="w-4 h-4" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
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
      <div className="md:hidden space-y-3">
        {customers.map((c) => {
          const remaining = c.stats?.remainingBalance || 0;
          return (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    to={`/customers/${c.id}`}
                    className="font-bold text-base text-slate-900 hover:text-amber-600 block"
                  >
                    {c.full_name}
                  </Link>
                  <a
                    href={`tel:${c.phone}`}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 font-mono mt-0.5 hover:text-amber-600"
                    dir="ltr"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    {c.phone}
                  </a>
                </div>

                {remaining > 0 ? (
                  <Badge variant="warning">
                    متبقي: {remaining} {currency}
                  </Badge>
                ) : (
                  <Badge variant="success">خالص</Badge>
                )}
              </div>

              {c.address && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{c.address}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span>الطلبات: <strong className="text-slate-800">{c.stats?.totalOrders || 0}</strong></span>
                <span>آخر طلب: <strong className="text-slate-800">{c.stats?.lastOrderDate || 'لا يوجد'}</strong></span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Link to={`/customers/${c.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <Eye className="w-3.5 h-3.5 ml-1" />
                    عرض السجل
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => onEdit(c)} className="text-xs">
                  <Edit className="w-3.5 h-3.5 ml-1" />
                  تعديل
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(c)}
                  className="text-xs text-rose-500 hover:text-rose-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. PAGINATION BAR */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 px-1 text-xs text-slate-500">
          <span>
            عرض {(page - 1) * 10 + 1} إلى {Math.min(page * 10, total)} من أصل {total} عميل
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

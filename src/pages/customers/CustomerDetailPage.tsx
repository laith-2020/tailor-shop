import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  TrendingUp,
  CreditCard,
  AlertCircle,
  PlusCircle,
  Edit,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { useCustomer, useCustomerStats, useCustomerOrders, useUpdateCustomer } from '@/hooks/useCustomers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CustomerFormModal } from '@/components/customers/CustomerFormModal';
import { useAuth } from '@/hooks/useAuth';
import type { CustomerFormData } from '@/schemas/customer';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { shop } = useAuth();
  const currency = shop?.currency === 'JOD' ? 'د.أ' : (shop?.currency || 'د.أ');

  const [editModalOpen, setEditModalOpen] = useState(false);

  const { data: customer, isLoading: isCustomerLoading } = useCustomer(id);
  const { data: stats, isLoading: isStatsLoading } = useCustomerStats(id);
  const { data: orders, isLoading: isOrdersLoading } = useCustomerOrders(id);

  const updateCustomerMutation = useUpdateCustomer();

  if (isCustomerLoading || isStatsLoading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="جاري تحميل ملف العميل..." />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">العميل غير موجود</h2>
        <p className="text-sm text-slate-500">لم يتم العثور على سجل لهذا العميل أو تم حذفه</p>
        <Link to="/customers">
          <Button variant="outline">العودة لسجل العملاء</Button>
        </Link>
      </div>
    );
  }

  // Clean phone number for WhatsApp link
  const cleanPhoneForWhatsApp = customer.phone.replace(/[^0-9]/g, '');
  const formattedWhatsApp = cleanPhoneForWhatsApp.startsWith('0')
    ? '962' + cleanPhoneForWhatsApp.slice(1) // Default Jordan country code if starts with 0
    : cleanPhoneForWhatsApp;

  const handleUpdateSubmit = async (formData: CustomerFormData) => {
    await updateCustomerMutation.mutateAsync({ id: customer.id, data: formData });
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/customers')}
            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="رجوع لسجل العملاء"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{customer.full_name}</h1>
              {customer.is_archived && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  مؤرشف
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5" dir="ltr">
              {customer.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)}>
            <Edit className="w-3.5 h-3.5 ml-1.5" />
            تعديل البيانات
          </Button>

          <Link to={`/orders?newCustomerOrder=${customer.id}`}>
            <Button variant="primary" size="sm">
              <PlusCircle className="w-4 h-4 ml-1.5" />
              طلب جديد لهذا العميل
            </Button>
          </Link>
        </div>
      </div>

      {/* Customer Contact & Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Information Card */}
        <Card className="md:col-span-1 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>معلومات العميل</span>
              <div className="flex items-center gap-1.5">
                <a
                  href={`tel:${customer.phone}`}
                  className="p-1.5 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100"
                  title="اتصال هاتفي"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href={`https://wa.me/${formattedWhatsApp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  title="مراسلة واتساب"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5 text-sm">
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">الهاتف الأساسي</span>
              <a
                href={`tel:${customer.phone}`}
                className="font-mono text-slate-800 font-semibold hover:text-amber-600 block"
                dir="ltr"
              >
                {customer.phone}
              </a>
            </div>

            {customer.alternative_phone && (
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">الهاتف الإضافي</span>
                <a
                  href={`tel:${customer.alternative_phone}`}
                  className="font-mono text-slate-700 hover:text-amber-600 block"
                  dir="ltr"
                >
                  {customer.alternative_phone}
                </a>
              </div>
            )}

            <div>
              <span className="text-xs text-slate-400 block mb-0.5">العنوان / المنطقة</span>
              <span className="text-slate-800 flex items-start gap-1">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                {customer.address || 'غير محدد'}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block mb-0.5">تاريخ التسجيل</span>
              <span className="text-xs text-slate-600 font-mono flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(customer.created_at).toLocaleDateString('ar-JO')}
              </span>
            </div>

            {customer.notes && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400 block mb-1">ملاحظات وتفضيلات الخياطة</span>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  {customer.notes}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial & Order Statistics Cards */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 bg-slate-50/60 border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">عدد الطلبات</span>
              <ShoppingBag className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats?.totalOrders || 0}</div>
            <div className="text-[11px] text-slate-400 mt-1">إجمالي طلبات التفصيل</div>
          </Card>

          <Card className="p-4 bg-slate-50/60 border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">إجمالي المبيعات</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {stats?.totalSales || 0}{' '}
              <span className="text-xs font-normal text-slate-500">{currency}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">مجموع فواتير الطلبات</div>
          </Card>

          <Card className="p-4 bg-slate-50/60 border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">المبلغ المدفوع</span>
              <CreditCard className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700">
              {stats?.totalPaid || 0}{' '}
              <span className="text-xs font-normal text-slate-500">{currency}</span>
            </div>
            <div className="text-[11px] text-emerald-600/80 mt-1">المستلم فعلياً</div>
          </Card>

          <Card
            className={`p-4 border ${
              (stats?.remainingBalance || 0) > 0
                ? 'bg-rose-50/40 border-rose-200'
                : 'bg-emerald-50/40 border-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">المبلغ المتبقي</span>
              <AlertCircle
                className={`w-4 h-4 ${
                  (stats?.remainingBalance || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              />
            </div>
            <div
              className={`text-2xl font-bold ${
                (stats?.remainingBalance || 0) > 0 ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {stats?.remainingBalance || 0}{' '}
              <span className="text-xs font-normal text-slate-500">{currency}</span>
            </div>
            <div
              className={`text-[11px] mt-1 ${
                (stats?.remainingBalance || 0) > 0 ? 'text-rose-600/80 font-medium' : 'text-emerald-600/80'
              }`}
            >
              {(stats?.remainingBalance || 0) > 0 ? 'ذمم مستحقة للتحصيل' : 'لا يوجد متبقي'}
            </div>
          </Card>

          {/* Quick Notice Banner on Previous Measurements */}
          <div className="col-span-2 sm:col-span-4 p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                آخر طلب مسجل لهذا العميل: <strong>{stats?.lastOrderDate || 'لا يوجد بعد'}</strong>
              </span>
            </div>
            <Link
              to={`/orders?newCustomerOrder=${customer.id}&copyLast=true`}
              className="text-amber-800 font-bold hover:underline inline-flex items-center gap-1 shrink-0"
            >
              نسخ مقاسات آخر طلب في طلب جديد
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Previous Orders Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">الطلبات السابقة للعميل</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              سجل كافة طلبات التفصيل وحالاتها والمبالغ المالية الخاصة بها
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {isOrdersLoading ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner text="جاري جلب الطلبات السابقة..." />
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium">لا توجد طلبات سابقة مسجلة لهذا العميل</p>
              <Link to={`/orders?newCustomerOrder=${customer.id}`} className="inline-block mt-3">
                <Button variant="primary" size="sm">
                  <PlusCircle className="w-4 h-4 ml-1" />
                  إنشاء أول طلب الآن
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="py-3 px-4">رقم الطلب</th>
                    <th className="py-3 px-4">تاريخ الطلب</th>
                    <th className="py-3 px-4">نوع الثوب</th>
                    <th className="py-3 px-4 text-center">السعر</th>
                    <th className="py-3 px-4 text-center">المدفوع</th>
                    <th className="py-3 px-4 text-center">المتبقي</th>
                    <th className="py-3 px-4 text-center">الحالة</th>
                    <th className="py-3 px-4 text-left">التفاصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((ord) => {
                    const remaining = Math.max(0, (ord.price || 0) - (ord.paid_amount || 0));
                    return (
                      <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-amber-700">
                          <Link to={`/orders/${ord.id}`} className="hover:underline">
                            {ord.order_number}
                          </Link>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-600">
                          {ord.order_date}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {ord.garment_type}
                          {ord.fabric && (
                            <span className="text-xs text-slate-400 block">{ord.fabric}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-800">
                          {ord.price} {currency}
                        </td>
                        <td className="py-3 px-4 text-center text-emerald-700 font-medium">
                          {ord.paid_amount} {currency}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          {remaining > 0 ? (
                            <span className="text-rose-600">
                              {remaining} {currency}
                            </span>
                          ) : (
                            <span className="text-emerald-600 text-xs">خالص</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <OrderStatusBadge status={ord.status} />
                        </td>
                        <td className="py-3 px-4 text-left">
                          <Link to={`/orders/${ord.id}`}>
                            <Button variant="ghost" size="sm" className="text-xs text-amber-700 hover:bg-amber-50">
                              عرض الطلب
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Customer Modal */}
      <CustomerFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        customer={customer}
        onSubmit={handleUpdateSubmit}
        isLoading={updateCustomerMutation.isPending}
      />
    </div>
  );
}

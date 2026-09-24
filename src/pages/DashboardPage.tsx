import { Link } from 'react-router-dom';
import {
  Users,
  Scissors,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  PlusCircle,
  Eye,
  Clock,
  PackageCheck,
  Phone,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useUpdateOrderStatus } from '@/hooks/useOrders';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { OrderStatus } from '@/types/database';

export function DashboardPage() {
  const { profile, shop } = useAuth();
  const shopName = shop?.name || 'مخيطة حضرموت';
  const currency = shop?.currency === 'JOD' ? 'د.أ' : (shop?.currency || 'د.أ');

  const { data: stats, isLoading } = useDashboardStats();
  const updateStatusMutation = useUpdateOrderStatus();

  const today = new Date().toISOString().split('T')[0];

  const handleQuickStatus = async (orderId: string, status: OrderStatus) => {
    await updateStatusMutation.mutateAsync({ orderId, status });
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            مرحباً بك، {profile?.full_name?.split(' ')[0] || 'الخياط'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            لوحة قيادة <strong className="text-slate-800">{shopName}</strong> لمتابعة الطلبات والتسليمات
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/orders">
            <Button variant="primary" size="md" className="shadow-sm">
              <PlusCircle className="w-4 h-4 ml-1.5" />
              طلب تفصيل جديد
            </Button>
          </Link>
          <Link to="/customers">
            <Button variant="outline" size="md">
              <Users className="w-4 h-4 ml-1.5" />
              سجل العملاء
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner text="جاري تحديث إحصائيات المتجر..." />
        </div>
      ) : (
        <>
          {/* Main 7 KPI Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. إجمالي العملاء */}
            <Card className="p-4 bg-white shadow-2xs hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">إجمالي العملاء</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
                {stats?.totalCustomers || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">العملاء المسجلين</div>
            </Card>

            {/* 2. طلبات اليوم */}
            <Card className="p-4 bg-white shadow-2xs hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">طلبات اليوم</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-blue-700">
                {stats?.todayOrdersCount || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">الطلبات المسجلة اليوم</div>
            </Card>

            {/* 3. قيد التفصيل */}
            <Card className="p-4 bg-white shadow-2xs hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">قيد التفصيل</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Scissors className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-700">
                {stats?.inProgressCount || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">أثواب قيد العمل بالورشة</div>
            </Card>

            {/* 4. طلبات جاهزة */}
            <Card className="p-4 bg-white shadow-2xs hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">طلبات جاهزة</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <PackageCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700">
                {stats?.readyCount || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">جاهزة للاستلام من الزبون</div>
            </Card>

            {/* 5. طلبات التسليم اليوم */}
            <Card
              className={`p-4 shadow-2xs border ${
                (stats?.deliveryTodayCount || 0) > 0
                  ? 'bg-amber-50/50 border-amber-300'
                  : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600">تسليمات اليوم</span>
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-900">
                {stats?.deliveryTodayCount || 0}
              </div>
              <div className="text-[11px] text-amber-800/80 mt-1">مطلوب تسليمها اليوم للزبائن</div>
            </Card>

            {/* 6. المبالغ المستحقة للتحصيل */}
            <Card
              className={`p-4 shadow-2xs border ${
                (stats?.outstandingBalance || 0) > 0
                  ? 'bg-rose-50/40 border-rose-200'
                  : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600">المبالغ المستحقة</span>
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-rose-700">
                {stats?.outstandingBalance || 0}{' '}
                <span className="text-xs font-normal text-slate-500">{currency}</span>
              </div>
              <div className="text-[11px] text-rose-600/80 mt-1">متبقي بذمة الزبائن</div>
            </Card>

            {/* 7. إجمالي المبيعات هذا الشهر */}
            <Card className="p-4 bg-white shadow-2xs lg:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">إجمالي مبيعات الشهر</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
                {stats?.thisMonthSales || 0}{' '}
                <span className="text-xs font-normal text-slate-500">{currency}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">مجموع فواتير الطلبات لهذا الشهر</div>
            </Card>
          </div>

          {/* Section 14: Follow-up Table ("الطلبات التي تحتاج متابعة") */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
                  الطلبات التي تحتاج متابعة
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  الطلبات المتأخرة، طلبات التسليم المقررة اليوم، والطلبات الجاهزة بانتظار استلام الزبون
                </p>
              </div>

              <Link to="/orders">
                <Button variant="ghost" size="sm" className="text-xs text-amber-700 hover:bg-amber-50">
                  عرض كل الطلبات
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="pt-2">
              {!stats?.followUpOrders || stats.followUpOrders.length === 0 ? (
                <div className="text-center py-10 text-slate-400 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">لا توجد طلبات متأخرة أو معلقة!</p>
                  <p className="text-xs text-slate-500">كافة الطلبات منجزة ومسلمة بمواعيدها بدقة</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-600">
                      <tr>
                        <th className="py-3 px-3">الزبون</th>
                        <th className="py-3 px-3">الطلب</th>
                        <th className="py-3 px-3">نوع الثوب</th>
                        <th className="py-3 px-3">موعد التسليم</th>
                        <th className="py-3 px-3 text-center">المتبقي</th>
                        <th className="py-3 px-3 text-center">الحالة</th>
                        <th className="py-3 px-3 text-left">إجراء سريع</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats.followUpOrders.map((ord) => {
                        const remaining = Math.max(0, (ord.price || 0) - (ord.paid_amount || 0));
                        const isOverdue = ord.expected_delivery_date < today && ord.status !== 'delivered';
                        const isToday = ord.expected_delivery_date === today && ord.status !== 'delivered';

                        return (
                          <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-3">
                              {ord.customer ? (
                                <div>
                                  <Link
                                    to={`/customers/${ord.customer.id}`}
                                    className="font-bold text-slate-800 hover:text-amber-600 block text-xs"
                                  >
                                    {ord.customer.full_name}
                                  </Link>
                                  <a
                                    href={`tel:${ord.customer.phone}`}
                                    className="font-mono text-[11px] text-slate-500 hover:text-amber-600 inline-flex items-center gap-1"
                                    dir="ltr"
                                  >
                                    <Phone className="w-3 h-3 text-amber-600" />
                                    {ord.customer.phone}
                                  </a>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-xs">عميل</span>
                              )}
                            </td>

                            <td className="py-2.5 px-3 font-mono font-bold text-amber-700 text-xs">
                              <Link to={`/orders/${ord.id}`} className="hover:underline">
                                {ord.order_number}
                              </Link>
                            </td>

                            <td className="py-2.5 px-3 text-xs text-slate-700">
                              {ord.garment_type}
                            </td>

                            <td className="py-2.5 px-3 text-xs font-mono">
                              <span
                                className={`inline-flex items-center gap-1 font-semibold ${
                                  isOverdue
                                    ? 'text-rose-600 font-bold'
                                    : isToday
                                    ? 'text-amber-600 font-bold'
                                    : 'text-slate-700'
                                }`}
                              >
                                {ord.expected_delivery_date}
                              </span>
                              {isOverdue && (
                                <span className="block text-[10px] text-rose-500 font-sans">
                                  متأخر!
                                </span>
                              )}
                              {isToday && (
                                <span className="block text-[10px] text-amber-600 font-sans">
                                  اليوم
                                </span>
                              )}
                            </td>

                            <td className="py-2.5 px-3 text-center text-xs font-mono font-bold">
                              {remaining > 0 ? (
                                <span className="text-rose-600">{remaining} {currency}</span>
                              ) : (
                                <span className="text-emerald-600 font-sans">خالص</span>
                              )}
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              <OrderStatusBadge status={ord.status} />
                            </td>

                            <td className="py-2.5 px-3 text-left">
                              <div className="flex items-center justify-end gap-1.5">
                                {ord.status === 'in_progress' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuickStatus(ord.id, 'ready')}
                                    className="h-7 text-xs text-emerald-700 border-emerald-200 bg-emerald-50/50 px-2"
                                    title="تحديد كجاهز للتسليم"
                                  >
                                    <CheckCircle2 className="w-3 h-3 ml-1" />
                                    جاهز
                                  </Button>
                                )}
                                {ord.status === 'ready' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuickStatus(ord.id, 'delivered')}
                                    className="h-7 text-xs text-slate-800 border-slate-300 font-bold px-2"
                                    title="تأكيد التسليم للزبون"
                                  >
                                    <CheckCircle2 className="w-3 h-3 ml-1 text-emerald-600" />
                                    تسليم
                                  </Button>
                                )}
                                <Link to={`/orders/${ord.id}`} title="عرض الطلب">
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-600">
                                    <Eye className="w-3.5 h-3.5" />
                                  </Button>
                                </Link>
                              </div>
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
        </>
      )}
    </div>
  );
}

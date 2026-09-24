import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Users,
  ClipboardList,
  Ruler,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Phone,
  MapPin,
  PlusCircle,
} from 'lucide-react';

export function DashboardPage() {
  const { user, profile, shop, isConfigured } = useAuth();
  const shopName = shop?.name || 'مخيطة حضرموت';

  return (
    <div className="space-y-6">
      {/* Header section with tailor welcome and shop name */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            مرحباً بك، {profile?.full_name || 'الخياط'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة متكاملة لـ <strong className="text-slate-800">{shopName}</strong> وتفصيل الأثواب والمقاسات
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/orders">
            <Button variant="primary" size="md">
              <PlusCircle className="w-4 h-4 ml-1.5" />
              طلب جديد
            </Button>
          </Link>
          <Link to="/customers">
            <Button variant="outline" size="md">
              <Users className="w-4 h-4 ml-1.5" />
              العملاء
            </Button>
          </Link>
        </div>
      </div>

      {/* Phase 1 Verification Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-emerald-900">
                حالة المصادقة والحساب
              </CardTitle>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-emerald-800 space-y-1">
            <p><strong>المستخدم:</strong> {user?.email}</p>
            <p><strong>الدور:</strong> {profile?.role === 'owner' ? 'مدير المحل (Owner)' : 'طاقم العمل (Staff)'}</p>
            <p><strong>حالة الدخول:</strong> تم التحقق بنجاح</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/40">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-amber-900">
                المتجر النشط
              </CardTitle>
              <Building2 className="w-5 h-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-amber-800 space-y-1">
            <p><strong>اسم المحل:</strong> {shopName}</p>
            <p><strong>العملة:</strong> {shop?.currency || 'JOD'} (د.أ)</p>
            <p><strong>وحدة القياس:</strong> {shop?.measurement_unit || 'سم'}</p>
          </CardContent>
        </Card>

        <Card className="border-sky-200 bg-sky-50/40">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-sky-900">
                حماية البيانات وعزل المتاجر
              </CardTitle>
              <ShieldCheck className="w-5 h-5 text-sky-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-sky-800 space-y-1">
            <p><strong>أمان RLS:</strong> نشط على كل الجداول</p>
            <p><strong>معرف المتجر:</strong> {shop?.id ? shop.id.slice(0, 12) + '...' : 'محلي'}</p>
            <p><strong>المزود:</strong> {isConfigured ? 'Supabase Live' : 'Demo Storage'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Shop Information card */}
      <Card>
        <CardHeader>
          <CardTitle>بيانات المتجر</CardTitle>
          <CardDescription>المعلومات المسجلة للمحل حالياً (قابلة للتعديل من الإعدادات)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <Building2 className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="text-xs text-slate-400 block">اسم المخيطة</span>
                <span className="font-semibold text-slate-800">{shopName}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <Phone className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="text-xs text-slate-400 block">هاتف المتجر</span>
                <span className="font-semibold text-slate-800">{shop?.phone || '0791234567'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <MapPin className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="text-xs text-slate-400 block">العنوان</span>
                <span className="font-semibold text-slate-800">{shop?.address || 'عمان - الأردن'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/customers"
          className="p-5 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              المرحلة 2
            </span>
          </div>
          <h3 className="font-bold text-slate-800 text-base group-hover:text-amber-600 transition-colors">
            إدارة العملاء
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            سجل العملاء، أرقام الهواتف، الأرصدة المستحقة، وتاريخ الطلبات
          </p>
        </Link>

        <Link
          to="/orders"
          className="p-5 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
              المرحلة 3
            </span>
          </div>
          <h3 className="font-bold text-slate-800 text-base group-hover:text-sky-600 transition-colors">
            طلبات التفصيل
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            متابعة حالة الطلبات، مواعيد التسليم، المدفوعات، وحساب المتبقي
          </p>
        </Link>

        <Link
          to="/measurements"
          className="p-5 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Ruler className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              المرحلة 4
            </span>
          </div>
          <h3 className="font-bold text-slate-800 text-base group-hover:text-purple-600 transition-colors">
            بطاقات المقاسات
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            سجل المقاسات المخصص لكل طلب مع إمكانية نسخ مقاسات آخر طلب
          </p>
        </Link>
      </div>
    </div>
  );
}

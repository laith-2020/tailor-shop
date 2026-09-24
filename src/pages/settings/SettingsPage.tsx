import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Settings, Building2, Phone, MapPin, DollarSign, Ruler, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function SettingsPage() {
  const { shop, isConfigured } = useAuth();
  const shopName = shop?.name || 'مخيطة حضرموت';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إعدادات النظام</h1>
          <p className="text-sm text-slate-500">تخصيص بيانات المحل، العملة، وحدات القياس، والاتصال</p>
        </div>
        <Button variant="primary" disabled>
          حفظ التغييرات
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-600" />
              بيانات المخيطة
            </CardTitle>
            <CardDescription>الاسم يظهر في كافة الفواتير والطباعة وواجهة النظام</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">اسم المحل</label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                {shopName}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">رقم الهاتف</label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                {shop?.phone || '0791234567'}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">العنوان</label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                {shop?.address || 'عمان - شارع وصفي التل'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-600" />
              الوحدات والعملات
            </CardTitle>
            <CardDescription>القيم الافتراضية للحسابات والقياسات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">العملة الافتراضية</label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-400" />
                <span>{shop?.currency || 'JOD'} (دينار أردني - د.أ)</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">وحدة المقاسات</label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium flex items-center gap-2">
                <Ruler className="w-4 h-4 text-slate-400" />
                <span>{shop?.measurement_unit || 'سم'} (سنتيمتر)</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">حالة اتصال السحابة (Supabase)</label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className={isConfigured ? 'text-emerald-700' : 'text-amber-700'}>
                  {isConfigured ? 'متصل بقاعدة بيانات Supabase الحقيقية' : 'الوضع التجريبي النشط (بانتظار مفاتيح الربط)'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

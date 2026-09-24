import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building2,
  Phone,
  MapPin,
  DollarSign,
  Ruler,
  ShieldCheck,
  Save,
  CheckCircle2,
  Smartphone,
  Info,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { shopService } from '@/services/shopService';
import { settingsSchema, type SettingsFormData } from '@/schemas/settings';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export function SettingsPage() {
  const { shop, refreshProfileAndShop, isConfigured } = useAuth();
  const shopId = shop?.id || '00000000-0000-0000-0000-000000000001';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: shop?.name || 'مخيطة حضرموت',
      phone: shop?.phone || '0791234567',
      address: shop?.address || 'عمان - شارع وصفي التل',
      currency: shop?.currency || 'JOD',
      measurement_unit: shop?.measurement_unit || 'سم',
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    try {
      setIsSubmitting(true);
      setFormError(null);
      await shopService.updateShop(shopId, data);
      await refreshProfileAndShop();
      setIsSubmitting(false);
      setToastMessage('تم حفظ إعدادات المخيطة وتحديث النظام بنجاح');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ الإعدادات';
      setFormError(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إعدادات النظام والمحل</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            تخصيص اسم المخيطة، العملة، وحدات القياس، ومعلومات الاتصال بالفواتير
          </p>
        </div>
      </div>

      {formError && <Alert variant="error">{formError}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shop Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="w-5 h-5 text-amber-600" />
                بيانات المخيطة
              </CardTitle>
              <CardDescription>
                يظهر هذا الاسم ورقم الهاتف في ترويسة سندات التفصيل، الإيصالات، ولوحة التحكم
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="اسم المحل / المخيطة"
                placeholder="مثال: مخيطة حضرموت"
                required
                icon={<Building2 className="w-4 h-4" />}
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                label="رقم هاتف المتجر"
                placeholder="0791234567"
                type="tel"
                dir="ltr"
                className="text-right"
                icon={<Phone className="w-4 h-4" />}
                error={errors.phone?.message}
                {...register('phone')}
              />

              <Input
                label="عنوان المحل"
                placeholder="مثال: عمان - شارع وصفي التل"
                icon={<MapPin className="w-4 h-4" />}
                error={errors.address?.message}
                {...register('address')}
              />
            </CardContent>
          </Card>

          {/* Currency & Units Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="w-5 h-5 text-amber-600" />
                العملة ووحدات القياس
              </CardTitle>
              <CardDescription>
                القيم الافتراضية المعتمدة في حساب أسعار التفصيل والمدفوعات والمقاسات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  العملة الافتراضية <span className="text-rose-500">*</span>
                </label>
                <select
                  className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  {...register('currency')}
                >
                  <option value="JOD">دينار أردني (JOD - د.أ)</option>
                  <option value="SAR">ريال سعودي (SAR - ر.س)</option>
                  <option value="AED">درهم إماراتي (AED - د.إ)</option>
                  <option value="KWD">دينار كويتي (KWD - د.ك)</option>
                  <option value="QAR">ريال قطري (QAR - ر.ق)</option>
                  <option value="OMR">ريال عماني (OMR - ر.ع)</option>
                  <option value="BHD">دينار بحريني (BHD - د.ب)</option>
                  <option value="USD">دولار أمريكي (USD - $)</option>
                </select>
                {errors.currency?.message && (
                  <p className="text-xs text-rose-600">{errors.currency.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  وحدة قياس التفصيل <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      value="سم"
                      className="text-amber-600 focus:ring-amber-500"
                      {...register('measurement_unit')}
                    />
                    <span className="text-sm font-semibold text-slate-800">سنتيمتر (سم)</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      value="إنش"
                      className="text-amber-600 focus:ring-amber-500"
                      {...register('measurement_unit')}
                    />
                    <span className="text-sm font-semibold text-slate-800">بوصة / إنش (Inch)</span>
                  </label>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Ruler className="w-4 h-4 text-amber-600" />
                  <span>مرونة القياسات</span>
                </div>
                <p>
                  يتم حفظ المقاسات بالسنتيمتر مع دعم الأجزاء العشرية (مثال: 148.5 سم) لضمان الدقة العالية عند القص.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button Bar */}
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} className="shadow-md">
            <Save className="w-5 h-5 ml-2" />
            حفظ كافة التغييرات
          </Button>
        </div>
      </form>

      {/* Cloud & PWA Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
        {/* Security & RLS Card */}
        <Card className="bg-slate-50/60 border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              أمان قاعدة البيانات وعزل المتاجر (RLS)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 space-y-2">
            <p>
              معمارية النظام مبنية على مبدأ <strong>Multi-Tenant Isolation</strong>؛ حيث يمتلك كل متجر معرفاً فريداً
              مستقلاً (Shop ID) ولا يمكن لأي مستخدم الوصول لبيانات متجر آخر على مستوى محرك PostgreSQL مباشرة.
            </p>
            <div className="flex items-center justify-between p-2 rounded-md bg-white border border-slate-200 font-mono">
              <span>حالة اتصال Supabase:</span>
              <strong className={isConfigured ? 'text-emerald-700' : 'text-amber-700'}>
                {isConfigured ? 'نشط ومتصل' : 'الوضع التجريبي'}
              </strong>
            </div>
          </CardContent>
        </Card>

        {/* PWA & Mobile Installation */}
        <Card className="bg-slate-50/60 border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-600" />
              تثبيت التطبيق على الهاتف (PWA)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 space-y-2">
            <p>
              التطبيق مجهز كتطبيق ويب تقدمي (Progressive Web App). يمكن للخياط تثبيته على شاشة الهاتف الرئيسية
              من خلال متصفح كروم أو سفاري بالنقر على <strong>"إضافة إلى الشاشة الرئيسية (Add to Home screen)"</strong>.
            </p>
            <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50 p-2 rounded-md border border-amber-200">
              <Info className="w-4 h-4 shrink-0" />
              <span>يعمل بواجهة كاملة الشاشة (Standalone) كأنه تطبيق محلي على الهاتف.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

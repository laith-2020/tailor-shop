import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Ruler } from 'lucide-react';

export function MeasurementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">سجل المقاسات</h1>
          <p className="text-sm text-slate-500">استعراض وتفصيل مقاسات الأثواب والسراويل</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>بطاقات المقاسات</CardTitle>
          <CardDescription>سيتم تفعيل بطاقات المقاسات التفاعلية وإمكانية نسخ مقاسات آخر طلب في المرحلة 4</CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Ruler className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">حقول المقاسات مجهزة بالكامل</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            طول الثوب، الكتف، الكم، الصدر، الخصر، الورك، الرقبة، السروال، مع دعم الحقول الإضافية المرنة.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

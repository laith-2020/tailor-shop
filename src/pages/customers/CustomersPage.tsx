import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">العملاء</h1>
          <p className="text-sm text-slate-500">إدارة سجل العملاء وأرقام الهواتف والمقاسات المسجلة</p>
        </div>
        <Button variant="primary">
          <UserPlus className="w-4 h-4 ml-1.5" />
          إضافة عميل جديد
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة العملاء</CardTitle>
          <CardDescription>سيتم تفعيل البحث المتقدم، الإضافة، وتفاصيل الحسابات في المرحلة 2</CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">وحدة العملاء جاهزة للربط</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            تم إعداد بنية قاعدة البيانات، وجداول الـ RLS، ونموذج العميل للبدء في المرحلة 2 فوراً.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { ClipboardList, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">طلبات الخياطة</h1>
          <p className="text-sm text-slate-500">متابعة طلبات التفصيل، الحالات، ومواعيد التسليم</p>
        </div>
        <Button variant="primary">
          <Plus className="w-4 h-4 ml-1.5" />
          إنشاء طلب جديد
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سجل الطلبات</CardTitle>
          <CardDescription>سيتم تفعيل الفلترة والتتبع ومراحل التفصيل وحساب المدفوعات في المرحلة 3</CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">وحدة الطلبات مجهزة بالكامل</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            جدول orders وجدول measurements ومفاتيح العلاقات والترقيم التلقائي جاهزة في قاعدة البيانات.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { Ruler, Scissors } from 'lucide-react';
import type { Measurement } from '@/types/database';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface MeasurementCardProps {
  measurements?: Measurement | null;
  unit?: string;
  className?: string;
}

export function MeasurementCard({ measurements, unit = 'سم', className }: MeasurementCardProps) {
  if (!measurements) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center text-slate-400">
          <Ruler className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm">لم يتم تسجيل مقاسات لهذا الطلب بعد</p>
        </CardContent>
      </Card>
    );
  }

  const garmentItems = [
    { label: 'طول الثوب', value: measurements.length },
    { label: 'عرض الكتف', value: measurements.shoulder },
    { label: 'طول الكم', value: measurements.sleeve_length },
    { label: 'محيط الصدر', value: measurements.chest },
    { label: 'محيط الخصر', value: measurements.waist },
    { label: 'محيط الورك', value: measurements.hip },
    { label: 'محيط الرقبة', value: measurements.neck },
    { label: 'وسع الذراع', value: measurements.arm_width },
    { label: 'محيط المعصم', value: measurements.wrist },
    { label: 'وسع الأسفل', value: measurements.bottom_width },
  ].filter((item) => item.value !== null && item.value !== undefined && item.value > 0);

  const pantsItems = [
    { label: 'طول السروال', value: measurements.pants_length },
    { label: 'خصر السروال', value: measurements.pants_waist },
    { label: 'فخذ السروال', value: measurements.pants_thigh },
    { label: 'أسفل السروال', value: measurements.pants_bottom },
  ].filter((item) => item.value !== null && item.value !== undefined && item.value > 0);

  return (
    <Card className={className}>
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-amber-600" />
            جدول المقاسات
          </span>
          <span className="text-xs font-normal text-slate-400">الوحدة: {unit}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-5">
        {/* Garment Measurements */}
        {garmentItems.length > 0 && (
          <div>
            <h5 className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-amber-600" />
              مقاسات الثوب
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {garmentItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <span className="text-xs text-slate-500">{item.label}</span>
                  <span className="text-sm font-bold font-mono text-slate-900">
                    {item.value} <span className="text-[11px] font-normal text-slate-400">{unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pants Measurements */}
        {pantsItems.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <h5 className="text-xs font-bold text-slate-700 mb-2.5">مقاسات السروال</h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {pantsItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <span className="text-xs text-slate-500">{item.label}</span>
                  <span className="text-sm font-bold font-mono text-slate-900">
                    {item.value} <span className="text-[11px] font-normal text-slate-400">{unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Measurement notes */}
        {measurements.notes && (
          <div className="pt-2 border-t border-slate-100 text-xs">
            <span className="font-semibold text-slate-600 block mb-1">ملاحظات القياس:</span>
            <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60 text-amber-900">
              {measurements.notes}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

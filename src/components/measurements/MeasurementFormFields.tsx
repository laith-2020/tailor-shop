import type { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { Ruler, Copy, Scissors } from 'lucide-react';
import type { OrderFormData } from '@/schemas/order';
import type { Measurement } from '@/types/database';
import { Button } from '@/components/ui/Button';

interface MeasurementFormFieldsProps {
  register: UseFormRegister<OrderFormData>;
  setValue: UseFormSetValue<OrderFormData>;
  previousMeasurements?: Measurement | null;
  onCopyPrevious?: () => void;
  unit?: string;
}

export function MeasurementFormFields({
  register,
  previousMeasurements,
  onCopyPrevious,
  unit = 'سم',
}: MeasurementFormFieldsProps) {
  const garmentFields = [
    { name: 'measurements.length' as const, label: 'طول الثوب', placeholder: '150' },
    { name: 'measurements.shoulder' as const, label: 'عرض الكتف', placeholder: '45' },
    { name: 'measurements.sleeve_length' as const, label: 'طول الكم', placeholder: '60' },
    { name: 'measurements.chest' as const, label: 'محيط الصدر', placeholder: '110' },
    { name: 'measurements.waist' as const, label: 'محيط الخصر', placeholder: '105' },
    { name: 'measurements.hip' as const, label: 'محيط الورك', placeholder: '115' },
    { name: 'measurements.neck' as const, label: 'محيط الرقبة', placeholder: '42' },
    { name: 'measurements.arm_width' as const, label: 'وسع الذراع', placeholder: '21' },
    { name: 'measurements.wrist' as const, label: 'محيط المعصم (الكبك)', placeholder: '16' },
    { name: 'measurements.bottom_width' as const, label: 'وسع الذيل (الأسفل)', placeholder: '78' },
  ];

  const pantsFields = [
    { name: 'measurements.pants_length' as const, label: 'طول السروال', placeholder: '102' },
    { name: 'measurements.pants_waist' as const, label: 'خصر السروال', placeholder: '94' },
    { name: 'measurements.pants_thigh' as const, label: 'فخذ السروال', placeholder: '34' },
    { name: 'measurements.pants_bottom' as const, label: 'أسفل السروال', placeholder: '22' },
  ];

  return (
    <div className="space-y-6 pt-2">
      {/* Header and Copy Previous Measurements button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800">مقاسات التفصيل</h4>
            <p className="text-xs text-slate-500">أدخل القياسات بالسنتيمتر ({unit})</p>
          </div>
        </div>

        {previousMeasurements && onCopyPrevious && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCopyPrevious}
            className="border-amber-300 bg-white text-amber-800 hover:bg-amber-100 font-bold text-xs gap-1.5 shadow-2xs"
          >
            <Copy className="w-3.5 h-3.5 text-amber-700" />
            استخدام مقاسات آخر طلب
          </Button>
        )}
      </div>

      {/* Garment Measurements Section */}
      <div className="space-y-3">
        <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Scissors className="w-3.5 h-3.5 text-amber-600" />
          مقاسات الثوب ({unit})
        </h5>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {garmentFields.map((field) => (
            <div key={field.name} className="space-y-1">
              <label className="block text-xs font-medium text-slate-600 truncate">
                {field.label}
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  inputMode="decimal"
                  placeholder={field.placeholder}
                  className="block w-full rounded-lg border border-slate-300 bg-white py-2 px-2.5 text-center font-mono text-sm font-semibold text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  {...register(field.name, {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === '' || isNaN(v) ? null : Number(v)),
                  })}
                />
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                  {unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pants Measurements Section */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h5 className="text-xs font-bold text-slate-700">مقاسات السروال ({unit})</h5>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {pantsFields.map((field) => (
            <div key={field.name} className="space-y-1">
              <label className="block text-xs font-medium text-slate-600 truncate">
                {field.label}
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  inputMode="decimal"
                  placeholder={field.placeholder}
                  className="block w-full rounded-lg border border-slate-300 bg-white py-2 px-2.5 text-center font-mono text-sm font-semibold text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  {...register(field.name, {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === '' || isNaN(v) ? null : Number(v)),
                  })}
                />
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                  {unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Measurement notes */}
      <div className="space-y-1 pt-2">
        <label className="block text-xs font-medium text-slate-600">
          ملاحظات وتفاصيل خاصة بالمقاس
        </label>
        <textarea
          rows={2}
          placeholder="مثال: زيادة وسع الياقة 1 سم، تقصير الجيب الجانبي..."
          className="block w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          {...register('measurements.notes')}
        />
      </div>
    </div>
  );
}

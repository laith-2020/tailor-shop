import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Phone, MapPin, AlertTriangle } from 'lucide-react';
import { customerSchema, type CustomerFormData, normalizePhoneNumber } from '@/schemas/customer';
import { customerService } from '@/services/customerService';
import { useAuth } from '@/hooks/useAuth';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { Customer } from '@/types/database';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  isLoading?: boolean;
}

function CustomerFormContent({
  customer,
  onClose,
  onSubmit,
  isLoading,
}: {
  customer?: Customer | null;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  isLoading: boolean;
}) {
  const { shop } = useAuth();
  const shopId = shop?.id || '00000000-0000-0000-0000-000000000001';

  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      full_name: customer?.full_name || '',
      phone: customer?.phone || '',
      alternative_phone: customer?.alternative_phone || '',
      address: customer?.address || '',
      notes: customer?.notes || '',
    },
  });

  const watchedPhone = useWatch({ control, name: 'phone' });

  // Debounced duplicate phone check
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!watchedPhone || watchedPhone.length < 8) {
        setDuplicateWarning(null);
        return;
      }

      const normalized = normalizePhoneNumber(watchedPhone);
      if (normalized.length >= 8) {
        const existing = await customerService.checkPhoneDuplicate(
          normalized,
          shopId,
          customer?.id
        );
        if (existing) {
          setDuplicateWarning(
            `تنبيه: يوجد عميل مسجل مسبقاً بنفس رقم الهاتف: "${existing.full_name}"`
          );
        } else {
          setDuplicateWarning(null);
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [watchedPhone, shopId, customer?.id]);

  const handleFormSubmit = async (data: CustomerFormData) => {
    try {
      setFormError(null);
      await onSubmit({
        ...data,
        phone: normalizePhoneNumber(data.phone),
        alternative_phone: data.alternative_phone
          ? normalizePhoneNumber(data.alternative_phone)
          : undefined,
      });
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ العميل';
      setFormError(message);
    }
  };

  return (
    <div>
      {formError && (
        <Alert variant="error" className="mb-4">
          {formError}
        </Alert>
      )}

      {duplicateWarning && (
        <Alert variant="warning" className="mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{duplicateWarning}</span>
          </div>
        </Alert>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 text-right">
        <Input
          label="اسم العميل الكامل"
          placeholder="مثال: أحمد محمود القيسي"
          required
          icon={<User className="w-4 h-4" />}
          error={errors.full_name?.message}
          {...register('full_name')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="رقم الهاتف الأساسي"
            placeholder="0791234567"
            required
            type="tel"
            dir="ltr"
            className="text-right"
            icon={<Phone className="w-4 h-4" />}
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="رقم هاتف إضافي (اختياري)"
            placeholder="0781234567"
            type="tel"
            dir="ltr"
            className="text-right"
            icon={<Phone className="w-4 h-4" />}
            error={errors.alternative_phone?.message}
            {...register('alternative_phone')}
          />
        </div>

        <Input
          label="العنوان / الحي"
          placeholder="مثال: عمان - الجبيهة"
          icon={<MapPin className="w-4 h-4" />}
          error={errors.address?.message}
          {...register('address')}
        />

        <div className="w-full text-right space-y-1.5">
          <label htmlFor="customer-notes" className="block text-sm font-medium text-slate-700">
            ملاحظات خاصة بالعميل
          </label>
          <div className="relative rounded-lg shadow-sm">
            <textarea
              id="customer-notes"
              rows={3}
              placeholder="مثال: يفضل أقمشة قطنية، ياقة كلاسيك، خياطة مزدوجة..."
              className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-slate-900 text-sm placeholder:text-slate-400 transition-colors focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              {...register('notes')}
            />
          </div>
          {errors.notes?.message && (
            <p className="text-xs text-rose-600">{errors.notes.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {customer ? 'حفظ التعديلات' : 'إضافة العميل'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function CustomerFormModal({
  isOpen,
  onClose,
  customer,
  onSubmit,
  isLoading = false,
}: CustomerFormModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
      description={customer ? 'تحديث معلومات الاتصال والعنوان' : 'تسجيل عميل جديد في النظام'}
      className="max-w-md"
    >
      <CustomerFormContent
        key={customer?.id || 'new'}
        customer={customer}
        onClose={onClose}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </Modal>
  );
}

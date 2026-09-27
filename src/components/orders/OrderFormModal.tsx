import { useState, useEffect, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar,
  DollarSign,
  User,
  PlusCircle,
  Scissors,
  CheckCircle2,
} from 'lucide-react';
import { orderSchema, garmentTypesList, type OrderFormData } from '@/schemas/order';
import { useCustomers, useCreateCustomer } from '@/hooks/useCustomers';
import { useLastCustomerMeasurements } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { MeasurementFormFields } from '@/components/measurements/MeasurementFormFields';
import { CustomerFormModal } from '@/components/customers/CustomerFormModal';
import type { Order, Customer } from '@/types/database';
import type { CustomerFormData } from '@/schemas/customer';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order | null;
  initialCustomerId?: string;
  initialCopyLast?: boolean;
  onSubmit: (data: OrderFormData) => Promise<Order>;
  onOrderSaved?: (savedOrder: Order) => void;
  isLoading?: boolean;
}

function OrderFormContent({
  order,
  initialCustomerId,
  initialCopyLast,
  onClose,
  onSubmit,
  onOrderSaved,
  isLoading,
}: {
  order?: Order | null;
  initialCustomerId?: string;
  initialCopyLast?: boolean;
  onClose: () => void;
  onSubmit: (data: OrderFormData) => Promise<Order>;
  onOrderSaved?: (savedOrder: Order) => void;
  isLoading: boolean;
}) {
  const { shop } = useAuth();
  const currency = shop?.currency === 'JOD' ? 'د.أ' : (shop?.currency || 'د.أ');
  const unit = shop?.measurement_unit || 'سم';

  const [formError, setFormError] = useState<string | null>(null);
  const [quickCustomerModalOpen, setQuickCustomerModalOpen] = useState(false);
  const [copySuccessToast, setCopySuccessToast] = useState(false);

  // Fetch active customers for the dropdown selector
  const { data: customersData } = useCustomers({ limit: 500, includeArchived: false });
  const createCustomerMutation = useCreateCustomer();

  const [dates] = useState(() => {
    const t = new Date();
    const todayStr = t.toISOString().split('T')[0];
    const nextWeekDate = new Date(t.getTime() + 7 * 24 * 3600 * 1000);
    const nextWeekStr = nextWeekDate.toISOString().split('T')[0];
    return { today: todayStr, nextWeek: nextWeekStr };
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: order
      ? {
          customer_id: order.customer_id,
          order_date: order.order_date,
          expected_delivery_date: order.expected_delivery_date,
          actual_delivery_date: order.actual_delivery_date || '',
          garment_type: order.garment_type,
          fabric: order.fabric || '',
          color: order.color || '',
          price: order.price,
          paid_amount: order.paid_amount,
          status: order.status,
          notes: order.notes || '',
          measurements: order.measurements ? {
            length: order.measurements.length,
            shoulder: order.measurements.shoulder,
            sleeve_length: order.measurements.sleeve_length,
            chest: order.measurements.chest,
            waist: order.measurements.waist,
            hip: order.measurements.hip,
            neck: order.measurements.neck,
            arm_width: order.measurements.arm_width,
            wrist: order.measurements.wrist,
            bottom_width: order.measurements.bottom_width,
            pants_length: order.measurements.pants_length,
            pants_waist: order.measurements.pants_waist,
            pants_thigh: order.measurements.pants_thigh,
            pants_bottom: order.measurements.pants_bottom,
            notes: order.measurements.notes || '',
          } : {},
        }
      : {
          customer_id: initialCustomerId || '',
          order_date: dates.today,
          expected_delivery_date: dates.nextWeek,
          garment_type: garmentTypesList[0],
          fabric: '',
          color: '',
          price: 45,
          paid_amount: 0,
          status: 'new',
          notes: '',
          measurements: {},
        },
  });

  const selectedCustomerId = useWatch({ control, name: 'customer_id' });
  const watchedPrice = useWatch({ control, name: 'price' }) || 0;
  const watchedPaid = useWatch({ control, name: 'paid_amount' }) || 0;
  const remainingAmount = Math.max(0, watchedPrice - watchedPaid);

  // Fetch previous measurements of the selected customer
  const { data: previousMeasurements } = useLastCustomerMeasurements(selectedCustomerId);

  // Copy previous measurements handler
  const handleCopyPrevious = useCallback(() => {
    if (!previousMeasurements) return;
    setValue('measurements.length', previousMeasurements.length ?? null);
    setValue('measurements.shoulder', previousMeasurements.shoulder ?? null);
    setValue('measurements.sleeve_length', previousMeasurements.sleeve_length ?? null);
    setValue('measurements.chest', previousMeasurements.chest ?? null);
    setValue('measurements.waist', previousMeasurements.waist ?? null);
    setValue('measurements.hip', previousMeasurements.hip ?? null);
    setValue('measurements.neck', previousMeasurements.neck ?? null);
    setValue('measurements.arm_width', previousMeasurements.arm_width ?? null);
    setValue('measurements.wrist', previousMeasurements.wrist ?? null);
    setValue('measurements.bottom_width', previousMeasurements.bottom_width ?? null);
    setValue('measurements.pants_length', previousMeasurements.pants_length ?? null);
    setValue('measurements.pants_waist', previousMeasurements.pants_waist ?? null);
    setValue('measurements.pants_thigh', previousMeasurements.pants_thigh ?? null);
    setValue('measurements.pants_bottom', previousMeasurements.pants_bottom ?? null);
    setValue('measurements.notes', previousMeasurements.notes || '');

    setCopySuccessToast(true);
    setTimeout(() => setCopySuccessToast(false), 3000);
  }, [previousMeasurements, setValue]);

  useEffect(() => {
    if (initialCopyLast && previousMeasurements) {
      const timer = setTimeout(() => {
        handleCopyPrevious();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [initialCopyLast, previousMeasurements, handleCopyPrevious]);

  // Quick Customer Creation inline
  const handleQuickCustomerSubmit = async (custData: CustomerFormData) => {
    const newCust = await createCustomerMutation.mutateAsync(custData);
    setValue('customer_id', newCust.id);
  };

  const handleFormSubmit = async (data: OrderFormData) => {
    try {
      setFormError(null);
      const saved = await onSubmit(data);
      if (onOrderSaved) {
        onOrderSaved(saved);
      }
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ الطلب';
      setFormError(message);
    }
  };

  return (
    <>
      {formError && (
        <Alert variant="error" className="mb-4">
          {formError}
        </Alert>
      )}

      {copySuccessToast && (
        <Alert variant="success" className="mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>تم نسخ مقاسات آخر طلب بنجاح، يمكنك تعديلها بحرية قبل الحفظ.</span>
          </div>
        </Alert>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 text-right">
        {/* STEP 1: CUSTOMER SELECTION */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-600" />
              الزبون / صاحب الطلب <span className="text-rose-500">*</span>
            </label>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuickCustomerModalOpen(true)}
              className="text-xs text-amber-700 bg-amber-50/50 hover:bg-amber-100 border-amber-200"
            >
              <PlusCircle className="w-3.5 h-3.5 ml-1" />
              عميل جديد
            </Button>
          </div>

          <div className="relative">
            <select
              className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              {...register('customer_id')}
            >
              <option value="">-- اختر العميل من القائمة --</option>
              {customersData?.data.map((c: Customer) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.phone})
                </option>
              ))}
            </select>
          </div>
          {errors.customer_id?.message && (
            <p className="text-xs text-rose-600">{errors.customer_id.message}</p>
          )}
        </div>

        {/* STEP 2: GARMENT & FABRIC INFO */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Scissors className="w-4 h-4 text-amber-600" />
            تفاصيل الثوب والقماش
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                نوع الثوب <span className="text-rose-500">*</span>
              </label>
              <select
                className="block w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                {...register('garment_type')}
              >
                {garmentTypesList.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.garment_type?.message && (
                <p className="text-xs text-rose-600 mt-1">{errors.garment_type.message}</p>
              )}
            </div>

            <Input
              label="نوع القماش"
              placeholder="مثال: قطن ياباني نخب أول"
              error={errors.fabric?.message}
              {...register('fabric')}
            />

            <Input
              label="اللون"
              placeholder="مثال: أبيض ناصع / بيج"
              error={errors.color?.message}
              {...register('color')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="تاريخ الطلب"
              type="date"
              required
              icon={<Calendar className="w-4 h-4" />}
              error={errors.order_date?.message}
              {...register('order_date')}
            />

            <Input
              label="تاريخ التسليم المتوقع"
              type="date"
              required
              icon={<Calendar className="w-4 h-4" />}
              error={errors.expected_delivery_date?.message}
              {...register('expected_delivery_date')}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                حالة الطلب
              </label>
              <select
                className="block w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                {...register('status')}
              >
                <option value="new">جديد</option>
                <option value="in_progress">قيد التفصيل</option>
                <option value="ready">جاهز</option>
                <option value="delivered">تم التسليم</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>
          </div>
        </div>

        {/* STEP 3: FINANCIALS & PAYMENTS */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            الحساب والدفعات المالية
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label={`السعر الإجمالي (${currency})`}
              type="number"
              step="0.5"
              min="0"
              required
              error={errors.price?.message}
              {...register('price')}
            />

            <Input
              label={`المبلغ المدفوع مقدماً (${currency})`}
              type="number"
              step="0.5"
              min="0"
              required
              error={errors.paid_amount?.message}
              {...register('paid_amount')}
            />

            {/* Automatic Remaining Calculation Box */}
            <div className="space-y-1">
              <span className="block text-xs font-medium text-slate-700">المبلغ المتبقي</span>
              <div
                className={`h-11 px-4 rounded-lg border flex items-center justify-between font-mono font-bold text-base ${
                  remainingAmount > 0
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
              >
                <span>{remainingAmount} {currency}</span>
                <span className="text-xs font-normal">
                  {remainingAmount > 0 ? 'متبقي عند الاستلام' : 'خالص بالكامل'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 4: MEASUREMENTS */}
        <MeasurementFormFields
          register={register}
          setValue={setValue}
          control={control}
          previousMeasurements={previousMeasurements}
          onCopyPrevious={handleCopyPrevious}
          unit={unit}
        />

        {/* General Order Notes */}
        <div className="space-y-1 pt-2">
          <label className="block text-xs font-medium text-slate-700">
            ملاحظات عامة على الطلب
          </label>
          <textarea
            rows={2}
            placeholder="مثال: الزبون مستعجل على الطلب، يرجى الاتصال قبل الحضور..."
            className="block w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            {...register('notes')}
          />
        </div>

        {/* Modal action buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
            {order ? 'حفظ التعديلات' : 'تأكيد وحفظ الطلب'}
          </Button>
        </div>
      </form>

      {/* Inline Quick Customer Creation Modal */}
      <CustomerFormModal
        isOpen={quickCustomerModalOpen}
        onClose={() => setQuickCustomerModalOpen(false)}
        onSubmit={handleQuickCustomerSubmit}
        isLoading={createCustomerMutation.isPending}
      />
    </>
  );
}

export function OrderFormModal({
  isOpen,
  onClose,
  order,
  initialCustomerId,
  initialCopyLast,
  onSubmit,
  onOrderSaved,
  isLoading = false,
}: OrderFormModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={order ? `تعديل الطلب (${order.order_number})` : 'إنشاء طلب تفصيل جديد'}
      description={order ? 'تحديث بيانات الطلب والمقاسات' : 'تسجيل تفاصيل الثوب، المواعيد، الحساب، والمقاسات'}
      className="max-w-3xl"
    >
      <OrderFormContent
        key={order?.id || initialCustomerId || 'new-order'}
        order={order}
        initialCustomerId={initialCustomerId}
        initialCopyLast={initialCopyLast}
        onClose={onClose}
        onSubmit={onSubmit}
        onOrderSaved={onOrderSaved}
        isLoading={isLoading}
      />
    </Modal>
  );
}

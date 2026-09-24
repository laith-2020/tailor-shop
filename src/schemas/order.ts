import { z } from 'zod';

export const garmentTypesList = [
  'ثوب كويتي',
  'ثوب كويتي قلاب',
  'ثوب سعودي كلاسيك',
  'دشداشة عمانية',
  'ثوب إماراتي',
  'ثوب قطري',
  'سديري مطرز',
  'سروال قطني',
  'ثوب شتوي صوف',
  'أخرى',
] as const;

export const measurementSchema = z.object({
  length: z.number().nullable().optional(),
  shoulder: z.number().nullable().optional(),
  sleeve_length: z.number().nullable().optional(),
  chest: z.number().nullable().optional(),
  waist: z.number().nullable().optional(),
  hip: z.number().nullable().optional(),
  neck: z.number().nullable().optional(),
  arm_width: z.number().nullable().optional(),
  wrist: z.number().nullable().optional(),
  bottom_width: z.number().nullable().optional(),
  pants_length: z.number().nullable().optional(),
  pants_waist: z.number().nullable().optional(),
  pants_thigh: z.number().nullable().optional(),
  pants_bottom: z.number().nullable().optional(),
  notes: z.string().optional().or(z.literal('')),
});

export type MeasurementFormData = z.infer<typeof measurementSchema>;

export const orderSchema = z
  .object({
    customer_id: z.string().min(1, 'يرجى اختيار العميل أولاً'),
    order_date: z.string().min(1, 'تاريخ الطلب مطلوب'),
    expected_delivery_date: z.string().min(1, 'تاريخ التسليم المتوقع مطلوب'),
    actual_delivery_date: z.string().optional().or(z.literal('')),
    garment_type: z.string().min(1, 'نوع الثوب مطلوب'),
    fabric: z.string().optional().or(z.literal('')),
    color: z.string().optional().or(z.literal('')),
    price: z.coerce.number().min(0, 'السعر يجب أن يكون 0 أو أكثر'),
    paid_amount: z.coerce.number().min(0, 'المبلغ المدفوع يجب أن يكون 0 أو أكثر'),
    status: z.enum(['new', 'in_progress', 'ready', 'delivered', 'cancelled'], {
      errorMap: () => ({ message: 'حالة الطلب غير صالحة' }),
    }),
    notes: z.string().optional().or(z.literal('')),
    measurements: measurementSchema.optional(),
  })
  .refine((data) => data.paid_amount <= data.price, {
    message: 'المبلغ المدفوع لا يمكن أن يكون أكبر من السعر الإجمالي',
    path: ['paid_amount'],
  });

export type OrderFormData = z.infer<typeof orderSchema>;

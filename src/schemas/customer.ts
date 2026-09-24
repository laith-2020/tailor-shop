import { z } from 'zod';

// Normalize Arabic/Eastern numerals and strip spaces/dashes
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  const easternDigits: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  };
  
  let normalized = phone.replace(/[٠-٩]/g, (w) => easternDigits[w] || w);
  // Remove non-numeric characters except leading plus if any
  normalized = normalized.replace(/[\s\-()]/g, '');
  return normalized;
}

export const customerSchema = z.object({
  full_name: z
    .string()
    .min(1, 'اسم العميل مطلوب')
    .min(3, 'الاسم يجب أن يحتوي على 3 أحرف على الأقل')
    .max(100, 'الاسم طويل جداً'),
  phone: z
    .string()
    .min(1, 'رقم الهاتف مطلوب')
    .refine((val) => {
      const cleaned = normalizePhoneNumber(val);
      // Valid phone check (at least 8 digits)
      return /^\+?[0-9]{8,15}$/.test(cleaned);
    }, 'يرجى إدخال رقم هاتف صحيح (مثال: 0791234567)'),
  alternative_phone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      const cleaned = normalizePhoneNumber(val);
      return /^\+?[0-9]{8,15}$/.test(cleaned);
    }, 'صيغة رقم الهاتف الإضافي غير صحيحة'),
  address: z
    .string()
    .max(200, 'العنوان يجب ألا يتجاوز 200 حرف')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(1000, 'الملاحظات طويلة جداً')
    .optional()
    .or(z.literal('')),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

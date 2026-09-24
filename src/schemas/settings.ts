import { z } from 'zod';

export const settingsSchema = z.object({
  name: z.string().min(2, 'اسم المحل مطلوب (حرفين على الأقل)').max(100, 'الاسم طويل جداً'),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  currency: z.string().min(1, 'العملة مطلوبة'),
  measurement_unit: z.string().min(1, 'وحدة القياس مطلوبة'),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

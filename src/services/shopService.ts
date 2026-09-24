import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Shop } from '@/types/database';

export interface UpdateShopData {
  name: string;
  phone?: string | null;
  address?: string | null;
  currency: string;
  measurement_unit: string;
}

const DEMO_SHOP_KEY = 'tailor_demo_shop';

export const shopService = {
  async updateShop(shopId: string, data: UpdateShopData): Promise<Shop> {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(DEMO_SHOP_KEY);
      const current = stored ? JSON.parse(stored) : {
        id: shopId,
        name: 'مخيطة حضرموت',
        phone: '0791234567',
        address: 'عمان - شارع وصفي التل',
        currency: 'JOD',
        measurement_unit: 'سم',
        created_at: new Date().toISOString(),
      };

      const updated: Shop = {
        ...current,
        name: data.name.trim(),
        phone: data.phone?.trim() || null,
        address: data.address?.trim() || null,
        currency: data.currency,
        measurement_unit: data.measurement_unit,
        updated_at: new Date().toISOString(),
      };

      localStorage.setItem(DEMO_SHOP_KEY, JSON.stringify(updated));
      return updated;
    }

    const { data: updated, error } = await supabase
      .from('shops')
      .update({
        name: data.name.trim(),
        phone: data.phone?.trim() || null,
        address: data.address?.trim() || null,
        currency: data.currency,
        measurement_unit: data.measurement_unit,
      })
      .eq('id', shopId)
      .select()
      .single();

    if (error) {
      console.error('Error updating shop:', error);
      throw new Error(error.message || 'فشل تحديث إعدادات المتجر');
    }

    return updated as Shop;
  },
};

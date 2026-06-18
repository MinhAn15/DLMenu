'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function updateShopInfo(shopId: string, updates: {
  name?: string;
  description?: string;
  phone?: string;
  address?: string;
}) {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return { success: true };
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('shops')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', shopId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateThemeConfig(shopId: string, themeConfig: { primary_color: string; font: string }) {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return { success: true };
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('shops')
    .update({ theme_config: themeConfig, updated_at: new Date().toISOString() })
    .eq('id', shopId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ========== PROMOTIONS ==========

export async function getPromotions(shopId: string) {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    const { MOCK_PROMOTIONS } = await import('@/lib/mockData');
    return { success: true, data: MOCK_PROMOTIONS };
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false });
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function createPromotion(shopId: string, promo: {
  name: string;
  description?: string;
  type: string;
  discount_percent?: number;
  discount_amount?: number;
  starts_at: string;
  ends_at: string;
  max_uses?: number;
}) {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return { success: true, data: { id: `promo-${Date.now()}`, shop_id: shopId, ...promo, applicable_items: [], applicable_ranks: [], current_uses: 0, max_uses_per_user: null, is_active: true, created_at: new Date().toISOString() } };
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('promotions')
    .insert({
      shop_id: shopId,
      name: promo.name,
      description: promo.description || null,
      type: promo.type,
      discount_percent: promo.discount_percent || null,
      discount_amount: promo.discount_amount || null,
      starts_at: promo.starts_at,
      ends_at: promo.ends_at,
      max_uses: promo.max_uses || null,
    })
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function deletePromotion(promoId: string) {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return { success: true };
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('promotions').delete().eq('id', promoId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function togglePromotionActive(promoId: string, isActive: boolean) {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return { success: true };
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('promotions').update({ is_active: isActive }).eq('id', promoId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getAdminShops() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from('shops').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data;
}

export async function getAdminShopById(shopId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from('shops').select('*').eq('id', shopId).single();
  if (error) { console.error(error); return null; }
  return data;
}

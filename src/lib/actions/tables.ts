'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function getTables(shopId: string) {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    const { MOCK_TABLES } = await import('@/lib/mockData');
    return { success: true, data: MOCK_TABLES };
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('shop_tables')
    .select('*')
    .eq('shop_id', shopId)
    .order('table_number');
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

function generateShortCode(shopSlug: string, tableNum: number): string {
  const prefix = shopSlug.split('-').map(w => w[0]?.toUpperCase() || '').join('').slice(0, 3);
  return `${prefix}-${String(tableNum).padStart(2, '0')}`;
}

export async function createTable(shopId: string, shopSlug: string, tableNumber: number) {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return { success: true, data: { id: `t-${Date.now()}`, shop_id: shopId, table_number: tableNumber, short_code: generateShortCode(shopSlug, tableNumber), qr_url: null, is_active: true, created_at: new Date().toISOString() } };
  }
  const supabase = await createServerSupabaseClient();
  const shortCode = generateShortCode(shopSlug, tableNumber);
  const { data, error } = await supabase
    .from('shop_tables')
    .insert({ shop_id: shopId, table_number: tableNumber, short_code: shortCode })
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function deleteTable(tableId: string) {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return { success: true };
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('shop_tables').delete().eq('id', tableId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function toggleTableActive(tableId: string, isActive: boolean) {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return { success: true };
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('shop_tables').update({ is_active: isActive }).eq('id', tableId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

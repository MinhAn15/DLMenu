'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

// ========== CATEGORIES ==========

export async function getCategories(shopId: string) {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    const { MOCK_CATEGORIES } = await import('@/lib/mockData');
    return { success: true, data: MOCK_CATEGORIES };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('shop_id', shopId)
    .order('sort_order');

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function createCategory(shopId: string, name: string, description?: string) {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return { success: true, data: { id: `cat-${Date.now()}`, shop_id: shopId, name, description: description || null, sort_order: 0, is_active: true, created_at: new Date().toISOString() } };
  }

  const supabase = await createServerSupabaseClient();

  // Get next sort_order
  const { data: existing } = await supabase
    .from('menu_categories')
    .select('sort_order')
    .eq('shop_id', shopId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextSort = existing && existing.length > 0 ? existing[0].sort_order + 1 : 1;

  const { data, error } = await supabase
    .from('menu_categories')
    .insert({ shop_id: shopId, name, description: description || null, sort_order: nextSort })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function updateCategory(categoryId: string, updates: { name?: string; description?: string; is_active?: boolean }) {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return { success: true };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('menu_categories')
    .update(updates)
    .eq('id', categoryId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteCategory(categoryId: string) {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return { success: true };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('menu_categories')
    .delete()
    .eq('id', categoryId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ========== MENU ITEMS ==========

export async function getMenuItems(shopId: string) {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    const { MOCK_ITEMS } = await import('@/lib/mockData');
    return { success: true, data: MOCK_ITEMS };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('shop_id', shopId)
    .order('sort_order');

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function createMenuItem(shopId: string, item: {
  name: string;
  category_id: string | null;
  price: number;
  description?: string;
  image_url?: string;
  is_available?: boolean;
  is_featured?: boolean;
  tags?: string[];
}) {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return { success: true, data: { id: `item-${Date.now()}`, shop_id: shopId, ...item, sort_order: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } };
  }

  const supabase = await createServerSupabaseClient();

  const { data: existing } = await supabase
    .from('menu_items')
    .select('sort_order')
    .eq('shop_id', shopId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextSort = existing && existing.length > 0 ? existing[0].sort_order + 1 : 1;

  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      shop_id: shopId,
      category_id: item.category_id,
      name: item.name,
      price: item.price,
      description: item.description || null,
      image_url: item.image_url || null,
      is_available: item.is_available ?? true,
      is_featured: item.is_featured ?? false,
      tags: item.tags || [],
      sort_order: nextSort,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function updateMenuItem(itemId: string, updates: {
  name?: string;
  category_id?: string | null;
  price?: number;
  description?: string | null;
  image_url?: string | null;
  is_available?: boolean;
  is_featured?: boolean;
  tags?: string[];
}) {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return { success: true };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('menu_items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', itemId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteMenuItem(itemId: string) {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return { success: true };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', itemId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getAdminMenuCategories(shopId?: string) {
  const supabase = await createServerSupabaseClient();
  let query = supabase.from('menu_categories').select('*').order('sort_order', { ascending: true });
  if (shopId && shopId !== 'all') query = query.eq('shop_id', shopId);
  const { data, error } = await query;
  if (error) { console.error(error); return []; }
  return data;
}

export async function getAdminMenuItems(shopId?: string) {
  const supabase = await createServerSupabaseClient();
  let query = supabase.from('menu_items').select('*').order('sort_order', { ascending: true });
  if (shopId && shopId !== 'all') {
    const { data: cats } = await supabase.from('menu_categories').select('id').eq('shop_id', shopId);
    if (cats && cats.length > 0) {
      query = query.in('category_id', cats.map(c => c.id));
    } else {
      return [];
    }
  }
  const { data, error } = await query;
  if (error) { console.error(error); return []; }
  return data;
}

'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ShopTable } from '@/lib/types/database';

/**
 * Server action: fetch all shop_tables across shops for platform admin.
 * RLS gate via migration 007 (`shop_tables_admin_all`) — non-admin returns [].
 */
export async function getAdminTables(): Promise<ShopTable[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('shop_tables')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('getAdminTables error:', error); return []; }
  return (data || []) as ShopTable[];
}

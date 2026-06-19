'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types/database';

/**
 * Server action: fetch all profiles for platform admin.
 * RLS gate via migration 007 (`profiles_admin_all`) — non-admin returns [].
 * Returns id, phone, display_name, role, created_at fields (no email or other PII).
 */
export async function getAdminUsers(): Promise<Profile[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, phone, display_name, role, created_at, avatar_url, last_login_at')
    .order('created_at', { ascending: false });
  if (error) { console.error('getAdminUsers error:', error); return []; }
  return (data || []) as Profile[];
}

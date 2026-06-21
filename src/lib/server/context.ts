import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function createTRPCContext() {
  const supabase = await createServerSupabaseClient();
  return { supabase };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

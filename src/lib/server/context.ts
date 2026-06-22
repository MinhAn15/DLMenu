import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function createTRPCContext(opts?: { req?: Request }) {
  const supabase = await createServerSupabaseClient();
  return { 
    supabase,
    headers: opts?.req?.headers || null,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

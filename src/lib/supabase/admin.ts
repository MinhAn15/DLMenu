import { createClient } from '@supabase/supabase-js';

// WARNING: This client bypasses RLS and should ONLY be used in server-side API routes.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // This must be a secure backend environment variable
);

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function globalTeardown() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase URL or Service Role Key in .env.local');
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('Tearing down test data...');

  // Delete the test shop
  // Note: Due to ON DELETE CASCADE, this will also delete shop_tables, menu_categories, menu_items, orders, etc.
  await supabase.from('shops').delete().eq('slug', 'test-shop-pw');

  console.log('Test data cleaned up successfully.');
}

export default globalTeardown;

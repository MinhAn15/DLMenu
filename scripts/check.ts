import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function check() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  console.log('Fetching shop...');
  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('*, loyalty_config:loyalty_configs(*)')
    .eq('slug', 'test-shop-pw')
    .eq('status', 'active')
    .single();
  
  if (shopError) console.error('Shop Error:', shopError);
  console.log('Shop:', shop?.id);

  console.log('Fetching table...');
  if (shop) {
    const { data: table, error: tableErr } = await supabase
      .from('shop_tables')
      .select('*')
      .eq('shop_id', shop.id)
      .eq('table_number', '1')
      .single();
    if (tableErr) console.error('Table Error:', tableErr);
    console.log('Table:', table?.id);
  }
}

check();

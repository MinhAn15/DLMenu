import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function globalSetup() {
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

  console.log('Seeding test data...');

  // 1. Create Superadmin
  const superadminEmail = 'admin@dlmenu.com';
  const { data: superadminUser, error: superadminErr } = await supabase.auth.admin.createUser({
    email: superadminEmail,
    password: 'dlmenu2024',
    email_confirm: true,
    phone: `+84${Math.floor(100000000 + Math.random() * 900000000)}`,
  });

  let superadminId = superadminUser?.user?.id;
  if (!superadminId) {
    const { data: usersData } = await supabase.auth.admin.listUsers();
    superadminId = usersData.users.find((u: any) => u.email === superadminEmail)?.id;
  }
  if (superadminId) {
    await supabase.from('profiles').update({ role: 'super_admin' }).eq('id', superadminId);
  }

  // 2. Create Shop Admin
  const testEmail = 'admin@shop1.com';
  const { data: adminUser, error: adminErr } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: 'password123',
    email_confirm: true,
    phone: `+84${Math.floor(100000000 + Math.random() * 900000000)}`,
  });

  let ownerId = adminUser?.user?.id;
  if (!ownerId) {
    const { data: usersData } = await supabase.auth.admin.listUsers();
    ownerId = usersData.users.find((u: any) => u.email === testEmail)?.id;
  }

  if (!ownerId) {
    throw new Error('Could not create or find Test Admin User. ' + adminErr?.message);
  }

  // Update profile role
  await supabase.from('profiles').update({ role: 'shop_owner' }).eq('id', ownerId);

  // 3. Insert Test Shop
  const { data: shop } = await supabase
    .from('shops')
    .upsert({
      owner_id: ownerId,
      name: 'Cà phê Mai',
      slug: 'ca-phe-mai',
      status: 'active',
      cover_image_url: '/images/shop_cover.png',
      loyalty_config: {
        pointsPerVND: 0.0001,
        tiers: [
          { name: 'Đồng', minPoints: 0, color: '#CD7F32' },
          { name: 'Bạc', minPoints: 100, color: '#C0C0C0' },
          { name: 'Vàng', minPoints: 500, color: '#FFD700' }
        ]
      }
    }, { onConflict: 'slug' })
    .select('id')
    .single();

  if (!shop) throw new Error('Failed to create test shop');

  // 3. Insert Test Table
  await supabase.from('shop_tables').upsert({
    shop_id: shop.id,
    table_number: '1',
    status: 'available'
  }, { onConflict: 'shop_id,table_number' });

  // 4. Insert Test Category
  const { data: category } = await supabase.from('menu_categories').insert({
    shop_id: shop.id,
    name: 'Cà phê',
  }).select('id').single();

  // 5. Insert Test Menu Items
  if (category) {
    await supabase.from('menu_items').insert([
      {
        category_id: category.id,
        name: 'Cà phê Đen Đá',
        price: 20000,
        is_available: true,
        image_url: '/images/coffee_den_da.webp'
      },
      {
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', // Static UUID
        shop_id: shop.id,
        category_id: '8b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        name: 'Cà phê Sữa Đá',
        price: 25000,
        image_url: '/images/coffee_sua_da.webp'
      },
      {
        id: 'ab1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', // Static UUID
        shop_id: shop.id,
        category_id: '8b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        name: 'Trà Đào Cam Sả',
        price: 35000,
        image_url: '/images/tea_dao_cam_sa.webp'
      }
    ]);
  }

  console.log('Test data seeded successfully.');
}

export default globalSetup;

if (require.main === module) {
  globalSetup()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const now = new Date().toISOString();

// Hardcoded Mock Data from src/lib/mockData.ts
const MOCK_SHOP = {
  name: 'Quán Cà Phê Mai (Mock)',
  slug: 'quan-cafe-mai',
  description: 'Cà phê ngon, view đẹp tại Di Linh',
  logo_url: null,
  cover_image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
  phone: '0901234567',
  address: '123 Đường Hùng Vương, TT. Di Linh',
  theme_config: { primary_color: '#6B4226', font: 'Inter' },
  loyalty_config: {
    points_formula: { type: 'per_amount', amount_per_point: 10000 },
    ranks: [
      { name: 'Thành viên', min_points: 0, discount_percent: 0 },
      { name: 'Bạc', min_points: 100, discount_percent: 3 },
      { name: 'Vàng', min_points: 500, discount_percent: 5 },
      { name: 'Kim cương', min_points: 2000, discount_percent: 10 },
    ],
    bonus_rules: [],
    discount_stacking: 'take_highest',
  },
  status: 'active',
};

const MOCK_CATEGORIES = [
  { name: 'Cà phê', sort_order: 1 },
  { name: 'Trà & Nước ép', sort_order: 2 },
  { name: 'Bánh ngọt', sort_order: 3 },
];

const MOCK_ITEMS = [
  { name: 'Cà phê Đen Đá', description: 'Cà phê nguyên chất', price: 20000, is_available: true, sort_order: 1, categoryIndex: 0 },
  { name: 'Cà phê Sữa Đá', description: 'Sữa đặc Ngôi sao phương Nam', price: 25000, is_available: true, sort_order: 2, categoryIndex: 0 },
  { name: 'Trà Đào Cam Sả', description: 'Trà thanh mát giải nhiệt', price: 35000, is_available: true, sort_order: 1, categoryIndex: 1 },
  { name: 'Bánh Tiramisu', description: 'Bánh ngọt chuẩn Ý', price: 45000, is_available: true, sort_order: 1, categoryIndex: 2 },
];

const MOCK_TABLES = [
  { table_number: 1, status: 'available' },
  { table_number: 2, status: 'available' },
];

async function seed() {
  console.log('Seeding Supabase DB...');
  try {
    // 1. Get an existing user or create one
    console.log('Fetching existing users...');
    const { data: listUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    let ownerId;
    if (!listError && listUsers.users && listUsers.users.length > 0) {
      ownerId = listUsers.users[0].id;
      console.log('Found existing user:', ownerId);
    } else {
      console.log('No users found. Creating Admin User...');
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: 'admin' + Date.now() + '@quanmai.com',
        password: 'password123',
        email_confirm: true,
        user_metadata: { display_name: 'Admin Quán Mai' }
      });
      if (userError) throw userError;
      ownerId = userData.user.id;
      // Wait for trigger to create profile
      await new Promise(r => setTimeout(r, 1000));
    }

    console.log('Owner ID:', ownerId);

    // Ensure Profile has shop_owner role
    await supabase.from('profiles').update({ role: 'shop_owner' }).eq('id', ownerId);

    // 2. Insert Shop
    console.log('Inserting Shop...');
    const { data: shopData, error: shopError } = await supabase
      .from('shops')
      .upsert({ ...MOCK_SHOP, owner_id: ownerId }, { onConflict: 'slug' })
      .select('id')
      .single();

    if (shopError) throw shopError;
    const shopId = shopData.id;
    console.log('Shop ID:', shopId);

    // 3. Insert Categories
    console.log('Inserting Categories...');
    const catIds = [];
    for (const cat of MOCK_CATEGORIES) {
      const { data, error } = await supabase
        .from('menu_categories')
        .insert({ ...cat, shop_id: shopId })
        .select('id')
        .single();
      if (error) {
        console.log('Category Error:', error);
      } else {
        catIds.push(data.id);
      }
    }

    // 4. Insert Items
    console.log('Inserting Items...');
    for (const item of MOCK_ITEMS) {
      const { categoryIndex, ...itemData } = item;
      const categoryId = catIds[categoryIndex];
      const { error } = await supabase
        .from('menu_items')
        .insert({ ...itemData, category_id: categoryId });
      if (error) console.log('Item Error:', error);
    }

    // 5. Insert Tables
    console.log('Inserting Tables...');
    for (const table of MOCK_TABLES) {
      const { error } = await supabase
        .from('shop_tables')
        .insert({ ...table, shop_id: shopId });
      if (error && !error.message.includes('duplicate key')) console.log('Table Error:', error);
    }

    console.log('✅ Seeding completed successfully!');
    
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  }
}

seed();

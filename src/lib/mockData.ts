import type { Shop, ShopTable, MenuCategory, MenuItem, Promotion, UserShopMembership, Profile } from './types/database';

const now = new Date().toISOString();

export const MOCK_SHOP: Shop = {
  id: 'mock-shop-123',
  name: 'Quán Cà Phê Mai (Mock)',
  slug: 'quan-cafe-mai',
  description: 'Cà phê ngon, view đẹp tại Di Linh',
  logo_url: null,
  cover_image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
  phone: '0901234567',
  address: '123 Đường Hùng Vương, TT. Di Linh',
  theme_config: { primary_color: '#6B4226', font: 'Inter' },
  business_hours: {},
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
  owner_id: 'mock-owner-123',
  is_active: true,
  subscription_tier: 'pro',
  created_at: now,
  updated_at: now,
};

export const MOCK_TABLES: ShopTable[] = [
  { id: 't1', shop_id: MOCK_SHOP.id, table_number: 1, short_code: 'QCM-01', qr_url: null, is_active: true, created_at: now },
  { id: 't2', shop_id: MOCK_SHOP.id, table_number: 2, short_code: 'QCM-02', qr_url: null, is_active: true, created_at: now },
];

export const MOCK_CATEGORIES: MenuCategory[] = [
  { id: 'c1', shop_id: MOCK_SHOP.id, name: 'Cà phê', description: null, sort_order: 1, is_active: true, created_at: now },
  { id: 'c2', shop_id: MOCK_SHOP.id, name: 'Trà & Nước ép', description: null, sort_order: 2, is_active: true, created_at: now },
  { id: 'c3', shop_id: MOCK_SHOP.id, name: 'Bánh ngọt', description: null, sort_order: 3, is_active: true, created_at: now },
];

export const MOCK_ITEMS: MenuItem[] = [
  { id: 'i1', shop_id: MOCK_SHOP.id, category_id: 'c1', name: 'Cà phê Đen Đá', description: 'Cà phê nguyên chất', price: 20000, image_url: '/images/coffee_den_da.webp', is_available: true, is_featured: true, sort_order: 1, tags: [], created_at: now, updated_at: now },
  { id: 'i2', shop_id: MOCK_SHOP.id, category_id: 'c1', name: 'Cà phê Sữa Đá', description: 'Sữa đặc Ngôi sao phương Nam', price: 25000, image_url: '/images/coffee_sua_da.webp', is_available: true, is_featured: false, sort_order: 2, tags: [], created_at: now, updated_at: now },
  { id: 'i3', shop_id: MOCK_SHOP.id, category_id: 'c2', name: 'Trà Đào Cam Sả', description: 'Trà thanh mát giải nhiệt', price: 35000, image_url: '/images/tea_dao_cam_sa.webp', is_available: true, is_featured: true, sort_order: 1, tags: [], created_at: now, updated_at: now },
  { id: 'i4', shop_id: MOCK_SHOP.id, category_id: 'c3', name: 'Bánh Tiramisu', description: 'Bánh ngọt chuẩn Ý', price: 45000, image_url: null, is_available: true, is_featured: false, sort_order: 1, tags: [], created_at: now, updated_at: now },
];

export const MOCK_PROMOTIONS: Promotion[] = [
  { id: 'p1', shop_id: MOCK_SHOP.id, name: 'Giờ Vàng Giảm Giá', description: 'Giảm 10% khung giờ 10-12h', type: 'discount', discount_percent: 10, discount_amount: null, applicable_items: [], applicable_ranks: [], starts_at: new Date(Date.now() - 86400000).toISOString(), ends_at: new Date(Date.now() + 86400000).toISOString(), max_uses: null, current_uses: 5, max_uses_per_user: 1, is_active: true, created_at: now },
];

export const MOCK_PROFILE: Profile = {
  id: 'mock-user-123',
  phone: '0901234567',
  display_name: 'Khách hàng VIP',
  avatar_url: null,
  role: 'customer',
  created_at: now,
  last_login_at: now,
};

export const MOCK_MEMBERSHIP: UserShopMembership = {
  id: 'mock-mem-123',
  user_id: MOCK_PROFILE.id,
  shop_id: MOCK_SHOP.id,
  ranking_points: 150,
  redeemable_points: 150,
  rank: 'silver',
  total_spent: 1500000,
  order_count: 5,
  joined_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  last_order_at: now,
};

// ========== PLATFORM ADMIN DATA ==========

export const MOCK_PLATFORM_ADMIN: Profile = {
  id: 'mock-admin-001',
  phone: '0900000001',
  display_name: 'Platform Admin',
  avatar_url: null,
  role: 'platform_admin',
  created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  last_login_at: now,
};

// --- Shop 2: Quán Nhậu Ba Miền ---
export const MOCK_SHOP_2: Shop = {
  id: 'mock-shop-456',
  name: 'Quán Nhậu Ba Miền',
  slug: 'quan-nhau-ba-mien',
  description: 'Nhậu bình dân, món ngon, giá rẻ',
  logo_url: null,
  cover_image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80',
  phone: '0912345678',
  address: '456 Đường Trần Phú, TT. Di Linh',
  theme_config: { primary_color: '#B71C1C', font: 'Inter' },
  business_hours: {},
  loyalty_config: {
    points_formula: { type: 'per_amount', amount_per_point: 20000 },
    ranks: [
      { name: 'Thành viên', min_points: 0, discount_percent: 0 },
      { name: 'Bạc', min_points: 50, discount_percent: 5 },
      { name: 'Vàng', min_points: 200, discount_percent: 8 },
      { name: 'Kim cương', min_points: 1000, discount_percent: 15 },
    ],
    bonus_rules: [],
    discount_stacking: 'take_highest',
  },
  owner_id: 'mock-owner-456',
  is_active: true,
  subscription_tier: 'free',
  created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  updated_at: now,
};

export const MOCK_CATEGORIES_2: MenuCategory[] = [
  { id: 'c2-1', shop_id: MOCK_SHOP_2.id, name: 'Món nướng', description: null, sort_order: 1, is_active: true, created_at: now },
  { id: 'c2-2', shop_id: MOCK_SHOP_2.id, name: 'Lẩu', description: null, sort_order: 2, is_active: true, created_at: now },
  { id: 'c2-3', shop_id: MOCK_SHOP_2.id, name: 'Đồ uống', description: null, sort_order: 3, is_active: true, created_at: now },
];

export const MOCK_ITEMS_2: MenuItem[] = [
  { id: 'i2-1', shop_id: MOCK_SHOP_2.id, category_id: 'c2-1', name: 'Bò nướng lá lốt', description: 'Bò cuộn lá lốt thơm phức', price: 65000, image_url: null, is_available: true, is_featured: true, sort_order: 1, tags: ['hot'], created_at: now, updated_at: now },
  { id: 'i2-2', shop_id: MOCK_SHOP_2.id, category_id: 'c2-1', name: 'Gà nướng mật ong', description: 'Gà nướng giòn, thấm gia vị', price: 120000, image_url: null, is_available: true, is_featured: false, sort_order: 2, tags: [], created_at: now, updated_at: now },
  { id: 'i2-3', shop_id: MOCK_SHOP_2.id, category_id: 'c2-2', name: 'Lẩu thái hải sản', description: 'Chua cay đậm đà', price: 250000, image_url: null, is_available: true, is_featured: true, sort_order: 1, tags: ['popular'], created_at: now, updated_at: now },
  { id: 'i2-4', shop_id: MOCK_SHOP_2.id, category_id: 'c2-3', name: 'Bia Tiger', description: 'Lon 330ml', price: 18000, image_url: null, is_available: true, is_featured: false, sort_order: 1, tags: [], created_at: now, updated_at: now },
  { id: 'i2-5', shop_id: MOCK_SHOP_2.id, category_id: 'c2-3', name: 'Nước ngọt', description: 'Coca / Pepsi / 7Up', price: 12000, image_url: null, is_available: true, is_featured: false, sort_order: 2, tags: [], created_at: now, updated_at: now },
];

export const MOCK_TABLES_2: ShopTable[] = [
  { id: 't2-1', shop_id: MOCK_SHOP_2.id, table_number: 1, short_code: 'BM-01', qr_url: null, is_active: true, created_at: now },
  { id: 't2-2', shop_id: MOCK_SHOP_2.id, table_number: 2, short_code: 'BM-02', qr_url: null, is_active: true, created_at: now },
  { id: 't2-3', shop_id: MOCK_SHOP_2.id, table_number: 3, short_code: 'BM-03', qr_url: null, is_active: true, created_at: now },
  { id: 't2-4', shop_id: MOCK_SHOP_2.id, table_number: 4, short_code: 'BM-04', qr_url: null, is_active: false, created_at: now },
];

// --- Shop 3: Trà Sữa Hoa Hồng ---
export const MOCK_SHOP_3: Shop = {
  id: 'mock-shop-789',
  name: 'Trà Sữa Hoa Hồng',
  slug: 'tra-sua-hoa-hong',
  description: 'Trà sữa tươi, topping đa dạng',
  logo_url: null,
  cover_image_url: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=1200&q=80',
  phone: '0923456789',
  address: '789 Đường Lê Lợi, TT. Di Linh',
  theme_config: { primary_color: '#E91E63', font: 'Inter' },
  business_hours: {},
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
  owner_id: 'mock-owner-789',
  is_active: false,
  subscription_tier: 'premium',
  created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  updated_at: now,
};

export const MOCK_CATEGORIES_3: MenuCategory[] = [
  { id: 'c3-1', shop_id: MOCK_SHOP_3.id, name: 'Trà sữa', description: null, sort_order: 1, is_active: true, created_at: now },
  { id: 'c3-2', shop_id: MOCK_SHOP_3.id, name: 'Topping', description: null, sort_order: 2, is_active: true, created_at: now },
];

export const MOCK_ITEMS_3: MenuItem[] = [
  { id: 'i3-1', shop_id: MOCK_SHOP_3.id, category_id: 'c3-1', name: 'Trà sữa trân châu', description: 'Classic best-seller', price: 30000, image_url: null, is_available: true, is_featured: true, sort_order: 1, tags: ['popular'], created_at: now, updated_at: now },
  { id: 'i3-2', shop_id: MOCK_SHOP_3.id, category_id: 'c3-1', name: 'Matcha Latte', description: 'Matcha Nhật Bản', price: 40000, image_url: null, is_available: true, is_featured: false, sort_order: 2, tags: ['new'], created_at: now, updated_at: now },
  { id: 'i3-3', shop_id: MOCK_SHOP_3.id, category_id: 'c3-2', name: 'Trân châu đen', description: 'Topping thêm', price: 8000, image_url: null, is_available: true, is_featured: false, sort_order: 1, tags: [], created_at: now, updated_at: now },
];

export const MOCK_TABLES_3: ShopTable[] = [
  { id: 't3-1', shop_id: MOCK_SHOP_3.id, table_number: 1, short_code: 'HH-01', qr_url: null, is_active: true, created_at: now },
];

// --- Aggregated arrays for Platform Admin ---
export const MOCK_ALL_SHOPS: Shop[] = [MOCK_SHOP, MOCK_SHOP_2, MOCK_SHOP_3];
export const MOCK_ALL_CATEGORIES: MenuCategory[] = [...MOCK_CATEGORIES, ...MOCK_CATEGORIES_2, ...MOCK_CATEGORIES_3];
export const MOCK_ALL_ITEMS: MenuItem[] = [...MOCK_ITEMS, ...MOCK_ITEMS_2, ...MOCK_ITEMS_3];
export const MOCK_ALL_TABLES: ShopTable[] = [...MOCK_TABLES, ...MOCK_TABLES_2, ...MOCK_TABLES_3];

export const MOCK_USERS: Profile[] = [
  MOCK_PLATFORM_ADMIN,
  { id: 'mock-owner-123', phone: '0901234567', display_name: 'Chị Mai (Chủ quán Cafe)', avatar_url: null, role: 'shop_owner', created_at: new Date(Date.now() - 90 * 86400000).toISOString(), last_login_at: now },
  { id: 'mock-owner-456', phone: '0912345678', display_name: 'Anh Ba (Chủ quán Nhậu)', avatar_url: null, role: 'shop_owner', created_at: new Date(Date.now() - 60 * 86400000).toISOString(), last_login_at: now },
  { id: 'mock-owner-789', phone: '0923456789', display_name: 'Cô Hồng (Chủ Trà Sữa)', avatar_url: null, role: 'shop_owner', created_at: new Date(Date.now() - 15 * 86400000).toISOString(), last_login_at: now },
  MOCK_PROFILE,
  { id: 'mock-user-200', phone: '0931111222', display_name: 'Nguyễn Văn A', avatar_url: null, role: 'customer', created_at: new Date(Date.now() - 20 * 86400000).toISOString(), last_login_at: now },
  { id: 'mock-user-201', phone: '0932222333', display_name: 'Trần Thị B', avatar_url: null, role: 'customer', created_at: new Date(Date.now() - 10 * 86400000).toISOString(), last_login_at: now },
];

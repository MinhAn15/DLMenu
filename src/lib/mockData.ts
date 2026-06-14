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
  { id: 'i1', shop_id: MOCK_SHOP.id, category_id: 'c1', name: 'Cà phê Đen Đá', description: 'Cà phê nguyên chất', price: 20000, image_url: null, is_available: true, is_featured: true, sort_order: 1, tags: [], created_at: now, updated_at: now },
  { id: 'i2', shop_id: MOCK_SHOP.id, category_id: 'c1', name: 'Cà phê Sữa Đá', description: 'Sữa đặc Ngôi sao phương Nam', price: 25000, image_url: null, is_available: true, is_featured: false, sort_order: 2, tags: [], created_at: now, updated_at: now },
  { id: 'i3', shop_id: MOCK_SHOP.id, category_id: 'c2', name: 'Trà Đào Cam Sả', description: 'Trà thanh mát giải nhiệt', price: 35000, image_url: null, is_available: true, is_featured: true, sort_order: 1, tags: [], created_at: now, updated_at: now },
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

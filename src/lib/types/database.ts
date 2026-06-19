export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type OrderType = 'dine_in' | 'takeaway';
export type UserRole = 'customer' | 'shop_owner' | 'platform_admin';
export type MemberRank = 'member' | 'silver' | 'gold' | 'diamond';
export type SubscriptionTier = 'free' | 'pro' | 'premium';
export type PointsTransactionType = 'earn' | 'redeem' | 'cancel_refund' | 'rank_bonus' | 'admin_adjust';
export type PromotionType = 'flash_sale' | 'discount' | 'bogo';

export interface Profile {
  id: string;
  phone: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  last_login_at: string | null;
}

export interface PointsFormula {
  type: 'per_amount' | 'percentage' | 'per_order';
  amount_per_point?: number;
  percentage?: number;
}

export interface RankConfig {
  name: string;
  min_points: number;
  discount_percent: number;
}

export interface LoyaltyConfig {
  points_formula: PointsFormula;
  ranks: RankConfig[];
  bonus_rules: Json[];
  discount_stacking: 'take_highest';
}

export interface ThemeConfig {
  primary_color: string;
  font: string;
  bank_info?: {
    bank_id: string; // e.g., 'MB', 'VCB', 'TCB'
    account_no: string;
    account_name: string;
  };
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  phone: string | null;
  address: string | null;
  theme_config: ThemeConfig;
  business_hours: Json;
  loyalty_config: LoyaltyConfig;
  owner_id: string;
  is_active: boolean;
  max_order_value: number;
  max_cart_items: number;
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

export interface ShopTable {
  id: string;
  shop_id: string;
  table_number: number;
  short_code: string;
  qr_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface MenuCategory {
  id: string;
  shop_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  shop_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface UserShopMembership {
  id: string;
  user_id: string;
  shop_id: string;
  ranking_points: number;
  redeemable_points: number;
  rank: MemberRank;
  total_spent: number;
  order_count: number;
  joined_at: string;
  last_order_at: string | null;
}

export interface Order {
  id: string;
  shop_id: string;
  table_id: string | null;
  user_id: string;
  order_type: OrderType;
  order_number: string;
  subtotal: number;
  discount_amount: number;
  discount_type: string | null;
  total: number;
  points_earned: number;
  status: OrderStatus;
  customer_note: string | null;
  created_at: string;
  confirmed_at: string | null;
  completed_at: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  note: string | null;
  created_at: string;
}

export interface Promotion {
  id: string;
  shop_id: string;
  name: string;
  description: string | null;
  type: PromotionType;
  discount_percent: number | null;
  discount_amount: number | null;
  applicable_items: string[];
  applicable_ranks: string[];
  starts_at: string;
  ends_at: string;
  max_uses: number | null;
  current_uses: number;
  max_uses_per_user: number | null;
  is_active: boolean;
  created_at: string;
}

export interface PointsTransaction {
  id: string;
  user_id: string;
  shop_id: string;
  order_id: string | null;
  type: PointsTransactionType;
  ranking_points_delta: number;
  redeemable_points_delta: number;
  ranking_points_after: number;
  redeemable_points_after: number;
  description: string | null;
  created_at: string;
}

// Joined types for queries
export interface OrderWithItems extends Order {
  order_items: (OrderItem & { menu_item: MenuItem })[];
  table?: ShopTable;
  user?: Profile;
}

export interface MenuItemWithCategory extends MenuItem {
  category: MenuCategory | null;
}

// Cart types (client-side only)
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  note: string;
}

-- DiLinhMenu: Core Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone VARCHAR(20) UNIQUE,
  display_name VARCHAR(100),
  avatar_url VARCHAR(500),
  role VARCHAR(20) NOT NULL DEFAULT 'customer'
    CHECK (role IN ('customer', 'shop_owner', 'platform_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. SHOPS (Tenants)
-- ============================================
CREATE TABLE public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  cover_image_url VARCHAR(500),
  phone VARCHAR(20),
  address TEXT,
  theme_config JSONB NOT NULL DEFAULT '{"primary_color": "#6B4226", "font": "Inter"}',
  business_hours JSONB NOT NULL DEFAULT '{}',
  loyalty_config JSONB NOT NULL DEFAULT '{
    "points_formula": {"type": "per_amount", "amount_per_point": 10000},
    "ranks": [
      {"name": "Thành viên", "min_points": 0, "discount_percent": 0},
      {"name": "Bạc", "min_points": 100, "discount_percent": 3},
      {"name": "Vàng", "min_points": 500, "discount_percent": 5},
      {"name": "Kim cương", "min_points": 2000, "discount_percent": 10}
    ],
    "bonus_rules": [],
    "discount_stacking": "take_highest"
  }',
  owner_id UUID NOT NULL REFERENCES public.profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  subscription_tier VARCHAR(20) NOT NULL DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 3. TABLES (Physical tables in shop)
-- ============================================
CREATE TABLE public.shop_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  table_number INT NOT NULL,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  qr_url VARCHAR(500),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(shop_id, table_number)
);

-- ============================================
-- 4. MENU CATEGORIES
-- ============================================
CREATE TABLE public.menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 5. MENU ITEMS
-- ============================================
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,0) NOT NULL,
  image_url VARCHAR(500),
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  tags JSONB NOT NULL DEFAULT ''[]'',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 6. USER-SHOP MEMBERSHIPS (Loyalty bridge)
-- ============================================
CREATE TABLE public.user_shop_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  ranking_points INT NOT NULL DEFAULT 0,
  redeemable_points INT NOT NULL DEFAULT 0,
  rank VARCHAR(20) NOT NULL DEFAULT 'member'
    CHECK (rank IN ('member', 'silver', 'gold', 'diamond')),
  total_spent DECIMAL(12,0) NOT NULL DEFAULT 0,
  order_count INT NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_order_at TIMESTAMPTZ,
  UNIQUE(user_id, shop_id)
);

-- ============================================
-- 7. ORDERS
-- ============================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id),
  table_id UUID REFERENCES public.shop_tables(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  order_type VARCHAR(20) NOT NULL DEFAULT 'dine_in'
    CHECK (order_type IN ('dine_in', 'takeaway')),
  order_number VARCHAR(20) NOT NULL,
  subtotal DECIMAL(12,0) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,0) NOT NULL DEFAULT 0,
  discount_type VARCHAR(50),
  total DECIMAL(12,0) NOT NULL DEFAULT 0,
  points_earned INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  customer_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- ============================================
-- 8. ORDER ITEMS
-- ============================================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id),
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10,0) NOT NULL,
  subtotal DECIMAL(12,0) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 9. PROMOTIONS
-- ============================================
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('flash_sale', 'discount', 'bogo')),
  discount_percent INT,
  discount_amount DECIMAL(10,0),
  applicable_items JSONB NOT NULL DEFAULT '[]',
  applicable_ranks JSONB NOT NULL DEFAULT '[]',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  max_uses INT,
  current_uses INT NOT NULL DEFAULT 0,
  max_uses_per_user INT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 10. POINTS TRANSACTIONS (Event Sourcing)
-- ============================================
CREATE TABLE public.points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  shop_id UUID NOT NULL REFERENCES public.shops(id),
  order_id UUID REFERENCES public.orders(id),
  type VARCHAR(30) NOT NULL
    CHECK (type IN ('earn', 'redeem', 'cancel_refund', 'rank_bonus', 'admin_adjust')),
  ranking_points_delta INT NOT NULL DEFAULT 0,
  redeemable_points_delta INT NOT NULL DEFAULT 0,
  ranking_points_after INT NOT NULL,
  redeemable_points_after INT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Auto-create profile on auth signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, display_name)
  VALUES (
    NEW.id,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Khách')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

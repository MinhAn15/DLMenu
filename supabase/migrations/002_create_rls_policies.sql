-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_shop_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

-- ============= PROFILES =============
CREATE POLICY "profiles_read_own" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- ============= SHOPS =============
-- Anyone can read active shops
CREATE POLICY "shops_read_active" ON public.shops
  FOR SELECT USING (is_active = true);

-- Owner can update their shop
CREATE POLICY "shops_owner_update" ON public.shops
  FOR UPDATE USING (owner_id = auth.uid());

-- Platform admin can do anything (role check)
CREATE POLICY "shops_admin_all" ON public.shops
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'platform_admin')
  );

-- ============= SHOP TABLES =============
-- Anyone can read active tables (needed for QR scan)
CREATE POLICY "tables_read_active" ON public.shop_tables
  FOR SELECT USING (is_active = true);

-- Shop owner can manage their tables
CREATE POLICY "tables_owner_manage" ON public.shop_tables
  FOR ALL USING (
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
  );

-- ============= MENU =============
-- Anyone can read available menu items
CREATE POLICY "menu_categories_read" ON public.menu_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "menu_items_read" ON public.menu_items
  FOR SELECT USING (true);

-- Shop owner can manage menu
CREATE POLICY "menu_categories_owner" ON public.menu_categories
  FOR ALL USING (
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
  );

CREATE POLICY "menu_items_owner" ON public.menu_items
  FOR ALL USING (
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
  );

-- ============= MEMBERSHIPS =============
-- Users can read their own memberships
CREATE POLICY "memberships_read_own" ON public.user_shop_memberships
  FOR SELECT USING (user_id = auth.uid());

-- Shop owners can read memberships of their shop
CREATE POLICY "memberships_shop_owner_read" ON public.user_shop_memberships
  FOR SELECT USING (
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
  );

-- System creates memberships (via function)
CREATE POLICY "memberships_insert_self" ON public.user_shop_memberships
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============= ORDERS =============
-- Users can read their own orders
CREATE POLICY "orders_read_own" ON public.orders
  FOR SELECT USING (user_id = auth.uid());

-- Shop owners can read orders for their shop
CREATE POLICY "orders_shop_owner_read" ON public.orders
  FOR SELECT USING (
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
  );

-- Users can create orders
CREATE POLICY "orders_create" ON public.orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Shop owners can update order status
CREATE POLICY "orders_shop_owner_update" ON public.orders
  FOR UPDATE USING (
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
  );

-- ============= ORDER ITEMS =============
CREATE POLICY "order_items_read" ON public.order_items
  FOR SELECT USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
    OR order_id IN (
      SELECT o.id FROM public.orders o
      JOIN public.shops s ON o.shop_id = s.id
      WHERE s.owner_id = auth.uid()
    )
  );

CREATE POLICY "order_items_create" ON public.order_items
  FOR INSERT WITH CHECK (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
  );

-- ============= PROMOTIONS =============
-- Anyone can read active promotions
CREATE POLICY "promotions_read_active" ON public.promotions
  FOR SELECT USING (is_active = true AND starts_at <= now() AND ends_at >= now());

-- Shop owner can manage promotions
CREATE POLICY "promotions_owner_manage" ON public.promotions
  FOR ALL USING (
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
  );

-- ============= POINTS TRANSACTIONS =============
CREATE POLICY "points_read_own" ON public.points_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "points_shop_owner_read" ON public.points_transactions
  FOR SELECT USING (
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
  );

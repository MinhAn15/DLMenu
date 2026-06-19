-- 007_admin_rls_policies.sql
-- Adds FOR ALL policies for role='platform_admin' on tables that lack them.
-- Required before platform-admin pages can fully read/manage all data per the RLS pattern.
-- Additive: does not drop existing public/owner policies (they remain in the permissive chain so OR logic still works).

-- ============= PROFILES (admin manage only — users can still read/write their own row) =============
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.role = 'platform_admin')
  );

-- ============= SHOP TABLES =============
CREATE POLICY "shop_tables_admin_all" ON public.shop_tables
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'platform_admin')
  );

-- ============= MENU CATEGORIES =============
CREATE POLICY "menu_categories_admin_all" ON public.menu_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'platform_admin')
  );

-- ============= MENU ITEMS =============
CREATE POLICY "menu_items_admin_all" ON public.menu_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'platform_admin')
  );

-- ============= USER-SHOP MEMBERSHIPS =============
CREATE POLICY "user_shop_memberships_admin_all" ON public.user_shop_memberships
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'platform_admin')
  );

-- ============= ORDERS =============
CREATE POLICY "orders_admin_all" ON public.orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'platform_admin')
  );

-- ============= ORDER ITEMS =============
CREATE POLICY "order_items_admin_all" ON public.order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'platform_admin')
  );

-- ============= PROMOTIONS =============
CREATE POLICY "promotions_admin_all" ON public.promotions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'platform_admin')
  );

-- ============= POINTS TRANSACTIONS =============
CREATE POLICY "points_transactions_admin_all" ON public.points_transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'platform_admin')
  );

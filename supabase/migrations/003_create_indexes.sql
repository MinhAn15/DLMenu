-- Performance indexes
CREATE INDEX idx_shops_slug ON public.shops(slug);
CREATE INDEX idx_shops_owner ON public.shops(owner_id);
CREATE INDEX idx_shop_tables_shop ON public.shop_tables(shop_id);
CREATE INDEX idx_shop_tables_short_code ON public.shop_tables(short_code);
CREATE INDEX idx_menu_categories_shop ON public.menu_categories(shop_id);
CREATE INDEX idx_menu_items_shop ON public.menu_items(shop_id);
CREATE INDEX idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX idx_memberships_user ON public.user_shop_memberships(user_id);
CREATE INDEX idx_memberships_shop ON public.user_shop_memberships(shop_id);
CREATE INDEX idx_orders_shop ON public.orders(shop_id);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_shop_status ON public.orders(shop_id, status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_promotions_shop_active ON public.promotions(shop_id, is_active, starts_at, ends_at);
CREATE INDEX idx_points_tx_user_shop ON public.points_transactions(user_id, shop_id);

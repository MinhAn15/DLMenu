-- ============================================
-- SEED DATA: Demo shop for development
-- ============================================
-- NOTE: Run this AFTER creating a test user via Supabase Auth
-- Replace 'OWNER_USER_ID' with actual auth.users UUID

-- This seed file is a TEMPLATE. Actual seeding happens via the app
-- or by manually replacing the owner_id below.

-- Example insert (uncomment and replace ID after creating auth user):
/*
INSERT INTO public.shops (name, slug, description, phone, address, owner_id)
VALUES (
  'Quán Cà Phê Mai',
  'quan-cafe-mai',
  'Cà phê ngon, view đẹp tại Di Linh',
  '0901234567',
  '123 Đường Hùng Vương, TT. Di Linh',
  'REPLACE_WITH_OWNER_UUID'
);

-- Tables
INSERT INTO public.shop_tables (shop_id, table_number, short_code)
SELECT s.id, t.n, UPPER(LEFT(s.slug, 3)) || '-' || LPAD(t.n::text, 2, '0')
FROM public.shops s,
     generate_series(1, 10) AS t(n)
WHERE s.slug = 'quan-cafe-mai';

-- Menu Categories
INSERT INTO public.menu_categories (shop_id, name, sort_order)
SELECT id, unnest, row_number() OVER ()
FROM public.shops, unnest(ARRAY['Cà phê', 'Trà & Nước ép', 'Bánh ngọt', 'Đồ ăn vặt'])
WHERE slug = 'quan-cafe-mai';
*/

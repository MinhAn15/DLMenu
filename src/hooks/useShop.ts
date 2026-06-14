import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Shop, ShopTable, MenuCategory, MenuItem, Promotion, UserShopMembership } from '@/lib/types/database';

export function useShop(slug: string, tableNumber?: string) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [table, setTable] = useState<ShopTable | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [membership, setMembership] = useState<UserShopMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!slug) return;

    const fetchShopData = async () => {
      try {
        setLoading(true);

        // 1. Fetch shop
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (shopError || !shopData) throw new Error('Shop not found');
        const currentShop = shopData as Shop;
        setShop(currentShop);

        // 2. Fetch table if provided
        if (tableNumber) {
          const { data: tableData } = await supabase
            .from('shop_tables')
            .select('*')
            .eq('shop_id', currentShop.id)
            .eq('table_number', parseInt(tableNumber))
            .eq('is_active', true)
            .single();
          if (tableData) setTable(tableData as ShopTable);
        }

        // 3. Fetch menu categories and items in parallel
        const [catsRes, itemsRes, promosRes] = await Promise.all([
          supabase
            .from('menu_categories')
            .select('*')
            .eq('shop_id', currentShop.id)
            .eq('is_active', true)
            .order('sort_order'),
          supabase
            .from('menu_items')
            .select('*')
            .eq('shop_id', currentShop.id)
            .eq('is_available', true)
            .order('sort_order'),
          supabase
            .from('promotions')
            .select('*')
            .eq('shop_id', currentShop.id)
            .eq('is_active', true)
            .lte('starts_at', new Date().toISOString())
            .gte('ends_at', new Date().toISOString()),
        ]);

        if (catsRes.data) setCategories(catsRes.data as MenuCategory[]);
        if (itemsRes.data) setItems(itemsRes.data as MenuItem[]);
        if (promosRes.data) setPromotions(promosRes.data as Promotion[]);

        // 4. Fetch membership if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: membershipData } = await supabase
            .from('user_shop_memberships')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('shop_id', currentShop.id)
            .single();
          
          if (membershipData) setMembership(membershipData as UserShopMembership);
        }

      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [slug, tableNumber, supabase]);

  // Helper to get items by category
  const getItemsByCategory = (categoryId: string) => {
    return items.filter(item => item.category_id === categoryId);
  };

  return {
    shop,
    table,
    categories,
    items,
    promotions,
    membership,
    loading,
    error,
    getItemsByCategory,
  };
}

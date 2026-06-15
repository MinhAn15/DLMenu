'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Shop } from '@/lib/types/database';
import { MOCK_SHOP } from '@/lib/mockData';

/**
 * Hook for admin pages — fetches the shop owned by the current user.
 * In mock mode, returns MOCK_SHOP.
 */
export function useAdminShop() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchShop = async () => {
      try {
        if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
          await new Promise(r => setTimeout(r, 300));
          setShop(MOCK_SHOP);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Chưa đăng nhập');
          return;
        }

        const { data, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (shopError || !data) {
          setError('Không tìm thấy cửa hàng');
          return;
        }

        setShop(data as Shop);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [supabase]);

  return { shop, loading, error };
}

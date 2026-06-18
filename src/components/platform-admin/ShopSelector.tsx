'use client';

import React from 'react';
import { useShopContext } from '@/hooks/useShopContext';
import { useAdminData } from '@/hooks/useAdminData';

export default function ShopSelector() {
  const { selectedShopId, setSelectedShopId } = useShopContext();
  const { shops } = useAdminData();
  const activeCount = shops.filter(s => s.is_active).length;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-400 hidden lg:inline">🏪</span>
      <select
        value={selectedShopId}
        onChange={(e) => setSelectedShopId(e.target.value)}
        className="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg px-4 py-2 pr-8 font-medium focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none cursor-pointer min-w-[200px] transition-all"
      >
        <option value="all">Tất cả các quán ({activeCount} active)</option>
        {shops.map(shop => (
          <option key={shop.id} value={shop.id}>
            {shop.name} {!shop.is_active ? '(Tắt)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}

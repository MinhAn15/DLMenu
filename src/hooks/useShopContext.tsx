'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ShopContextType {
  selectedShopId: string | 'all';
  setSelectedShopId: (id: string | 'all') => void;
}

const ShopContext = createContext<ShopContextType>({
  selectedShopId: 'all',
  setSelectedShopId: () => {},
});

export function ShopContextProvider({ children }: { children: ReactNode }) {
  const [selectedShopId, setSelectedShopId] = useState<string | 'all'>('all');

  return (
    <ShopContext.Provider value={{ selectedShopId, setSelectedShopId }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShopContext() {
  return useContext(ShopContext);
}

/** Helper: filter an array of objects by shop_id based on current context */
export function filterByShop<T extends { shop_id: string }>(data: T[], shopId: string | 'all'): T[] {
  if (shopId === 'all') return data;
  return data.filter(item => item.shop_id === shopId);
}

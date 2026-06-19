'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Shop, MenuCategory, MenuItem, ShopTable, Profile } from '@/lib/types/database';
import { getAdminShops } from '@/lib/actions/shop';
import { getAdminMenuCategories, getAdminMenuItems } from '@/lib/actions/menu';
import { getAdminTables } from '@/lib/actions/adminTables';
import { getAdminUsers } from '@/lib/actions/adminUsers';
import { getAdminOrders, AdminOrderWithDetails } from '@/lib/actions/adminOrders';

// MOCK Fallbacks (kept for `NEXT_PUBLIC_USE_MOCK=true` dev mode without Supabase)
import { MOCK_ALL_SHOPS, MOCK_ALL_CATEGORIES, MOCK_ALL_ITEMS, MOCK_ALL_TABLES, MOCK_USERS } from '@/lib/mockData';

interface AdminDataContextType {
  shops: Shop[];
  categories: MenuCategory[];
  items: MenuItem[];
  tables: ShopTable[];
  users: Profile[];
  orders: AdminOrderWithDetails[];
  loading: boolean;
}

const AdminDataContext = createContext<AdminDataContextType>({
  shops: [],
  categories: [],
  items: [],
  tables: [],
  users: [],
  orders: [],
  loading: true,
});

// Mock orders retained for mock-mode dev only (no Supabase required)
const mockOrders: AdminOrderWithDetails[] = [
  { id: 'o1', shop_id: 'mock-shop-123', table_id: 't1', user_id: 'u1', order_type: 'dine_in', order_number: '#001', subtotal: 85000, discount_amount: 0, discount_type: null, total: 85000, points_earned: 8, status: 'completed', customer_note: null, created_at: new Date(Date.now() - 3600000).toISOString(), confirmed_at: new Date(Date.now() - 3000000).toISOString(), completed_at: new Date(Date.now() - 1800000).toISOString(), order_items: [], shop_tables: { table_number: 1, short_code: 'QCM-01' }, profiles: null },
  { id: 'o2', shop_id: 'mock-shop-123', table_id: 't2', user_id: 'u2', order_type: 'dine_in', order_number: '#002', subtotal: 45000, discount_amount: 0, discount_type: null, total: 45000, points_earned: 4, status: 'preparing', customer_note: null, created_at: new Date(Date.now() - 1800000).toISOString(), confirmed_at: new Date(Date.now() - 1500000).toISOString(), completed_at: null, order_items: [], shop_tables: { table_number: 2, short_code: 'QCM-02' }, profiles: null },
  { id: 'o3', shop_id: 'mock-shop-456', table_id: null, user_id: 'u3', order_type: 'takeaway', order_number: '#001', subtotal: 315000, discount_amount: 0, discount_type: null, total: 315000, points_earned: 31, status: 'pending', customer_note: null, created_at: new Date(Date.now() - 900000).toISOString(), confirmed_at: null, completed_at: null, order_items: [], shop_tables: null, profiles: null },
];

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<ShopTable[]>(MOCK_ALL_TABLES);
  const [users, setUsers] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<AdminOrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
          setShops(MOCK_ALL_SHOPS);
          setCategories(MOCK_ALL_CATEGORIES);
          setItems(MOCK_ALL_ITEMS);
          setTables(MOCK_ALL_TABLES);
          setUsers(MOCK_USERS as unknown as Profile[]);
          setOrders(mockOrders);
          setLoading(false);
          return;
        }

        const [fetchedShops, fetchedCategories, fetchedItems, fetchedTables, fetchedUsers, fetchedOrders] = await Promise.all([
          getAdminShops(),
          getAdminMenuCategories(),
          getAdminMenuItems(),
          getAdminTables(),
          getAdminUsers(),
          getAdminOrders(),
        ]);
        setShops(fetchedShops);
        setCategories(fetchedCategories);
        setItems(fetchedItems);
        setTables(fetchedTables);
        setUsers(fetchedUsers);
        setOrders(fetchedOrders);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch admin data', err);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <AdminDataContext.Provider value={{ shops, categories, items, tables, users, orders, loading }}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  return useContext(AdminDataContext);
}

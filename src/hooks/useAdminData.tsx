'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Shop, MenuCategory, MenuItem, ShopTable } from '@/lib/types/database';
import { getAdminShops } from '@/lib/actions/shop';
import { getAdminMenuCategories, getAdminMenuItems } from '@/lib/actions/menu';

// MOCK Fallbacks until all real endpoints are wired up
import { MOCK_ALL_SHOPS, MOCK_ALL_CATEGORIES, MOCK_ALL_ITEMS, MOCK_ALL_TABLES, MOCK_USERS } from '@/lib/mockData';

interface AdminDataContextType {
  shops: Shop[];
  categories: MenuCategory[];
  items: MenuItem[];
  tables: ShopTable[];
  users: any[];
  orders: any[];
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

// Mock orders for all shops
const mockOrders = [
  { id: 'o1', shop_id: 'mock-shop-123', order_number: '#001', table_number: 1, customer_name: 'Khách hàng VIP', customer_phone: '0901234567', total: 85000, status: 'completed', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'o2', shop_id: 'mock-shop-123', order_number: '#002', table_number: 2, customer_name: 'Nguyễn Văn A', customer_phone: '0931111222', total: 45000, status: 'preparing', created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 'o3', shop_id: 'mock-shop-456', order_number: '#001', table_number: 1, customer_name: 'Trần Thị B', customer_phone: '0932222333', total: 315000, status: 'pending', created_at: new Date(Date.now() - 900000).toISOString() },
  { id: 'o4', shop_id: 'mock-shop-456', order_number: '#002', table_number: 3, customer_name: 'Anh Cường', customer_phone: '0943333444', total: 520000, status: 'confirmed', created_at: new Date(Date.now() - 600000).toISOString() },
  { id: 'o5', shop_id: 'mock-shop-789', order_number: '#001', table_number: 1, customer_name: 'Em Linh', customer_phone: '0954444555', total: 70000, status: 'ready', created_at: new Date(Date.now() - 300000).toISOString() },
  { id: 'o6', shop_id: 'mock-shop-123', order_number: '#003', table_number: 1, customer_name: 'Chị Hương', customer_phone: '0965555666', total: 120000, status: 'cancelled', created_at: new Date(Date.now() - 7200000).toISOString() },
];

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<ShopTable[]>(MOCK_ALL_TABLES);
  const [users, setUsers] = useState<any[]>(MOCK_USERS);
  const [orders, setOrders] = useState<any[]>(mockOrders);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
          setShops(MOCK_ALL_SHOPS);
          setCategories(MOCK_ALL_CATEGORIES);
          setItems(MOCK_ALL_ITEMS);
          setTables(MOCK_ALL_TABLES);
          setUsers(MOCK_USERS);
          setLoading(false);
          return;
        }

        const [fetchedShops, fetchedCategories, fetchedItems] = await Promise.all([
          getAdminShops(),
          getAdminMenuCategories(),
          getAdminMenuItems()
        ]);
        setShops(fetchedShops);
        setCategories(fetchedCategories);
        setItems(fetchedItems);
        // We will fetch tables and users later or just leave mock for now
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

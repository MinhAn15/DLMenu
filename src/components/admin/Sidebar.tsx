'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/admin', label: 'Tổng quan', icon: '📊' },
  { href: '/admin/orders', label: 'Đơn hàng', icon: '🛒' },
  { href: '/admin/menu', label: 'Thực đơn', icon: '🍔' },
  { href: '/admin/tables', label: 'Bàn & QR', icon: '📱' },
  { href: '/admin/promotions', label: 'Khuyến mãi', icon: '🎁' },
  { href: '/admin/settings', label: 'Cài đặt', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col hidden md:flex">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-[var(--color-primary)]">DiLinhMenu</h1>
        <p className="text-sm text-gray-500">Quản lý cửa hàng</p>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--color-primary)] bg-opacity-10 text-[var(--color-primary)]'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
        >
          <span>🚪</span>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/admin', label: 'Tổng quan', icon: '📊' },
  { href: '/admin/orders', label: 'Đơn hàng', icon: '🛒' },
  { href: '/admin/menu', label: 'Thực đơn', icon: '🍔' },
  { href: '/admin/tables', label: 'Bàn & QR', icon: '📱' },
  { href: '/admin/analytics', label: 'Thống kê', icon: '📈' },
  { href: '/admin/promotions', label: 'Khuyến mãi', icon: '🎁' },
  { href: '/admin/settings', label: 'Cài đặt', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-lg font-bold text-[var(--color-primary)]">DiLinhMenu Admin</h1>
        <button onClick={() => setIsOpen(true)} className="text-gray-600 text-2xl p-2">
          ☰
        </button>
      </header>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-xl md:shadow-none flex flex-col 
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="font-heading text-2xl font-bold text-[var(--color-primary)] tracking-tight">DiLinhMenu</h1>
            <p className="text-sm text-gray-500">Quản lý cửa hàng</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-500 p-2 text-xl">
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 hide-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--color-primary)] bg-opacity-10 text-[var(--color-primary)]'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <span>🚪</span>
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
}

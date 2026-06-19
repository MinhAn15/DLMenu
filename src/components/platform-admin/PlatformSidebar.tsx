'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coffee } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PlatformSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const navItems = [
    { href: '/platform-admin', label: t('admin.sidebar.overview'), icon: '📊' },
    { href: '/platform-admin/shops', label: t('admin.sidebar.shops'), icon: '🏪' },
    { href: '/platform-admin/menu', label: t('admin.sidebar.menu'), icon: '🍔' },
    { href: '/platform-admin/tables', label: t('admin.sidebar.tables'), icon: '🪑' },
    { href: '/platform-admin/orders', label: t('admin.sidebar.orders'), icon: '🛒' },
    { href: '/platform-admin/users', label: t('admin.sidebar.users'), icon: '👤' },
    { href: '/platform-admin/settings', label: t('admin.sidebar.settings'), icon: '⚙️' },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden bg-[#1F2937] p-4 flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-lg font-bold text-white">
          DL<span className="text-amber-400">Menu</span> <span className="text-xs text-gray-400 font-normal">Platform</span>
        </h1>
        <button onClick={() => setIsOpen(true)} className="text-gray-300 text-2xl p-2">
          ☰
        </button>
      </header>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#1F2937] flex flex-col
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-amber-500 flex items-center justify-center text-white">
              <Coffee size={18} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                DiLinh<span className="text-amber-400">Menu</span>
              </h1>
              <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest">Platform Admin</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 p-2 text-xl hover:text-white">
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/platform-admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-amber-500 bg-opacity-20 text-amber-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-amber-500 bg-opacity-20 flex items-center justify-center text-amber-400 text-sm font-bold">
              SA
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200">Super Admin</p>
              <p className="text-xs text-gray-500">0900000001</p>
            </div>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm text-red-400 hover:bg-red-900 hover:bg-opacity-30 mt-2 transition-colors"
          >
            <span>🚪</span>
            Đăng xuất
          </Link>
        </div>
      </aside>
    </>
  );
}

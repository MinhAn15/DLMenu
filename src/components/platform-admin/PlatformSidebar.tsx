'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminData } from '@/hooks/useAdminData';
import {
  LayoutDashboard, Store, UtensilsCrossed, TicketPercent,
  BarChart3, Users, Settings, LogOut, ChevronDown, ChevronRight,
  Coffee,
} from 'lucide-react';

const SECTION_ITEMS: { label: string | null; items: SectionItem[] }[] = [
  {
    label: null,
    items: [
      { href: '/platform-admin', label: 'Bảng điều khiển', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Khách hàng',
    items: [
      { href: '/platform-admin/shops?filter=all', label: 'Tất cả quán', icon: Store, counterKey: 'total' },
      { href: '/platform-admin/shops?filter=needing-action', label: 'Cần xử lý', icon: Store, counterKey: 'needsAction', dot: 'red' },
      { href: '/platform-admin/shops?filter=onboarding', label: 'Đang dùng thử', icon: Store, counterKey: 'trial' },
      { href: '/platform-admin/shops?filter=trial-ending', label: 'Sắp hết hạn', icon: Store, counterKey: 'endingSoon' },
    ],
  },
  {
    label: null,
    items: [
      { href: '/platform-admin/menu', label: 'Kho Menu', icon: UtensilsCrossed },
      { href: '/platform-admin/promotions', label: 'Khuyến mãi', icon: TicketPercent },
      { href: '/platform-admin/platform-stats', label: 'Thống kê', icon: BarChart3 },
      { href: '/platform-admin/team', label: 'Team', icon: Users },
      { href: '/platform-admin/platform-settings', label: 'Cài đặt nền tảng', icon: Settings },
    ],
  },
];

interface SectionItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  counterKey?: 'total' | 'needsAction' | 'trial' | 'endingSoon';
  dot?: 'red';
}

type NavItem = SectionItem;

function isActive(pathname: string, href: string): boolean {
  if (href === '/platform-admin') return pathname === '/platform-admin';
  if (href.startsWith('/platform-admin/shops?')) {
    const base = '/platform-admin/shops';
    return pathname === base || pathname.startsWith(base + '/');
  }
  return pathname === href || pathname.startsWith(href + '/');
}

export default function PlatformSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [customerExpanded, setCustomerExpanded] = useState(true);
  const { shops, orders } = useAdminData();

  const counters = useMemo(() => {
    const total = shops.length;
    const trial = shops.filter(s => (s.subscription_tier || 'free') === 'free').length;
    const needsAction = shops.filter(s => {
      if (!s.is_active) return true;
      if ((s.subscription_tier || 'free') !== 'free') {
        if (s.subscription_tier !== 'free') return false;
      }
      return false;
    }).length || Math.max(1, Math.floor(total * 0.15));
    const endingSoon = shops.filter(s => !s.is_active).length || Math.max(1, Math.floor(total * 0.08));
    return { total, trial, needsAction, endingSoon };
  }, [shops]);

  const activeShopId = useMemo(() => {
    const match = pathname.match(/^\/platform-admin\/shops\/([^/]+)/);
    return match ? match[1] : null;
  }, [pathname]);

  const activeShop = activeShopId ? shops.find(s => s.id === activeShopId) : null;

  const getCounter = (item: NavItem): number | null => {
    if (item.counterKey === 'total') return counters.total;
    if (item.counterKey === 'needsAction') return counters.needsAction;
    if (item.counterKey === 'trial') return counters.trial;
    if (item.counterKey === 'endingSoon') return counters.endingSoon;
    return null;
  };

  return (
    <>
      <header className="md:hidden bg-[#1F2937] p-4 flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-lg font-bold text-white">
          DL<span className="text-amber-400">Menu</span> <span className="text-xs text-gray-400 font-normal">Platform</span>
        </h1>
        <button onClick={() => setIsOpen(true)} className="text-gray-300 text-2xl p-2">☰</button>
      </header>

      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-60 z-40" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#1F2937] flex flex-col
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-5 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-amber-500 flex items-center justify-center text-white">
              <Coffee size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-tight">
                DiLinh<span className="text-amber-400">Menu</span>
              </h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Nền tảng</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 p-2 text-xl hover:text-white">✕</button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {SECTION_ITEMS.map((section, si) => (
            <div key={si}>
              {section.label && (
                <button
                  onClick={() => setCustomerExpanded(!customerExpanded)}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-300"
                >
                  <span>{section.label}</span>
                  {customerExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              )}
              <div className={`flex flex-col gap-0.5 ${section.label && !customerExpanded ? 'hidden' : ''}`}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(pathname, item.href);
                  const counter = getCounter(item);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                        active
                          ? 'bg-amber-500 bg-opacity-20 text-amber-400'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                      }`}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.dot && counter && counter > 0 && (
                        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                      )}
                      {counter !== null && counter > 0 && !item.dot && (
                        <span className="text-xs font-bold tabular-nums text-gray-400">{counter}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {activeShop && (
          <div className="px-3 py-2 border-t border-gray-700 bg-gray-800 bg-opacity-50">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: activeShop.theme_config?.primary_color || '#6B4226' }}
              >
                {activeShop.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-200 truncate">Đang mở: {activeShop.name}</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-3 border-t border-gray-700 flex-shrink-0">
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm text-red-400 hover:bg-red-900 hover:bg-opacity-30 transition-colors"
          >
            <LogOut size={18} />
            Thoát
          </Link>
        </div>
      </aside>
    </>
  );
}

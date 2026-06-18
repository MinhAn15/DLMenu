'use client';

import React from 'react';
import PlatformSidebar from '@/components/platform-admin/PlatformSidebar';
import ShopSelector from '@/components/platform-admin/ShopSelector';
import { ShopContextProvider } from '@/hooks/useShopContext';
import { AdminDataProvider } from '@/hooks/useAdminData';

export default function PlatformAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminDataProvider>
      <ShopContextProvider>
        <div className="flex min-h-screen bg-[#F0F2F5]">
        <PlatformSidebar />
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header Bar with Shop Selector */}
          <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-500 hidden md:block">Platform Control Center</h2>
            <ShopSelector />
          </header>
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
      </ShopContextProvider>
    </AdminDataProvider>
  );
}

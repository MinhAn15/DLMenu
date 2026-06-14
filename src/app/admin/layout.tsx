import React from 'react';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[var(--color-primary)]">DiLinhMenu Admin</h1>
          <button className="text-gray-500">☰</button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

'use client';

import React from 'react';
import ActionInbox from '@/components/platform-admin/ActionInbox';
import ActivityFeed from '@/components/platform-admin/ActivityFeed';
import SystemHealthSection from '@/components/platform-admin/SystemHealthSection';

export default function PlatformDashboardPage() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển</h1>
        <p className="text-sm text-gray-500 mt-1">
          Việc cần xử lý hôm nay · Cập nhật lúc {new Date().toLocaleTimeString('vi-VN')}
        </p>
      </div>

      <ActionInbox />
      <ActivityFeed />
      <SystemHealthSection />
    </div>
  );
}

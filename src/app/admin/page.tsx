import React from 'react';
import StatCard from '@/components/admin/StatCard';
import Card from '@/components/ui/Card';

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
        <p className="text-gray-500">Cập nhật lúc {new Date().toLocaleTimeString('vi-VN')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Doanh thu hôm nay" value="2.500.000₫" trend={12.5} trendLabel="so với hôm qua" icon="💰" />
        <StatCard title="Đơn hàng" value="45" trend={5} trendLabel="so với hôm qua" icon="🛒" />
        <StatCard title="Khách hàng mới" value="12" trend={-2} trendLabel="so với tuần trước" icon="👥" />
        <StatCard title="Bàn đang phục vụ" value="8/15" icon="🍽️" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card className="h-96 flex items-center justify-center bg-gray-50">
            <p className="text-gray-500">[Biểu đồ doanh thu 7 ngày]</p>
          </Card>
        </div>
        <div>
          <Card className="h-96 flex flex-col gap-4">
            <h3 className="font-bold border-b pb-2">Đơn hàng gần đây</h3>
            <div className="flex-1 flex items-center justify-center text-gray-500">
              [Danh sách đơn hàng realtime]
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

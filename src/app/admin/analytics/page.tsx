'use client';

import React, { useState } from 'react';
import { useAdminShop } from '@/hooks/useAdminShop';
import { trpc } from '@/lib/trpc/client';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import { formatVND } from '@/lib/utils/format';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export default function AnalyticsPage() {
  const { shop, loading: shopLoading, error: shopError } = useAdminShop();
  const [days, setDays] = useState(7);

  const { data, isLoading, error } = trpc.shop.analytics.get.useQuery(
    { shopId: shop?.id ?? '', days },
    { enabled: !!shop },
  );

  if (shopError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">Lỗi</h2>
        <p className="text-gray-600">{shopError}</p>
      </div>
    );
  }

  if (shopLoading || isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <Skeleton width="250px" height="32px" />
          <Skeleton width="120px" height="40px" borderRadius="var(--radius-md)" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton height="120px" borderRadius="var(--radius-lg)" />
          <Skeleton height="120px" borderRadius="var(--radius-lg)" />
          <Skeleton height="120px" borderRadius="var(--radius-lg)" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          <Skeleton height="400px" borderRadius="var(--radius-lg)" />
          <Skeleton height="400px" borderRadius="var(--radius-lg)" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">{error?.message || 'No data'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: '#111' }}>Thống kê & Doanh thu</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            Theo dõi hiệu quả kinh doanh của {shop?.name}
          </p>
        </div>
        
        {/* Days Filter */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {[7, 14, 30].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                days === d ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {d} ngày
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">💰</div>
          <h3 className="text-gray-500 font-medium text-sm">Tổng doanh thu</h3>
          <p className="text-3xl font-bold text-green-600">{formatVND(data.kpis.totalRevenue)}</p>
          <p className="text-xs text-gray-400 mt-2">Dựa trên đơn hoàn thành</p>
        </Card>
        
        <Card className="p-6 flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">📝</div>
          <h3 className="text-gray-500 font-medium text-sm">Đơn hàng</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{data.kpis.totalOrders}</p>
            <span className="text-sm text-green-600 font-medium">{data.kpis.completedOrders} hoàn thành</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Tất cả đơn vị tính</p>
        </Card>
        
        <Card className="p-6 flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">📈</div>
          <h3 className="text-gray-500 font-medium text-sm">Giá trị đơn TB (AOV)</h3>
          <p className="text-3xl font-bold text-blue-600">{formatVND(data.kpis.averageOrderValue)}</p>
          <p className="text-xs text-gray-400 mt-2">Trên mỗi đơn thành công</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Line Chart */}
        <Card className="p-6 flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Biểu đồ Doanh thu</h3>
            <p className="text-sm text-gray-500">{days} ngày qua</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueChart} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={3} activeDot={{ r: 8 }} />
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" vertical={false} />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#666'}} tickLine={false} axisLine={false} />
                <YAxis 
                  tickFormatter={(value) => `${value / 1000}k`} 
                  tick={{fontSize: 12, fill: '#666'}} 
                  tickLine={false} 
                  axisLine={false} 
                  width={60}
                />
                <Tooltip 
                  formatter={(value: any) => [formatVND(value || 0), 'Doanh thu']}
                  labelStyle={{color: '#111', fontWeight: 'bold'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Items Bar Chart */}
        <Card className="p-6 flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Món ăn bán chạy</h3>
            <p className="text-sm text-gray-500">Top 5 món theo số lượng</p>
          </div>
          <div className="h-[300px] w-full">
            {data.topItems && data.topItems.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topItems} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#333', fontWeight: 500}} width={120} />
                  <Tooltip 
                    cursor={{fill: '#f3f4f6'}}
                    formatter={(value: any) => [value || 0, 'Đã bán']}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="sold" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Chưa có dữ liệu bán hàng
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import Card from '@/components/ui/Card';
import { ChevronDown, ChevronRight, CheckCircle, Activity, Database, RefreshCw } from 'lucide-react';

export default function SystemHealthSection() {
  const [expanded, setExpanded] = useState(false);
  const { shops, orders } = useAdminData();

  return (
    <Card>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
            <CheckCircle size={18} className="text-green-600" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900">Sức khỏe hệ thống</h3>
            <p className="text-xs text-gray-500 mt-0.5">Tất cả dịch vụ hoạt động bình thường</p>
          </div>
        </div>
        {expanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-2 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <Activity size={16} className="text-green-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Uptime</p>
                <p className="text-sm font-bold text-gray-900">99.97%</p>
                <p className="text-[10px] text-gray-400">30 ngày qua</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <Database size={16} className="text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Cơ sở dữ liệu</p>
                <p className="text-sm font-bold text-gray-900">{shops.length} quán</p>
                <p className="text-[10px] text-gray-400">{orders.length} đơn</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <RefreshCw size={16} className="text-amber-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Backup gần nhất</p>
                <p className="text-sm font-bold text-gray-900">Hôm nay, 03:00</p>
                <p className="text-[10px] text-gray-400">Tự động thành công</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

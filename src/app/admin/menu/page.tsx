'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function AdminMenuPage() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Thực đơn</h1>
          <p className="text-gray-500">Cập nhật món và giá cả</p>
        </div>
        <Button>+ Thêm món</Button>
      </div>

      <Card className="p-8 text-center text-gray-500">
        Tính năng quản lý thực đơn đang được phát triển.
        <br />
        (CRUD Món ăn, Danh mục, Tùy chọn)
      </Card>
    </div>
  );
}

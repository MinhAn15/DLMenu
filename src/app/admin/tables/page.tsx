'use client';

import React from 'react';
import QRGenerator from '@/components/admin/QRGenerator';

export default function AdminTablesPage() {
  // Mock data
  const shopName = "Quán Cà Phê Mai";
  const slug = "quan-cafe-mai";
  const tables = [
    { number: 1, code: 'QCM-01' },
    { number: 2, code: 'QCM-02' },
    { number: 3, code: 'QCM-03' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mã QR & Bàn</h1>
          <p className="text-gray-500">In mã QR cho từng bàn</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map(table => (
          <QRGenerator 
            key={table.number}
            shortCode={table.code} 
            shopName={shopName} 
            tableNumber={table.number} 
          />
        ))}
      </div>
    </div>
  );
}

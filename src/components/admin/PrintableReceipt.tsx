'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatVND, formatDate } from '@/lib/utils/format';
import type { Order, OrderItem } from '@/lib/types/database';

interface PrintableReceiptProps {
  order: any;
  shopName: string;
}

export default function PrintableReceipt({ order, shopName }: PrintableReceiptProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const content = (
    <div className="print-only-container">
      <div className="thermal-receipt" style={{ padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 'bold' }}>{shopName}</h2>
          <p style={{ margin: '0 0 4px', fontSize: '12px' }}>Hóa đơn thanh toán</p>
          <p style={{ margin: '0', fontSize: '12px' }}>Ngày: {formatDate(order.created_at)}</p>
        </div>

        <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '8px 0', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', textAlign: 'center' }}>
            Bàn: {order.table_id}
          </h3>
          <p style={{ margin: '4px 0 0', textAlign: 'center', fontSize: '12px' }}>
            Mã đơn: #{order.id.split('-')[0].toUpperCase()}
          </p>
        </div>

        <table style={{ width: '100%', marginBottom: '12px', fontSize: '12px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Món</th>
              <th style={{ textAlign: 'center', paddingBottom: '4px' }}>SL</th>
              <th style={{ textAlign: 'right', paddingBottom: '4px' }}>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items?.map((item: any, idx: number) => (
              <tr key={idx}>
                <td style={{ paddingBottom: '4px' }}>
                  <div style={{ fontWeight: 'bold' }}>{item.menu_items?.name || 'Món'}</div>
                  {item.note && <div style={{ fontSize: '10px', fontStyle: 'italic' }}>- {item.note}</div>}
                </td>
                <td style={{ textAlign: 'center', paddingBottom: '4px', verticalAlign: 'top' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right', paddingBottom: '4px', verticalAlign: 'top' }}>{formatVND(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {order.customer_note && (
          <div style={{ borderTop: '1px dashed #000', padding: '8px 0', fontSize: '12px' }}>
            <strong>Ghi chú:</strong> {order.customer_note}
          </div>
        )}

        <div style={{ borderTop: '1px dashed #000', paddingTop: '8px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
          <span>TỔNG CỘNG:</span>
          <span>{formatVND(order.total)}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '12px' }}>
          <span>Trạng thái:</span>
          <span>{order.status === 'completed' ? 'Đã thanh toán' : 'Chưa thanh toán'}</span>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', fontStyle: 'italic' }}>
          <p style={{ margin: 0 }}>Cảm ơn quý khách!</p>
          <p style={{ margin: 0 }}>Hẹn gặp lại</p>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

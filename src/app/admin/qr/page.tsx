'use client';

import React, { useState, useEffect } from 'react';
import { useAdminShop } from '@/hooks/useAdminShop';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createPortal } from 'react-dom';

export default function QRCodeGeneratorPage() {
  const { shop, loading } = useAdminShop();
  const [startTable, setStartTable] = useState(1);
  const [endTable, setEndTable] = useState(10);
  const [baseUrl, setBaseUrl] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setIsPrinting(false), 500);
    }, 100);
  };

  if (loading || !shop) return <div style={{ padding: 'var(--space-6)' }}>Đang tải...</div>;

  const tables = Array.from({ length: endTable - startTable + 1 }, (_, i) => startTable + i);

  const printContent = isPrinting && (
    <div className="print-only-container">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        padding: '20px',
        width: '210mm', /* A4 width */
        margin: '0 auto',
        backgroundColor: '#fff'
      }}>
        {tables.map(tableNum => {
          const url = `${baseUrl}/s/${shop.slug}/t/${tableNum}`;
          return (
            <div key={tableNum} style={{
              border: '2px dashed #ccc',
              padding: '20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pageBreakInside: 'avoid'
            }}>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>{shop.name}</h2>
              <QRCodeSVG value={url} size={150} level="M" />
              <div style={{ marginTop: '12px', fontSize: '24px', fontWeight: 'bold' }}>Bàn {tableNum}</div>
              <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>Quét mã để đặt món</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '800px' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: '#111' }}>Tạo Mã QR Bàn</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Tạo và in mã QR cho các bàn trong quán của bạn. Khách hàng quét mã này để mở Menu điện tử.
        </p>
      </div>

      <div style={{ background: 'var(--color-bg)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-light)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Tùy chỉnh số lượng bàn</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <Input 
            type="number" 
            label="Bàn bắt đầu" 
            value={startTable} 
            onChange={(e) => setStartTable(parseInt(e.target.value) || 1)} 
            min={1}
          />
          <Input 
            type="number" 
            label="Bàn kết thúc" 
            value={endTable} 
            onChange={(e) => setEndTable(parseInt(e.target.value) || 1)} 
            min={startTable}
          />
        </div>
        
        <div style={{ padding: 'var(--space-4)', background: 'var(--color-info-light)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)' }}>
          <strong style={{ color: 'var(--color-info-dark)' }}>Link mẫu sẽ được tạo:</strong>
          <br/>
          <code style={{ fontSize: 'var(--font-size-sm)' }}>{baseUrl}/s/{shop.slug}/t/[số bàn]</code>
        </div>

        <Button onClick={handlePrint} size="lg" fullWidth>
          🖨️ In Mã QR (Bàn {startTable} đến {endTable})
        </Button>
      </div>

      {isPrinting && createPortal(printContent, document.body)}
    </div>
  );
}

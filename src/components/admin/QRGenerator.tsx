'use client';

import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface QRGeneratorProps {
  shortCode: string; // e.g., QCM-01
  shopName: string;
  tableNumber: number;
}

export default function QRGenerator({ shortCode, shopName, tableNumber }: QRGeneratorProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // In production, this URL points to the QR router: /q/[code]
  const targetUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/q/${shortCode}` 
    : `https://dilinhmenu.vn/q/${shortCode}`;

  useEffect(() => {
    QRCode.toDataURL(targetUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#6B4226',
        light: '#FFFFFF',
      },
    })
      .then(url => {
        setQrDataUrl(url);
      })
      .catch(err => {
        console.error('QR Generate Error', err);
      });
  }, [targetUrl]);

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR-${shopName}-Ban${tableNumber}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Card className="flex flex-col items-center gap-4 text-center">
      <div className="font-bold text-lg border-b pb-2 w-full">Bàn {tableNumber}</div>
      {qrDataUrl ? (
        <img src={qrDataUrl} alt={`QR Bàn ${tableNumber}`} className="w-48 h-48 rounded-lg shadow-sm" />
      ) : (
        <div className="w-48 h-48 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
          Loading...
        </div>
      )}
      <div className="text-xs text-gray-500 break-all">{targetUrl}</div>
      <Button variant="secondary" onClick={downloadQR} fullWidth>
        Tải mã QR
      </Button>
    </Card>
  );
}

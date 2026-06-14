import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'DiLinhMenu — Đặt món & Tích điểm',
  description: 'Quét QR, đặt món nhanh, tích điểm nhận ưu đãi tại quán yêu thích ở Di Linh',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#6B4226',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'var(--font-sans)',
              borderRadius: 'var(--radius-lg)',
            },
          }}
        />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import { Inter, Outfit } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { TRPCProvider } from '@/components/providers/TRPCProvider';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-heading' });

export const metadata: Metadata = {
  title: {
    default: 'DiLinhMenu — Quét QR, Đặt Món, Tích Điểm',
    template: '%s | DiLinhMenu',
  },
  description: 'Nền tảng đặt món QR Code và chăm sóc khách hàng cho quán cà phê & nhà hàng tại Di Linh, Lâm Đồng. Tích điểm tự động, khuyến mãi, quản lý realtime.',
  manifest: '/manifest.json',
  keywords: ['đặt món', 'QR code', 'quán cà phê', 'Di Linh', 'tích điểm', 'loyalty', 'POS', 'quản lý quán'],
  authors: [{ name: 'DiLinhMenu' }],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'DiLinhMenu',
    title: 'DiLinhMenu — Quét QR, Đặt Món, Tích Điểm',
    description: 'Số hóa quán cà phê với QR ordering, loyalty tự động, dashboard realtime. Miễn phí cho quán nhỏ.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DiLinhMenu — Quét QR, Đặt Món, Tích Điểm',
    description: 'Nền tảng quản lý quán cà phê thông minh tại Di Linh',
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DiLinhMenu',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#6B4226',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'DiLinhMenu',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              description: 'Nền tảng đặt món QR Code và chăm sóc khách hàng cho quán cà phê',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'VND',
              },
            }),
          }}
        />
      </head>
      <body className="bg-gradient font-sans antialiased text-[var(--color-text)]">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <TRPCProvider>
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
            </TRPCProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

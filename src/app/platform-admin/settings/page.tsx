'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations, useLocale } from 'next-intl';
import Card from '@/components/ui/Card';

export default function PlatformSettingsPage() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations();
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);

  const setLanguage = (lang: 'vi' | 'en') => {
    document.cookie = `dilinh-locale=${lang}; path=/; max-age=31536000`;
    window.location.reload();
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">{t('admin.settings.title')} ⚙️</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Cấu hình mặc định cho toàn platform</p>
      </div>

      {/* Appearance & Language */}
      <Card style={{ padding: 'var(--space-6)' }}>
        <h3 className="font-bold text-[var(--color-text)] mb-4">🎨 {t('admin.settings.appearance')} & {t('admin.settings.language')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Theme Toggle */}
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wider">{t('admin.settings.appearance')}</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setTheme('light')}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${theme === 'light' ? 'bg-[var(--color-primary)] text-white border-transparent' : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-bg)]'}`}
              >
                {t('admin.settings.light')} ☀️
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${theme === 'dark' ? 'bg-[var(--color-primary)] text-white border-transparent' : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-bg)]'}`}
              >
                {t('admin.settings.dark')} 🌙
              </button>
              <button 
                onClick={() => setTheme('system')}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${theme === 'system' ? 'bg-[var(--color-primary)] text-white border-transparent' : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-bg)]'}`}
              >
                {t('admin.settings.system')} 💻
              </button>
            </div>
          </div>

          {/* Language Toggle */}
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wider">{t('admin.settings.language')}</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setLanguage('vi')}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center gap-2 ${locale === 'vi' ? 'bg-[var(--color-primary)] text-white border-transparent' : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-bg)]'}`}
              >
                🇻🇳 Tiếng Việt
              </button>
              <button 
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center gap-2 ${locale === 'en' ? 'bg-[var(--color-primary)] text-white border-transparent' : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-bg)]'}`}
              >
                🇺🇸 English
              </button>
            </div>
          </div>

        </div>
      </Card>

      {/* Default Loyalty Config */}
      <Card style={{ padding: 'var(--space-6)' }}>
        <h3 className="font-bold text-gray-900 mb-4">📊 Cấu hình Loyalty mặc định</h3>
        <p className="text-sm text-gray-500 mb-4">Thiết lập mẫu loyalty config mặc định khi tạo quán mới.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Công thức tích điểm</p>
            <p className="text-sm font-medium text-gray-900">Mỗi 10.000₫ = 1 điểm</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Cách tính giảm giá</p>
            <p className="text-sm font-medium text-gray-900">Lấy mức cao nhất (take_highest)</p>
          </div>
        </div>
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-3">Hạng thành viên mặc định</p>
          <div className="flex flex-wrap gap-3">
            {[
              { name: 'Thành viên', points: 0, discount: '0%', color: '#9CA3AF' },
              { name: 'Bạc', points: 100, discount: '3%', color: '#6B7280' },
              { name: 'Vàng', points: 500, discount: '5%', color: '#F59E0B' },
              { name: 'Kim cương', points: 2000, discount: '10%', color: '#8B5CF6' },
            ].map(rank => (
              <div key={rank.name} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
                <div className="w-3 h-3 rounded-full" style={{ background: rank.color }} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{rank.name}</p>
                  <p className="text-xs text-gray-400">{rank.points} điểm · Giảm {rank.discount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Subscription Tier Limits */}
      <Card style={{ padding: 'var(--space-6)' }}>
        <h3 className="font-bold text-gray-900 mb-4">💳 Giới hạn Gói cước</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase">
                <th className="pb-3 font-semibold">Tính năng</th>
                <th className="pb-3 font-semibold text-center">Free</th>
                <th className="pb-3 font-semibold text-center">Pro (299k)</th>
                <th className="pb-3 font-semibold text-center">Premium (599k)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { feature: 'Số bàn', free: '5', pro: 'Không giới hạn', premium: 'Không giới hạn' },
                { feature: 'Số món', free: 'Không giới hạn', pro: 'Không giới hạn', premium: 'Không giới hạn' },
                { feature: 'Tùy biến thương hiệu', free: '❌', pro: '✅', premium: '✅' },
                { feature: 'Khuyến mãi nâng cao', free: '❌', pro: '✅', premium: '✅' },
                { feature: 'Báo cáo doanh thu', free: 'Cơ bản', pro: 'Đầy đủ', premium: 'Đầy đủ + Export' },
                { feature: 'OTP đăng nhập', free: '❌', pro: '❌', premium: '✅' },
                { feature: 'Hỗ trợ', free: 'Community', pro: 'Zalo', premium: '24/7 ưu tiên' },
              ].map(row => (
                <tr key={row.feature} className="hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-900">{row.feature}</td>
                  <td className="py-3 text-center text-gray-600">{row.free}</td>
                  <td className="py-3 text-center text-gray-600">{row.pro}</td>
                  <td className="py-3 text-center text-gray-600">{row.premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* System Info */}
      <Card style={{ padding: 'var(--space-6)' }}>
        <h3 className="font-bold text-gray-900 mb-4">ℹ️ Thông tin Hệ thống</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Phiên bản</span>
            <span className="font-mono font-semibold text-gray-900">1.0.0-beta</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Môi trường</span>
            <span className="font-mono font-semibold text-amber-600">Mock / Development</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Framework</span>
            <span className="font-mono font-semibold text-gray-900">Next.js 16</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Database</span>
            <span className="font-mono font-semibold text-gray-900">Supabase (PostgreSQL)</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

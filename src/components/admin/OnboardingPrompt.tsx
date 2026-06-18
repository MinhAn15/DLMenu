'use client';

import React, { useState } from 'react';
import { createInitialShop } from '@/lib/actions/shopAdmin';

export default function OnboardingPrompt() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    
    // Convert to slug: lowercase, remove accents, replace spaces with hyphens, remove non-alphanumeric
    const newSlug = newName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    setSlug(newSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    setLoading(true);
    setError('');

    const res = await createInitialShop(name, slug);
    
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
    // If success, the revalidatePath in server action will refresh the layout,
    // causing this component to unmount and the dashboard to show up!
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto py-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--color-primary)] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏪</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chào mừng Chủ Quán!</h2>
          <p className="text-gray-500">Hãy khởi tạo cửa hàng đầu tiên của bạn để bắt đầu nhận đơn.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên cửa hàng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="VD: Cà Phê Mai"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đường dẫn (Slug) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <span className="bg-gray-50 border border-gray-300 border-r-0 rounded-l-lg px-3 py-2 text-gray-500 text-sm whitespace-nowrap">
                dilinhmenu.com/s/
              </span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="ca-phe-mai"
                className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Đường dẫn khách dùng để quét QR hoặc truy cập quán.</p>
          </div>

          <button
            type="submit"
            disabled={loading || !name || !slug}
            className="w-full py-3 px-4 bg-[var(--color-primary)] hover:bg-[#5A361F] text-white font-medium rounded-lg shadow-md transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang khởi tạo...
              </>
            ) : (
              'Bắt đầu kinh doanh 🚀'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

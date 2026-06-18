'use client';

import React, { useState } from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import type { Profile, UserRole } from '@/lib/types/database';

const roleLabels: Record<UserRole, string> = {
  platform_admin: 'Platform Admin',
  shop_owner: 'Chủ quán',
  customer: 'Khách hàng',
};

const roleColors: Record<UserRole, string> = {
  platform_admin: '#7C3AED',
  shop_owner: '#2563EB',
  customer: '#6B7280',
};

export default function PlatformUsersPage() {
  const { shops, users: dbUsers } = useAdminData();
  const [users, setUsers] = useState<any[]>([]);

  React.useEffect(() => {
    if (dbUsers.length > 0 && users.length === 0) {
      setUsers(dbUsers);
    }
  }, [dbUsers, users.length]);

  const [roleChangeUser, setRoleChangeUser] = useState<Profile | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('customer');
  const [assignShopId, setAssignShopId] = useState('');

  const handleRoleChange = () => {
    if (!roleChangeUser) return;
    setUsers(prev => prev.map(u => u.id === roleChangeUser.id ? { ...u, role: newRole } : u));
    if (newRole === 'shop_owner') {
      if (!assignShopId) { toast.error('Chọn quán để gán'); return; }
      const shop = shops.find(s => s.id === assignShopId);
      toast.success(`Đã gán "${roleChangeUser.display_name}" làm chủ quán "${shop?.name}"`);
    } else {
      toast.success(`Đã đổi role của "${roleChangeUser.display_name}" thành ${roleLabels[newRole]}`);
    }
    setRoleChangeUser(null);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Người dùng 👤</h1>
        <p className="text-sm text-gray-500">
          {users.length} người dùng · {users.filter(u => u.role === 'shop_owner').length} chủ quán · {users.filter(u => u.role === 'customer').length} khách hàng
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold">Người dùng</th>
              <th className="p-4 font-semibold">SĐT</th>
              <th className="p-4 font-semibold">Vai trò</th>
              <th className="p-4 font-semibold">Ngày đăng ký</th>
              <th className="p-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: roleColors[user.role as keyof typeof roleColors] || '#9ca3af' }}>
                      {(user.display_name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{user.display_name || 'Chưa đặt tên'}</p>
                      <p className="text-xs text-gray-400">ID: {user.id.substring(0, 12)}...</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-mono text-sm text-gray-600">{user.phone}</td>
                <td className="p-4">
                  <Badge style={{ backgroundColor: roleColors[user.role as keyof typeof roleColors] || '#9ca3af', color: 'white', fontSize: '11px' }}>
                    {roleLabels[user.role as keyof typeof roleLabels] || 'Người dùng'}
                  </Badge>
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString('vi-VN')}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => { setRoleChangeUser(user); setNewRole(user.role); setAssignShopId(''); }}
                    className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
                    title="Đổi vai trò"
                  >
                    🔑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role Change Modal */}
      <Modal isOpen={!!roleChangeUser} onClose={() => setRoleChangeUser(null)} title={`Đổi vai trò: ${roleChangeUser?.display_name}`}>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Vai trò mới</label>
            <select value={newRole} onChange={e => setNewRole(e.target.value as UserRole)} className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer">
              <option value="customer">Khách hàng</option>
              <option value="shop_owner">Chủ quán</option>
              <option value="platform_admin">Platform Admin</option>
            </select>
          </div>

          {newRole === 'shop_owner' && (
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Gán cho quán</label>
              <select value={assignShopId} onChange={e => setAssignShopId(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer">
                <option value="">-- Chọn quán --</option>
                {(shops as any[]).filter(s => s.status === 'active' || s.is_active).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <Button onClick={handleRoleChange} fullWidth>💾 Lưu thay đổi</Button>
        </div>
      </Modal>
    </div>
  );
}

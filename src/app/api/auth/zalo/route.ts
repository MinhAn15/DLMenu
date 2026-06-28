import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get('redirect_to') || '/';

  // Trong thực tế, đây là bước redirect tới Zalo OAuth & xử lý Callback.
  // Ở bản Demo, ta tự động giả lập kết quả thành công.

  const mockZaloUser = {
    id: `zalo_${Math.floor(Math.random() * 1000000)}`,
    name: 'Khách VIP (Zalo)',
    phone: '0901234567',
    role: 'customer'
  };

  // Set session cookie để Frontend & tRPC đọc
  cookies().set('dilinh-mock-user', JSON.stringify({
    id: mockZaloUser.id,
    email: mockZaloUser.phone + '@zalo.me', // Fake email for Supabase compatibility
    display_name: mockZaloUser.name,
    role: mockZaloUser.role
  }), {
    path: '/',
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 7,
  });

  // Redirect về trang Menu hoặc giỏ hàng ban đầu
  return NextResponse.redirect(new URL(redirectTo, request.url));
}

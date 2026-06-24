import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const { email, password, shopName } = await req.json();

    if (!email || !password || !shopName) {
      return NextResponse.json({ error: 'Vui lòng nhập đủ thông tin' }, { status: 400 });
    }

    // 1. Create user in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto confirm for now
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || 'Lỗi tạo tài khoản' }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Create Shop
    const { data: shopData, error: shopError } = await supabaseAdmin
      .from('shops')
      .insert({ name: shopName })
      .select()
      .single();

    if (shopError || !shopData) {
      // Rollback user if shop creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: 'Lỗi tạo cửa hàng' }, { status: 500 });
    }

    // 3. Link User to Shop with role 'admin'
    const { error: linkError } = await supabaseAdmin
      .from('shop_users')
      .insert({
        shop_id: shopData.id,
        user_id: userId,
        role: 'admin',
      });

    if (linkError) {
      // Rollback both if link fails
      await supabaseAdmin.from('shops').delete().eq('id', shopData.id);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: 'Lỗi cấp quyền quản trị' }, { status: 500 });
    }

    return NextResponse.json({ success: true, shop: shopData });
  } catch (error: unknown) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Lỗi hệ thống nội bộ' }, { status: 500 });
  }
}

'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createInitialShop(name: string, slug: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Chưa đăng nhập' };
    }

    const { data, error } = await supabase
      .from('shops')
      .insert({
        owner_id: user.id,
        name,
        slug,
      })
      .select('id')
      .single();

    if (error) {
      if (error.code === '23505') { // unique violation
        return { error: 'Đường dẫn (slug) này đã tồn tại, vui lòng chọn tên khác.' };
      }
      return { error: error.message };
    }

    // Update profile role to shop_owner
    await supabase
      .from('profiles')
      .update({ role: 'shop_owner' })
      .eq('id', user.id);

    revalidatePath('/admin', 'layout');
    return { success: true, shopId: data.id };
  } catch (err) {
    return { error: 'Lỗi không xác định khi tạo quán' };
  }
}

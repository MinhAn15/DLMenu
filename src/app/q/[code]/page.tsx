import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function QrRedirectPage({ params }: { params: { code: string } }) {
  // Wait for the cookies API
  const supabase = await createServerSupabaseClient();
  
  // Find table by short_code
  const { data: table, error } = await supabase
    .from('shop_tables')
    .select('*, shops(slug)')
    .eq('short_code', params.code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !table || !table.shops) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7]">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Mã QR Không Hợp Lệ</h1>
          <p className="text-gray-600">Bàn này không tồn tại hoặc đã ngừng hoạt động.</p>
        </div>
      </div>
    );
  }

  // Redirect to the shop's table page
  // @ts-ignore
  redirect(`/s/${table.shops.slug}/t/${table.table_number}`);
}

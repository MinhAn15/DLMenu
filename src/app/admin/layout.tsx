import React from 'react';
import Sidebar from '@/components/admin/Sidebar';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OnboardingPrompt from '@/components/admin/OnboardingPrompt';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Use a try-catch in case of cookies or auth issues
  let shop = null;
  let hasUser = false;
  
  try {
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      hasUser = true;
      shop = { id: 'mock-shop-123' }; // Mock shop for layout
    } else {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        hasUser = true;
        const { data } = await supabase
          .from('shops')
          .select('id')
          .eq('owner_id', user.id)
          .limit(1);
        shop = data?.[0] || null;
      }
    }
  } catch (error) {
    console.error("AdminLayout error:", error);
  }

  if (!hasUser) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      {shop && <Sidebar />}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {shop ? children : <OnboardingPrompt />}
        </div>
      </main>
    </div>
  );
}

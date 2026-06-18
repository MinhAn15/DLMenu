import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  
  const supabase = await createServerSupabaseClient();
  const { data: shop } = await supabase
    .from('shops')
    .select('name, description, logo_url, cover_image_url')
    .eq('slug', resolvedParams.slug)
    .single();

  if (!shop) {
    return {
      title: 'Không tìm thấy quán | DiLinhMenu',
    };
  }

  const title = `${shop.name} | Menu Điện Tử`;
  const description = shop.description || `Xem menu và đặt món trực tuyến tại ${shop.name} qua hệ thống DiLinhMenu.`;
  const ogImage = shop.cover_image_url || shop.logo_url || '/images/shop_cover.webp';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: shop.name,
        },
      ],
      type: 'website',
      locale: 'vi_VN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

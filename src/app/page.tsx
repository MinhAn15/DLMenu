'use client';

import styles from './page.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Rocket, Smartphone, Trophy, ChartBar, Coffee, Beer, CupSoda, Soup, QrCode } from 'lucide-react';
import { LiveDemoBento } from '@/components/ui/LiveDemoBento';
import { SocialProofCarousel } from '@/components/ui/SocialProofCarousel';
import { InteractiveStepper } from '@/components/ui/InteractiveStepper';

const features = [
  {
    icon: <Trophy size={24} />,
    className: 'featAmber',
    title: 'Chương Trình Thành Viên',
    desc: 'Thay thế thẻ giấy truyền thống bằng hệ thống tích điểm điện tử. Khuyến khích khách hàng quay lại thường xuyên bằng các hạng mức ưu đãi.'
  },
  {
    icon: <Smartphone size={24} />,
    className: 'featIndigo',
    title: 'Trải Nghiệm Mượt Mà',
    desc: 'Giao diện gọi món tối ưu hóa cho mọi thiết bị di động. Giảm tải áp lực cho nhân viên phục vụ trong các khung giờ cao điểm.'
  },
  {
    icon: <ChartBar size={24} />,
    className: 'featGreen',
    title: 'Báo Cáo Trực Quan',
    desc: 'Kiểm soát số lượng đơn, mặt hàng bán chạy và biến động doanh thu theo thời gian thực từ bất kỳ đâu, ngay trên điện thoại.'
  }
];

const pricing = [
  {
    name: 'Gói Cơ Bản (Miễn phí)',
    price: '0₫',
    period: '/tháng',
    features: ['Phù hợp quán quy mô nhỏ', 'Tối đa 5 bàn', 'Thực đơn không giới hạn', 'Tích điểm cơ bản', 'Mã QR đặt món tiêu chuẩn'],
    popular: false,
    cta: 'Bắt đầu miễn phí',
  },
  {
    name: 'Gói Chuyên Nghiệp',
    price: '299.000₫',
    period: '/tháng',
    features: ['Quản lý bàn không giới hạn', 'Tùy biến nhận diện thương hiệu', 'Khuyến mãi & Voucher', 'Báo cáo doanh thu chi tiết', 'Hỗ trợ kỹ thuật 24/7'],
    popular: true,
    cta: 'Đăng ký ngay',
  },
];

export default function HomePage() {
  return (
    <>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.logoGroup}>
            <div className={styles.logoIconWrapper}>
              <Coffee size={18} />
            </div>
            DiLinhMenu
          </div>
          <div className={styles.navLinks}>
            <Link href="/login" className={styles.loginLink}>Đăng nhập</Link>
            <Link href="/register" className={styles.registerBtn}>Đăng ký quán</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className={`${styles.hero} pt-24`}>
        <div className={styles.container}>
          <motion.div 
            className={styles.heroContent}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className={styles.badge}><Coffee size={16} /> Phát triển dành riêng cho quán tại Di Linh</div>
            <h1 className={`${styles.title} max-w-2xl`}>
              Quản Lý Quán <span className="block md:inline">&nbsp;</span>
              <span className={styles.accent}>Chuyên Nghiệp & Đơn Giản</span>
            </h1>
            <p className={`${styles.subtitle} max-w-xl`}>
              Tối ưu hóa quy trình bán hàng với mã QR. Đơn hàng đồng bộ trực tiếp về quầy pha chế, doanh thu cập nhật tức thời trên điện thoại di động. Giải pháp đáng tin cậy giúp bạn vận hành dễ dàng hơn.
            </p>
            <div className={styles.ctas}>
              <Link href="/register" className={styles.ctaPrimary}>
                Bắt đầu miễn phí
              </Link>
              <a href="#how-it-works" className={styles.ctaSecondary}>
                Xem cách hoạt động
              </a>
            </div>
          </motion.div>
          
          <motion.div 
            className={styles.heroVisual}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            {/* Removed mockupWrapper constraint to allow Bento Box to expand fully */}
            <LiveDemoBento />
          </motion.div>
        </div>
      </main>

      {/* Social Proof Carousel */}
      <section className={styles.logos}>
        <p className={styles.logosTitle}>ĐƯỢC TIN DÙNG BỞI HƠN 50 CƠ SỞ KINH DOANH TẠI DI LINH</p>
        <SocialProofCarousel />
      </section>

      {/* How It Works */}
      <section id="how-it-works" className={styles.howItWorks}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Vận Hành Đơn Giản Trong 3 Bước</h2>
          <p className={styles.sectionSub}>Giảm thiểu công việc thủ công, tự động hóa quy trình đặt món để mang lại trải nghiệm chuyên nghiệp cho khách hàng.</p>
        </div>
        
        <div className="mt-12 w-full">
          <InteractiveStepper />
        </div>
      </section>

      {/* Features */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Nền Tảng Vững Chắc Cho Quán Của Bạn</h2>
          <p className={styles.sectionSub}>Trang bị đầy đủ các công cụ quản trị cấp doanh nghiệp (enterprise-grade) nhưng được tinh chỉnh để dễ dàng tiếp cận.</p>
        </div>
        
        <div className={styles.featGrid}>
          {features.map((feat, index) => (
            <div key={index} className={`${styles.featCard} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
              <div className={`${styles.featIcon} ${styles[feat.className as keyof typeof styles] || ''}`}>
                {feat.icon}
              </div>
              <h3 className={styles.featTitle}>{feat.title}</h3>
              <p className={styles.featDesc}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className={styles.pricing}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Lựa Chọn Phù Hợp Mọi Quy Mô</h2>
          <p className={styles.sectionSub}>Khởi đầu hoàn toàn miễn phí và chỉ nâng cấp khi hệ thống thực sự mang lại hiệu quả tăng trưởng cho cửa hàng.</p>
        </div>
        
        <div className={styles.priceGrid}>
          {pricing.map((plan, index) => (
            <div key={index} className={`${styles.priceCard} ${plan.popular ? styles.pricePopular : ''}`}>
              {plan.popular && <div className={styles.pricePopularBadge}>Được khuyên dùng</div>}
              <div className={styles.priceName}>{plan.name}</div>
              <div className={styles.priceAmount}>
                {plan.price}
                <span>{plan.period}</span>
              </div>
              <ul className={styles.priceFeatures}>
                {plan.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
              <Link href="/register" className={`${styles.ctaPrimary} ${styles.ctaPrimaryFullWidth}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.finalCta}>
        <div className={`${styles.sectionHeader} ${styles.sectionHeaderLargeMargin}`}>
          <h2 className={styles.sectionTitle}>Sẵn Sàng Chuyển Đổi Số Quán Của Bạn?</h2>
          <p className={styles.sectionSub}>Tham gia cùng hơn 50 chủ kinh doanh tại Di Linh đang sử dụng hệ thống của chúng tôi để tối ưu vận hành.</p>
        </div>
        <Link href="/register" className={styles.ctaPrimary}>
          Đăng ký hệ thống ngay
        </Link>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          DL<span className={styles.footerBrandAccent}>Menu</span>
        </div>
        <p className={styles.footerDescription}>
          Giải pháp công nghệ quản lý F&B chuyên nghiệp tại Di Linh.
        </p>
        <div className={styles.footerLinks}>
          <a href="#how-it-works">Quy trình</a>
          <a href="#features">Tính năng</a>
          <a href="#pricing">Chi phí</a>
          <a href="mailto:contact@dilinhmenu.vn">Hỗ trợ</a>
        </div>
        <p className={styles.footerCopyright}>
          © 2026 DiLinhMenu. Phục vụ với ☕ tại Di Linh.
        </p>
      </footer>
    </>
  );
}

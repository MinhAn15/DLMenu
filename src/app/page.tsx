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
    icon: <Trophy size={28} />,
    className: 'featAmber',
    title: 'Tích Điểm & Khách Hàng Thân Thiết',
    desc: 'Tự động tích điểm theo số điện thoại. Phân hạng Bạc – Vàng – Kim Cương. Khách quay lại thường xuyên hơn 40%.'
  },
  {
    icon: <Smartphone size={28} />,
    className: 'featAmber',
    title: 'Gọi Món Không Cần App',
    desc: 'Khách quét QR tại bàn, xem menu đẹp trên điện thoại và đặt ngay. Không cài đặt, không chờ đợi.'
  },
  {
    icon: <ChartBar size={28} />,
    className: 'featAmber',
    title: 'Dashboard Doanh Thu Realtime',
    desc: 'Theo dõi doanh thu, món bán chạy và biến động theo giờ ngay trên điện thoại. Ra quyết định nhanh hơn mỗi ngày.'
  }
];

const pricing = [
  {
    name: 'Miễn phí',
    price: '0₫',
    period: '/tháng',
    features: ['Quản lý tối đa 5 bàn', 'Menu không giới hạn', 'QR đặt món cơ bản', 'Tích điểm khách hàng', 'Báo cáo doanh thu ngày'],
    popular: false,
    cta: 'Dùng thử ngay',
  },
  {
    name: 'Chuyên Nghiệp',
    price: '299.000₫',
    period: '/tháng',
    features: ['Bàn không giới hạn', 'Thương hiệu riêng trên menu', 'Khuyến mãi & Voucher', 'Báo cáo chi tiết theo giờ', 'Hỗ trợ kỹ thuật 24/7'],
    popular: true,
    cta: 'Nâng cấp ngay',
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
      <main className={styles.hero}>
        <div className={styles.container}>
          <motion.div 
            className={styles.heroContent}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className={styles.badge}><Coffee size={16} /> Giải pháp F&B #1 tại Di Linh</div>
            <h1 className={`${styles.title}`}>
              <span className={styles.titleLine1}>Quản lý quán thông minh</span>
              <span className={styles.titleLine2}>Vận hành.</span>
              <span className={styles.titleLine3}>Siêu tốc.</span>
            </h1>
            <p className={styles.subtitle}>
              Khách quét QR → đặt món → bếp nhận đơn tức thì. Không cần app, không cần nhân viên ghi order. Đã có hơn 50 quán tại Di Linh tin dùng.
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
        <div className={styles.howItWorksHeader}>
          <h2 className={styles.giantTitle}>
            Vận Hành <br />
            <span className={styles.giantTitleHighlight}>Siêu Tốc.</span>
          </h2>
          <p className={styles.giantSub}>
            Chỉ với 3 bước, tự động hóa hoàn toàn quy trình đặt món để mang lại trải nghiệm chuyên nghiệp không sai sót cho khách hàng.
          </p>
        </div>
        
        <div className={styles.howItWorksContent}>
          <InteractiveStepper />
        </div>
      </section>

      {/* Features */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Tất cả trong một nền tảng</h2>
          <p className={styles.sectionSub}>Công cụ quản trị cấp doanh nghiệp, thiết kế đơn giản để ai cũng dùng được ngay.</p>
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
          <h2 className={styles.sectionTitle}>Đơn giản, minh bạch, không phí ẩn</h2>
          <p className={styles.sectionSub}>Bắt đầu miễn phí, nâng cấp khi bạn sẵn sàng.</p>
        </div>
        
        <div className={styles.priceGrid}>
          {pricing.map((plan, index) => (
            <div key={index} className={`${styles.priceCard} ${plan.popular ? styles.pricePopular : ''}`}>
              {plan.popular && <div className={styles.pricePopularBadge}>Phổ biến nhất</div>}
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
          <h2 className={styles.sectionTitle}>Bắt đầu miễn phí, ngay hôm nay</h2>
          <p className={styles.sectionSub}>
            Ưu đãi đặc quyền: <strong>3 tháng tính năng cao cấp</strong> cho <span className={styles.highlightBadge}>10 quán đầu tiên</span>
          </p>
        </div>
        <Link href="/register" className={styles.ctaPrimary}>
          Đăng Ký Nhận Ưu Đãi
        </Link>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          DiLinh<span className={styles.footerBrandAccent}>Menu</span>
        </div>
        <p className={styles.footerDescription}>
          Nền tảng quản lý quán thông minh — được xây dựng tại Di Linh, cho Di Linh.
        </p>
        <div className={styles.footerLinks}>
          <a href="#how-it-works">Quy trình</a>
          <a href="#features">Tính năng</a>
          <a href="#pricing">Bảng giá</a>
          <a href="mailto:contact@dilinhmenu.vn">Liên hệ</a>
        </div>
        <p className={styles.footerCopyright}>
          © 2026 DiLinhMenu. Crafted with ☕ in Di Linh.
        </p>
      </footer>
    </>
  );
}

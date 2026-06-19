'use client';

import styles from './page.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Rocket, Smartphone, Trophy, ChartBar, Coffee, Beer, CupSoda, Soup } from 'lucide-react';

const steps = [
  {
    num: '1',
    title: 'Khách quét QR tại bàn',
    desc: 'Không cần tải App, khách quét mã QR để mở Menu tức thì.',
  },
  {
    num: '2',
    title: 'Chọn món & Tích điểm',
    desc: 'Trải nghiệm chọn món cực mượt, tự động nhận biết khách quen để tích điểm.',
  },
  {
    num: '3',
    title: 'Quán nhận đơn ngay lập tức',
    desc: 'Đơn hàng tự động báo về Dashboard quản lý, không lo nhầm món hay sót bill.',
  },
];

const features = [
  {
    icon: <Trophy size={24} />,
    bg: '#FEF3C7', // amber-100
    color: '#D97706', // amber-600
    title: 'Tích Điểm Tự Động',
    desc: 'Tích điểm theo Số điện thoại, tự động lên hạng thành viên. Giữ chân khách hàng quay lại quán liên tục.'
  },
  {
    icon: <Smartphone size={24} />,
    bg: '#E0E7FF', // indigo-100
    color: '#4338CA', // indigo-700
    title: 'Quét Là Dùng',
    desc: 'Menu hoạt động siêu mượt, khách chỉ cần quét mã là gọi món, không bắt ép khách phải tải App rườm rà.'
  },
  {
    icon: <ChartBar size={24} />,
    bg: '#DCFCE7', // green-100
    color: '#15803D', // green-700
    title: 'Dashboard Quản Trị',
    desc: 'Báo cáo doanh thu, món bán chạy, quản lý đơn hàng ngay lập tức. Mọi thứ trên một màn hình duy nhất.'
  }
];

const pricing = [
  {
    name: 'Gói Mở Quán (Miễn phí mãi mãi)',
    price: '0₫',
    period: '/tháng',
    features: ['Quản lý 1 cửa hàng', 'Tối đa 5 bàn', 'Menu không giới hạn', 'Tích điểm cơ bản', 'Mã QR đặt món tiêu chuẩn'],
    popular: false,
    cta: 'Bắt đầu miễn phí ngay',
  },
  {
    name: 'Gói Chuyên Nghiệp',
    price: '299.000₫',
    period: '/tháng',
    features: ['Quản lý 1 cửa hàng', 'Số bàn không giới hạn', 'Tùy biến thương hiệu', 'Khuyến mãi nâng cao (Flash sale, v.v)', 'Báo cáo doanh thu chi tiết', 'Hỗ trợ kỹ thuật 24/7'],
    popular: true,
    cta: 'Đăng ký ngay',
  },
];

export default function HomePage() {
  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container-wide py-4 flex justify-between items-center">
          <div className="font-heading font-bold text-xl text-[var(--color-primary)] flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white shadow-sm">
              <Coffee size={18} />
            </div>
            DiLinhMenu
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-[var(--color-primary)] transition-colors">Đăng nhập</Link>
            <Link href="/register" className="text-sm font-semibold bg-[var(--color-primary)] text-white px-4 py-2 rounded-full shadow-sm hover:bg-[var(--color-primary-dark)] transition-colors">Đăng ký quán</Link>
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
            <div className={styles.badge}><Coffee size={16} /> Thiết kế riêng cho Di Linh</div>
            <h1 className={`${styles.title} max-w-2xl`}>
              Quản Lý Quán <span className="block md:inline"></span>
              <span className={styles.accent}>Đơn Giản & Mộc Mạc</span>
            </h1>
            <p className={`${styles.subtitle} max-w-xl`}>
              Giải pháp quản lý quán cà phê, nhà hàng được thiết kế riêng cho người Di Linh. Đơn giản, mộc mạc, hiệu quả ngay trong ngày đầu. Tích hợp QR gọi món & Tích điểm thông minh.
            </p>
            <div className={styles.ctas}>
              <Link href="/register" className={styles.ctaPrimary}>
                Đăng ký dùng thử miễn phí
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
            <div className={styles.mockupWrapper}>
              <div className={styles.mockupScreen}>
                {/* CSS based UI mockup instead of image */}
                <div className="flex flex-col h-full bg-slate-50">
                  <div className="bg-[var(--color-primary)] h-32 p-4 rounded-b-3xl shadow-sm text-white relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">Cà phê Mai</h3>
                        <p className="text-xs opacity-80">Bàn 01</p>
                      </div>
                      <div className="bg-white/20 p-2 rounded-full"><Coffee size={16} /></div>
                    </div>
                  </div>
                  <div className="flex-1 p-4 -mt-10">
                    <div className="bg-white rounded-xl shadow-sm p-3 mb-3 flex items-center gap-3">
                      <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700">☕</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">Cà Phê Sữa Đá</h4>
                        <p className="text-xs text-gray-500">25.000đ</p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold">+</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-3 mb-3 flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-700">🧋</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">Trà Đào Cam Sả</h4>
                        <p className="text-xs text-gray-500">35.000đ</p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold">+</div>
                    </div>
                  </div>
                  <div className="bg-white p-4 border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-t-3xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-sm">Tổng cộng</span>
                      <span className="font-bold text-[var(--color-primary)]">60.000đ</span>
                    </div>
                    <div className="w-full bg-[var(--color-primary)] text-white text-center py-3 rounded-xl font-bold text-sm shadow-md">Đặt Món Ngay</div>
                  </div>
                </div>
              </div>
            </div>
            
            <motion.div 
              className={styles.mockupQr}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <div className={styles.qrIcon}><Smartphone size={24} /></div>
              <div className={styles.qrLabel}>QUÉT ĐỂ ĐẶT MÓN</div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Social Proof / Logos */}
      <section className={styles.logos}>
        <p className={styles.logosTitle}>ĐƯỢC TIN DÙNG BỞI HƠN 50+ QUÁN TẠI DI LINH</p>
        <div className={styles.logoGrid}>
          <span className="flex items-center gap-2 font-medium text-slate-700"><Coffee size={20} /> Cà Phê Mai</span>
          <span className="flex items-center gap-2 font-medium text-slate-700"><Beer size={20} /> Quán Nhậu Ba Miền</span>
          <span className="flex items-center gap-2 font-medium text-slate-700"><CupSoda size={20} /> Trà Sữa Hoa Hồng</span>
          <span className="flex items-center gap-2 font-medium text-slate-700"><Soup size={20} /> Phở Gia Truyền</span>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className={styles.howItWorks}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Chỉ Với 3 Bước Đơn Giản</h2>
          <p className={styles.sectionSub}>Không tải App, không đăng ký rườm rà. Mang lại trải nghiệm đặt món cực kỳ dễ chịu cho khách hàng của bạn.</p>
        </div>
        
        <div className={styles.stepsGrid}>
          {steps.map((step, index) => (
            <div key={index} className={styles.stepCard}>
              <div className={styles.stepNum}>{step.num}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Lợi Ích Vượt Trội</h2>
          <p className={styles.sectionSub}>Tất cả những công cụ bạn cần để vận hành chuyên nghiệp như một chuỗi cửa hàng lớn.</p>
        </div>
        
        <div className={styles.featGrid}>
          {features.map((feat, index) => (
            <div key={index} className={`${styles.featCard} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
              <div className={styles.featIcon} style={{ background: feat.bg, color: feat.color }}>
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
          <h2 className={styles.sectionTitle}>Bảng Giá Minh Bạch</h2>
          <p className={styles.sectionSub}>Đầu tư nhỏ, sinh lời lớn. Miễn phí hoàn toàn để bạn có thể trải nghiệm ngay hôm nay.</p>
        </div>
        
        <div className={styles.priceGrid}>
          {pricing.map((plan, index) => (
            <div key={index} className={`${styles.priceCard} ${plan.popular ? styles.pricePopular : ''}`}>
              {plan.popular && <div className={styles.pricePopularBadge}>Được ưu chuộng nhất</div>}
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
              <Link href="/register" className={styles.ctaPrimary} style={{ width: '100%', justifyContent: 'center' }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.finalCta}>
        <div className={styles.sectionHeader} style={{ marginBottom: '40px' }}>
          <h2 className={styles.sectionTitle}>Sẵn Sàng Nâng Tầm Quán Của Bạn?</h2>
          <p className={styles.sectionSub}>Tham gia cùng 50+ chủ quán khác đang sử dụng DiLinhMenu để tăng trưởng doanh thu.</p>
        </div>
        <Link href="/register" className={styles.ctaPrimary}>
          Bắt đầu miễn phí ngay
        </Link>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          DL<span style={{ color: '#F5A623' }}>Menu</span>
        </div>
        <p style={{ color: '#9CA3AF', marginBottom: '24px' }}>
          Giải pháp công nghệ F&B số 1 tại Di Linh.
        </p>
        <div className={styles.footerLinks}>
          <a href="#how-it-works">Cách hoạt động</a>
          <a href="#features">Tính năng</a>
          <a href="#pricing">Bảng giá</a>
          <a href="mailto:contact@dilinhmenu.vn">Liên hệ</a>
        </div>
        <p style={{ marginTop: '40px', fontSize: '0.875rem', color: '#6B7280' }}>
          © 2026 DiLinhMenu. Phục vụ với ☕ tại Di Linh.
        </p>
      </footer>
    </>
  );
}

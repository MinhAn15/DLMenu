import styles from './page.module.css';
import Link from 'next/link';

const features = [
  {
    icon: '📱',
    bg: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
    title: 'QR Code Đặt Món',
    desc: 'Khách quét mã QR trên bàn → Xem menu → Đặt ngay. Không cần tải app, không cần gọi nhân viên.',
  },
  {
    icon: '🏆',
    bg: 'linear-gradient(135deg, #F3E5F5, #E1BEE7)',
    title: 'Tích Điểm Tự Động',
    desc: '4 hạng thành viên (Thành viên → Kim cương). Khách tích điểm, nhận giảm giá theo hạng.',
  },
  {
    icon: '⚡',
    bg: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)',
    title: 'Nhận Đơn Realtime',
    desc: 'Đơn hàng hiện trên dashboard quản lý ngay lập tức. Cập nhật trạng thái 1 click.',
  },
  {
    icon: '🎨',
    bg: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
    title: 'Tùy Biến Thương Hiệu',
    desc: 'Đổi logo, màu sắc, menu theo phong cách riêng của quán. Mỗi quán một giao diện.',
  },
  {
    icon: '📊',
    bg: 'linear-gradient(135deg, #FFF9C4, #FFF176)',
    title: 'Phân Tích Doanh Thu',
    desc: 'Dashboard tổng quan: doanh thu, đơn hàng, khách hàng mới, biểu đồ 7 ngày.',
  },
  {
    icon: '🎁',
    bg: 'linear-gradient(135deg, #FCE4EC, #F8BBD0)',
    title: 'Khuyến Mãi Linh Hoạt',
    desc: 'Flash sale, giảm giá theo khung giờ, mua 1 tặng 1. Tạo chương trình trong vài click.',
  },
];

const pricing = [
  {
    name: 'Miễn Phí',
    price: '0₫',
    period: '/tháng',
    features: ['1 cửa hàng', 'Lên đến 5 bàn', 'Menu không giới hạn', 'Tích điểm cơ bản', 'QR Code đặt món'],
    popular: false,
  },
  {
    name: 'Pro',
    price: '299.000₫',
    period: '/tháng',
    features: ['1 cửa hàng', 'Bàn không giới hạn', 'Tùy biến thương hiệu', 'Khuyến mãi nâng cao', 'Báo cáo doanh thu', 'Hỗ trợ qua Zalo'],
    popular: true,
  },
  {
    name: 'Premium',
    price: '599.000₫',
    period: '/tháng',
    features: ['Nhiều cửa hàng', 'Tất cả tính năng Pro', 'OTP đăng nhập khách', 'API tích hợp', 'Hỗ trợ ưu tiên 24/7', 'Tùy biến không giới hạn'],
    popular: false,
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <main className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.badge}>☕ Nền tảng #1 cho quán cà phê tại Di Linh</div>
          <h1 className={styles.title}>
            Quét QR. Đặt Món.<br />
            <span className={styles.accent}>Tích Điểm Tự Động.</span>
          </h1>
          <p className={styles.subtitle}>
            DiLinhMenu giúp quán cà phê & nhà hàng số hóa quy trình đặt món, tự động hóa chăm sóc khách hàng, và tăng doanh thu với hệ thống loyalty thông minh.
          </p>
          <div className={styles.ctas}>
            <Link href="/login" className={styles.ctaPrimary}>
              Dùng thử miễn phí →
            </Link>
            <a href="#features" className={styles.ctaSecondary}>
              Xem tính năng
            </a>
          </div>

          {/* Stats */}
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statNum}>50+</div>
              <div className={styles.statLabel}>Quán đang dùng</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNum}>10.000+</div>
              <div className={styles.statLabel}>Đơn hàng/tháng</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNum}>99.9%</div>
              <div className={styles.statLabel}>Uptime</div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <h2 className={styles.sectionTitle}>Tính Năng Nổi Bật</h2>
        <p className={styles.sectionSub}>
          Mọi thứ bạn cần để vận hành quán thông minh hơn, phục vụ nhanh hơn, và giữ chân khách hàng hiệu quả hơn.
        </p>
        <div className={styles.featGrid}>
          {features.map((feat, i) => (
            <div key={i} className={styles.featCard}>
              <div className={styles.featIcon} style={{ background: feat.bg }}>
                {feat.icon}
              </div>
              <h3 className={styles.featTitle}>{feat.title}</h3>
              <p className={styles.featDesc}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={styles.pricing}>
        <h2 className={styles.sectionTitle}>Bảng Giá</h2>
        <p className={styles.sectionSub}>
          Bắt đầu miễn phí, nâng cấp khi quán phát triển. Không ràng buộc hợp đồng.
        </p>
        <div className={styles.priceGrid}>
          {pricing.map((plan, i) => (
            <div key={i} className={`${styles.priceCard} ${plan.popular ? styles.pricePopular : ''}`}>
              {plan.popular && <div className={styles.pricePopularBadge}>Phổ biến nhất</div>}
              <div className={styles.priceName}>{plan.name}</div>
              <div className={styles.priceAmount}>
                {plan.price}
                <span>{plan.period}</span>
              </div>
              <ul className={styles.priceFeatures}>
                {plan.features.map((f, j) => (
                  <li key={j}>{f}</li>
                ))}
              </ul>
              <Link href="/login" className={styles.ctaPrimary} style={{ width: '100%', justifyContent: 'center', fontSize: 'var(--font-size-base)', padding: 'var(--space-3) var(--space-6)' }}>
                {plan.popular ? 'Bắt đầu ngay' : 'Chọn gói'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          DiLinh<span style={{ color: '#F5A623' }}>Menu</span>
        </div>
        <p style={{ fontSize: 'var(--font-size-sm)' }}>
          Nền tảng quản lý quán cà phê & nhà hàng thông minh tại Di Linh, Lâm Đồng.
        </p>
        <div className={styles.footerLinks}>
          <a href="#features">Tính năng</a>
          <a href="#pricing">Bảng giá</a>
          <a href="mailto:contact@dilinhmenu.vn">Liên hệ</a>
          <a href="tel:0901234567">Hotline: 090.123.4567</a>
        </div>
        <p style={{ marginTop: 'var(--space-6)', fontSize: 'var(--font-size-xs)' }}>
          © 2024 DiLinhMenu. Made with ☕ in Di Linh.
        </p>
      </footer>
    </>
  );
}

import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.hero}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          DiLinh<span className={styles.accent}>Menu</span>
        </h1>
        <p className={styles.subtitle}>
          Quét QR · Đặt món · Tích điểm
        </p>
        <p className={styles.description}>
          Nền tảng đặt món và chăm sóc khách hàng cho quán cà phê & quán nhậu tại Di Linh
        </p>
      </div>
    </main>
  );
}

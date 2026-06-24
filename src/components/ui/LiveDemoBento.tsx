'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '@/app/page.module.css';

// --- Mock Data ---
const MOCK_ITEMS = [
  { title: 'Cà phê Mai', sub: 'Cà phê sữa đá', price: 25, icon: '☕', color: 'iconAmber' },
  { title: 'Trà Đào Cam Sả', sub: 'Mang đi', price: 35, icon: '🧋', color: 'iconOrange' },
  { title: 'Trà Xanh Macchiato', sub: 'Tại bàn', price: 40, icon: '🍵', color: 'iconIndigo' },
  { title: 'Sữa Chua Trân Châu', sub: 'Ít đá', price: 30, icon: '🍨', color: 'iconIndigo' },
  { title: 'Sinh Tố Bơ', sub: 'Mang đi', price: 45, icon: '🥑', color: 'iconGreen' },
  { title: 'Cà Phê Muối', sub: 'Thêm kem', price: 30, icon: '☕', color: 'iconAmber' },
];

const TABLES = ['Bàn 01', 'Bàn 02', 'Bàn 03', 'Bàn 04', 'Bàn 05', 'Bàn 08', 'Bàn 12'];

type Order = {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  icon: string;
  color: string;
  time: string;
};

// Helper: Get random item from array
const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function LiveDemoBento() {
  const [orders, setOrders] = useState<Order[]>([
    { id: '1', title: 'Cà phê Mai', subtitle: 'Bàn 01 • Cà phê sữa đá', price: 25, icon: '☕', color: 'iconAmber', time: 'Vừa xong' },
    { id: '2', title: 'Trà Đào Cam Sả', subtitle: 'Bàn 04 • Mang đi', price: 35, icon: '🧋', color: 'iconOrange', time: '1 phút trước' },
    { id: '3', title: 'Trà Xanh Macchiato', subtitle: 'Bàn 02', price: 40, icon: '🍵', color: 'iconIndigo', time: '3 phút trước' },
  ]);

  const [revenue, setRevenue] = useState(2450); // initial simulated 2,450K
  const [pointsLog, setPointsLog] = useState<{id: string, table: string, pts: number} | null>(null);

  useEffect(() => {
    // Simulation Loop: every 6 seconds
    const interval = setInterval(() => {
      const item = randomItem(MOCK_ITEMS);
      const table = randomItem(TABLES);
      const isTakeaway = Math.random() > 0.7;
      const subtitle = isTakeaway ? `${table} • Mang đi` : `${table} • ${item.sub}`;
      const newPts = item.price; // 1K = 1pt logic
      
      const newOrder: Order = {
        id: Date.now().toString(),
        title: item.title,
        subtitle,
        price: item.price,
        icon: item.icon,
        color: item.color,
        time: 'Vừa xong',
      };

      setOrders((prev) => {
        // Shift times for old orders
        const shifted = prev.map((o, idx) => ({
          ...o,
          time: idx === 0 ? '1 phút trước' : idx === 1 ? '3 phút trước' : '5 phút trước'
        }));
        return [newOrder, ...shifted].slice(0, 3);
      });

      // Update Revenue
      setRevenue((prev) => prev + item.price);
      
      // Update Points Log for animation
      setPointsLog({ id: newOrder.id, table, pts: newPts });

      // Reset points log after 3s to return to default view if needed, or just keep latest
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Calculate dynamic growth percentage based on revenue
  const baseRevenue = 1975; // simulated yesterday revenue
  const growth = Math.round(((revenue - baseRevenue) / baseRevenue) * 100);

  return (
    <div className={`${styles.bentoContainer} relative`}>
      {/* Live Demo Badge */}
      <div className="absolute -top-4 right-4 z-10 flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm border border-emerald-200">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        Live Demo
      </div>

      {/* 1. Large Card: Dashboard (2x2) */}
      <div className={`${styles.bentoCard} ${styles.span2Cols} ${styles.span2Rows} overflow-hidden`}>
        <div className={styles.bentoLargeHeader}>
          <div>
            <h3 className={styles.bentoTitle}>Đơn hàng mới</h3>
            <p className={styles.bentoSubtitle}>Đồng bộ thời gian thực</p>
          </div>
          <div className={styles.bentoBadge}>
            <Activity size={12} className="mr-1 inline animate-pulse" />
            Hoạt động
          </div>
        </div>
        <div className={styles.bentoList}>
          <AnimatePresence initial={false}>
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, scale: 0.9 }}
                transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
                className={styles.bentoListItem}
              >
                <div className={`${styles.bentoIconBg} ${styles[order.color] || ''}`}>{order.icon}</div>
                <div className={styles.bentoListItemInfo}>
                  <div className="flex justify-between items-center w-full">
                    <h4 className={styles.bentoItemTitle}>{order.title}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">{order.time}</span>
                  </div>
                  <p className={styles.bentoItemSubtitle}>{order.subtitle}</p>
                </div>
                <span className={styles.bentoItemValue}>{order.price}K</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. Small Card: QR Code (1x1) */}
      <div className={`${styles.bentoCard} flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors`}>
        <h3 className={`${styles.bentoTitle} self-start`}>Hệ thống quét QR</h3>
        <motion.div 
          className={`${styles.bentoQrIcon} mt-2`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <QrCode size={40} strokeWidth={1.5} />
        </motion.div>
      </div>

      {/* 3. Small Card: Tích Điểm (1x1) */}
      <div className={`${styles.bentoCard} ${styles.bentoCardPrimary} overflow-hidden relative`}>
        <h3 className={styles.bentoCardPrimaryTitle}>Tích điểm thành viên</h3>
        <AnimatePresence mode="wait">
          {pointsLog ? (
            <motion.div
              key={pointsLog.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-1"
            >
              <p className="text-amber-100/90 text-[11px] font-medium leading-tight">Giao dịch thành công ({pointsLog.table})</p>
              <div className="text-2xl font-bold text-white tracking-tight mt-0.5">+{pointsLog.pts} pt</div>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-1"
            >
              <p className={styles.bentoCardPrimarySubtitle}>Thành viên hạng Vàng</p>
              <div className={styles.bentoCardPrimaryValue}>1,450 pt</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Medium Card: Doanh thu (2x1) */}
      <div className={`${styles.bentoCard} ${styles.span2Cols}`}>
        <h3 className={styles.bentoTitle}>Báo cáo doanh thu (24h)</h3>
        <div className="flex items-center gap-2 mb-3">
          <motion.p 
            key={growth}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"
          >
            +{growth}%
          </motion.p>
          <span className="text-xs text-slate-500 font-medium">so với hôm qua</span>
        </div>
        <div className={`${styles.bentoChart} items-end h-12`}>
          <div className={`${styles.bentoBar} ${styles.bar40}`}></div>
          <div className={`${styles.bentoBar} ${styles.bar60}`}></div>
          <div className={`${styles.bentoBar} ${styles.bar30}`}></div>
          <div className={`${styles.bentoBar} ${styles.bar80}`}></div>
          {/* Dynamic final bar height based on revenue */}
          <motion.div 
            className={`${styles.bentoBar} ${styles.bentoBarActive}`}
            initial={{ height: '60%' }}
            animate={{ height: `${Math.min(100, Math.max(60, (revenue / 4000) * 100))}%` }}
            transition={{ type: "spring", stiffness: 60 }}
          ></motion.div>
        </div>
      </div>
    </div>
  );
}

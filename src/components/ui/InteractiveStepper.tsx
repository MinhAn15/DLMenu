'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Star, Activity, Utensils } from 'lucide-react';
import styles from './InteractiveStepper.module.css';

const steps = [
  {
    id: 'step-1',
    title: 'Quét mã gọi món',
    desc: 'Khách hàng quét mã QR tại bàn để xem thực đơn và gọi món mà không cần tải thêm bất kỳ ứng dụng nào.',
    icon: QrCode
  },
  {
    id: 'step-2',
    title: 'Tích điểm tự động',
    desc: 'Đơn hàng được ghi nhận chính xác. Hệ thống tự động tích điểm theo số điện thoại để xây dựng tệp khách hàng thân thiết.',
    icon: Star
  },
  {
    id: 'step-3',
    title: 'Đồng bộ tức thì',
    desc: 'Đơn hàng lập tức hiển thị tại quầy pha chế, loại bỏ hoàn toàn rủi ro sai sót do ghi chép thủ công.',
    icon: Activity
  }
];

export function InteractiveStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div 
      className={styles.container}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left: Tabs List */}
      <div className={styles.tabsList}>
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const Icon = step.icon;
          return (
            <div 
              key={step.id}
              onClick={() => setActiveStep(index)}
              className={`${styles.tabItem} ${isActive ? styles.tabItemActive : ''}`}
            >
              {/* Progress Line */}
              <div className={`${styles.progressLine} ${isActive ? styles.progressLineActive : ''}`} />
              
              <div className={styles.tabHeader}>
                <div className={`${styles.iconBox} ${isActive ? styles.iconBoxActive : ''}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className={`${styles.title} ${isActive ? styles.titleActive : ''}`}>
                    {step.title}
                  </h3>
                  <div className={`${styles.descWrapper} ${isActive ? styles.descWrapperActive : ''}`}>
                    <p className={styles.desc}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: Mockup Window */}
      <div className={styles.mockupWindow}>
        {/* Background Decorative Pattern */}
        <div className={styles.pattern} />

        <AnimatePresence mode="wait">
          {activeStep === 0 && <MockupStep1 key="step1" />}
          {activeStep === 1 && <MockupStep2 key="step2" />}
          {activeStep === 2 && <MockupStep3 key="step3" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ==========================================
// MOCKUP COMPONENTS
// ==========================================

function MockupStep1() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={styles.m1Wrapper}
    >
      <div className={styles.m1Notch}></div>
      
      <div className={styles.m1Header}>
        <h4 className={styles.m1Title}>Cà Phê Mai</h4>
        <p className={styles.m1Sub}>Bàn số 04</p>
      </div>

      <div className={styles.m1QrBox}>
        <QrCode className={styles.m1QrIcon} />
        
        {/* Scanner line animation */}
        <motion.div 
          animate={{ y: [-10, 120, -10] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          className={styles.m1Scanner}
        />
      </div>
      
      <div className={styles.m1Footer}>
        <div className={styles.m1Btn}>
          Mở Thực Đơn
        </div>
      </div>
    </motion.div>
  );
}

function MockupStep2() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className={styles.m2Wrapper}
    >
      {/* VIP Card Mockup */}
      <div className={styles.m2Card}>
        <div className={styles.m2Glow1}></div>
        <div className={styles.m2Glow2}></div>
        
        <div className={styles.m2Header}>
          <div>
            <p className={styles.m2Label}>Thành viên hạng</p>
            <h4 className={styles.m2Tier}>Vàng (Gold)</h4>
          </div>
          <Star className={styles.m2Star} size={28} />
        </div>
        
        <div className={styles.m2Footer}>
          <p className={styles.m2PtsLabel}>Điểm tích lũy</p>
          <div className={styles.m2PtsValue}>
            1,450 <span className={styles.m2PtsUnit}>pt</span>
          </div>
        </div>
      </div>

      {/* Floating point notification */}
      <motion.div 
        initial={{ opacity: 0, y: 20, x: -20 }}
        animate={{ opacity: 1, y: -20, x: 0 }}
        transition={{ delay: 0.5, type: "spring" }}
        className={styles.m2Toast}
      >
        <div className={styles.m2ToastBadge}>
          +35
        </div>
        <div>
          <p className={styles.m2ToastTitle}>Giao dịch mới</p>
          <p className={styles.m2ToastDesc}>Cộng điểm thành công</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MockupStep3() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={styles.m3Wrapper}
    >
      {/* KDS Header */}
      <div className={styles.m3Header}>
        <h4 className={styles.m3Title}><Utensils size={14} /> Bếp & Pha Chế</h4>
        <div className={styles.m3Status}>
          <span className={styles.m3DotWrap}>
            <span className={styles.m3DotPing}></span>
            <span className={styles.m3Dot}></span>
          </span>
          <span className={styles.m3StatusText}>Online</span>
        </div>
      </div>
      
      {/* Order List */}
      <div className={styles.m3Body}>
        
        {/* New Order Animating In */}
        <motion.div 
          initial={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, x: 0, height: 'auto', marginBottom: 8 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
          className={styles.m3OrderNew}
        >
          <div className={styles.m3OrderHead}>
            <span className={styles.m3OrderTable}>Bàn 04</span>
            <span className={styles.m3OrderTimeNew}>Vừa xong</span>
          </div>
          <div className={styles.m3OrderItem}>
            <span>2x Cà phê sữa đá</span>
          </div>
          <div className={styles.m3OrderItem}>
            <span>1x Sinh tố bơ</span>
          </div>
        </motion.div>

        {/* Existing Order */}
        <div className={styles.m3OrderOld}>
          <div className={styles.m3OrderHead}>
            <span className={styles.m3OrderTable}>Bàn 12</span>
            <span className={styles.m3OrderTimeOld}>5 phút trước</span>
          </div>
          <div className={styles.m3OrderItemDone}>
            <span>1x Trà đào cam sả</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

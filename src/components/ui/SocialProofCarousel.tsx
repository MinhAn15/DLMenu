'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star } from 'lucide-react';
import styles from './SocialProofCarousel.module.css';

const merchants = [
  {
    name: 'Cà Phê Mai',
    type: 'Cà phê & Điểm tâm',
    image: '/images/cafe_mai.png',
    review: 'Quản lý dễ dàng hơn hẳn, khách rất thích vì gọi món nhanh.',
  },
  {
    name: 'Quán Nhậu Ba Miền',
    type: 'Nhà hàng ẩm thực',
    image: '/images/quan_nhau.png',
    review: 'Không còn bị sót bill giờ cao điểm, doanh thu tăng rõ rệt.',
  },
  {
    name: 'Trà Sữa Hoa Hồng',
    type: 'Đồ uống & Ăn vặt',
    image: '/images/tra_sua.png',
    review: 'Tích điểm cho học sinh rất tiện lợi, các em quay lại nhiều hơn.',
  },
  {
    name: 'Phở Gia Truyền',
    type: 'Quán ăn gia đình',
    image: '/images/pho.png',
    review: 'Bếp nhận đơn thẳng từ điện thoại khách, cực kỳ chính xác.',
  },
];

// Double the array for seamless infinite marquee
const duplicatedMerchants = [...merchants, ...merchants];

export function SocialProofCarousel() {
  return (
    <div className={styles.carouselContainer}>
      <div className={styles.carouselTrack}>
        {duplicatedMerchants.map((merchant, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.imageWrapper}>
              <Image 
                src={merchant.image} 
                alt={merchant.name} 
                fill 
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 300px"
              />
            </div>
            <div className={styles.cardContent}>
              <div className="flex items-center justify-between mb-1">
                <h4 className={styles.merchantName}>{merchant.name}</h4>
                <div className={styles.rating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={12} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className={styles.merchantType}>{merchant.type}</p>
              <p className={styles.review}>&ldquo;{merchant.review}&rdquo;</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

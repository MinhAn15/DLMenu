import React from 'react';
import styles from './Badge.module.css';
import { RANK_COLORS } from '@/lib/constants';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'rank';
  size?: 'sm' | 'md';
  rankColor?: 'member' | 'silver' | 'gold' | 'diamond';
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  rankColor,
  className = '',
}: BadgeProps) {
  const customStyle = variant === 'rank' && rankColor ? { backgroundColor: RANK_COLORS[rankColor], color: 'white' } : {};

  return (
    <span
      className={`${styles.badge} ${styles[variant]} ${styles[size]} ${className}`}
      style={customStyle}
    >
      {children}
    </span>
  );
}

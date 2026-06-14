import React from 'react';
import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export default function Spinner({ size = 'md', color, className = '' }: SpinnerProps) {
  const customStyle = color && color !== 'current' ? { borderTopColor: color, borderLeftColor: color } : {};
  
  return (
    <div
      className={`${styles.spinner} ${styles[size]} ${className}`}
      style={customStyle}
      role="status"
      aria-label="Loading"
    />
  );
}

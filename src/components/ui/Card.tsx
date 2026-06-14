import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'glass';
  className?: string;
}

export default function Card({
  children,
  padding = 'md',
  variant = 'default',
  className = '',
  ...props
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  };

  const bgClass = variant === 'glass' 
    ? 'glass' 
    : 'bg-[var(--color-surface)] shadow-[var(--shadow-sm)] border border-[var(--color-border-light)]';

  return (
    <div
      className={`rounded-[var(--radius-xl)] ${bgClass} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

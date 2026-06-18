import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  circle?: boolean;
}

export default function Skeleton({
  className = '',
  width,
  height,
  borderRadius = 'var(--radius-md)',
  circle = false,
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || '20px',
    borderRadius: circle ? '50%' : borderRadius,
    backgroundColor: 'var(--color-border-light)',
    backgroundImage: 'linear-gradient(90deg, var(--color-border-light) 0px, var(--color-bg) 40px, var(--color-border-light) 80px)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite linear',
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}} />
      <div className={className} style={style} />
    </>
  );
}

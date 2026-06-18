import React from 'react';
import Image from 'next/image';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-xl)] bg-[var(--color-surface)] relative">
      <div className="w-48 h-48 relative mb-6 mx-auto">
        <img 
          src="/images/empty_state.png" 
          alt="Empty State" 
          className="w-full h-full object-contain opacity-80 dark:opacity-60 grayscale hover:grayscale-0 transition-all duration-500 pointer-events-none" 
        />
      </div>
      <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">{title}</h3>
      <p className="text-[var(--color-text-secondary)] mb-6 max-w-md">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

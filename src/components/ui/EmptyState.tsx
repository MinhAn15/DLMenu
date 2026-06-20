import React from 'react';
import Image from 'next/image';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, actionLabel, onAction, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-xl)] bg-[var(--color-surface)] relative">
      <div className="w-48 h-48 relative mb-6 mx-auto pointer-events-none">
        <Image 
          src="/images/empty_state.webp" 
          alt="Empty State" 
          fill
          sizes="(max-width: 768px) 192px, 192px"
          className="object-contain opacity-80 dark:opacity-60 grayscale hover:grayscale-0 transition-all duration-500 pointer-events-none" 
        />
      </div>
      <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">{title}</h3>
      <p className="text-[var(--color-text-secondary)] mb-6 max-w-md">{description}</p>
      {action && <div>{action}</div>}
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="mt-4 px-6 py-3 bg-[var(--color-primary)] text-white font-semibold rounded-[var(--radius-md)] hover:brightness-110 transition-all shadow-md active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

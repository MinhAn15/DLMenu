'use client';

import React from 'react';
import { Camera, Aperture, Minus, Moon, Sun, Clock } from 'lucide-react';
import styles from './PresetCard.module.css';
import type { AiPresetId, StylePreset } from '@/lib/ai/types';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  Coffee: Camera,
  Aperture,
  Minus,
  Moon,
  Sun,
  Clock,
};

interface PresetCardProps {
  preset: StylePreset;
  isActive: boolean;
  onClick: (id: AiPresetId) => void;
}

export default function PresetCard({ preset, isActive, onClick }: PresetCardProps) {
  const IconComponent = ICON_MAP[preset.icon] || Camera;

  return (
    <button
      className={`${styles.card} ${isActive ? styles.active : ''}`}
      onClick={() => onClick(preset.id)}
      data-testid={`preset-card-${preset.id}`}
      data-active={isActive}
    >
      <span className={styles.iconWrapper}>
        <IconComponent size={20} />
      </span>
      <span className={styles.name}>{preset.name}</span>
      {isActive && <span className={styles.check}>✓</span>}
    </button>
  );
}

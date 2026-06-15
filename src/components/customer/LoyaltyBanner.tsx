'use client';

import React from 'react';
import type { UserShopMembership, LoyaltyConfig } from '@/lib/types/database';
import { getRankDisplayName, getPointsToNextRank } from '@/lib/utils/points';
import { RANK_COLORS, RANK_ICONS } from '@/lib/constants';

interface LoyaltyBannerProps {
  membership: UserShopMembership;
  loyaltyConfig: LoyaltyConfig;
}

export default function LoyaltyBanner({ membership, loyaltyConfig }: LoyaltyBannerProps) {
  const rankName = getRankDisplayName(membership.rank);
  const nextRankInfo = getPointsToNextRank(loyaltyConfig, membership.ranking_points);
  const rankColor = RANK_COLORS[membership.rank] || 'var(--color-text-muted)';
  const rankIcon = RANK_ICONS[membership.rank] || '👤';

  // Calculate progress
  const progress = nextRankInfo
    ? Math.min(100, ((membership.ranking_points) / (membership.ranking_points + nextRankInfo.pointsNeeded)) * 100)
    : 100;

  return (
    <div
      className="animate-fade-in"
      style={{
        background: `linear-gradient(135deg, ${rankColor}15, ${rankColor}08)`,
        border: `1px solid ${rankColor}30`,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        margin: '0 var(--space-4)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: '1.5rem' }}>{rankIcon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: rankColor }}>
              {rankName}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              {membership.ranking_points} điểm
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            Điểm đổi thưởng
          </div>
          <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
            {membership.redeemable_points}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {nextRankInfo && (
        <div>
          <div style={{
            width: '100%', height: '6px',
            background: 'rgba(0,0,0,0.08)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`, height: '100%',
              background: `linear-gradient(90deg, ${rankColor}, ${rankColor}CC)`,
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.5s ease',
            }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
            Còn {nextRankInfo.pointsNeeded} điểm → {nextRankInfo.nextRank}
          </div>
        </div>
      )}
    </div>
  );
}

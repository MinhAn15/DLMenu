import type { LoyaltyConfig, MemberRank } from '@/lib/types/database';

const RANK_NAME_MAP: Record<string, MemberRank> = {
  'Thành viên': 'member',
  'Bạc': 'silver',
  'Vàng': 'gold',
  'Kim cương': 'diamond',
};

const RANK_NAME_VI: Record<MemberRank, string> = {
  member: 'Thành viên',
  silver: 'Bạc',
  gold: 'Vàng',
  diamond: 'Kim cương',
};

/**
 * Calculate loyalty points earned for an order amount.
 * Points are calculated on the ORIGINAL amount (before discounts).
 */
export function calculatePoints(config: LoyaltyConfig, amount: number): number {
  if (amount <= 0) return 0;

  const formula = config.points_formula;

  switch (formula.type) {
    case 'per_amount':
      return Math.floor(amount / (formula.amount_per_point ?? 10000));
    case 'percentage':
      return Math.floor(amount * (formula.percentage ?? 0) / 100);
    case 'per_order':
      return 1;
    default:
      return 0;
  }
}

/**
 * Determine the rank based on ranking points and shop config.
 */
export function determineRank(config: LoyaltyConfig, rankingPoints: number): MemberRank {
  let result: MemberRank = 'member';

  const sortedRanks = [...config.ranks].sort((a, b) => a.min_points - b.min_points);

  for (const rankConfig of sortedRanks) {
    if (rankingPoints >= rankConfig.min_points) {
      result = RANK_NAME_MAP[rankConfig.name] ?? 'member';
    }
  }

  return result;
}

/**
 * Get the discount percentage for a given rank.
 */
export function getRankDiscount(config: LoyaltyConfig, rank: MemberRank): number {
  const rankNameVi = RANK_NAME_VI[rank];
  const rankConfig = config.ranks.find((r) => r.name === rankNameVi);
  return rankConfig?.discount_percent ?? 0;
}

/**
 * Get the Vietnamese display name for a rank.
 */
export function getRankDisplayName(rank: MemberRank): string {
  return RANK_NAME_VI[rank] ?? 'Thành viên';
}

/**
 * Get points needed for next rank upgrade.
 * Returns null if already at highest rank.
 */
export function getPointsToNextRank(
  config: LoyaltyConfig,
  currentPoints: number
): { nextRank: string; pointsNeeded: number } | null {
  const sortedRanks = [...config.ranks].sort((a, b) => a.min_points - b.min_points);

  for (const rankConfig of sortedRanks) {
    if (currentPoints < rankConfig.min_points) {
      return {
        nextRank: rankConfig.name,
        pointsNeeded: rankConfig.min_points - currentPoints,
      };
    }
  }

  return null; // Already at highest rank
}

import { calculatePoints, determineRank, getRankDiscount } from '@/lib/utils/points';
import type { LoyaltyConfig } from '@/lib/types/database';

const defaultConfig: LoyaltyConfig = {
  points_formula: { type: 'per_amount', amount_per_point: 10000 },
  ranks: [
    { name: 'Thành viên', min_points: 0, discount_percent: 0 },
    { name: 'Bạc', min_points: 100, discount_percent: 3 },
    { name: 'Vàng', min_points: 500, discount_percent: 5 },
    { name: 'Kim cương', min_points: 2000, discount_percent: 10 },
  ],
  bonus_rules: [],
  discount_stacking: 'take_highest',
};

describe('calculatePoints', () => {
  it('calculates points with per_amount formula', () => {
    expect(calculatePoints(defaultConfig, 350000)).toBe(35);
    expect(calculatePoints(defaultConfig, 9999)).toBe(0);
    expect(calculatePoints(defaultConfig, 10000)).toBe(1);
  });

  it('calculates points with percentage formula', () => {
    const config: LoyaltyConfig = {
      ...defaultConfig,
      points_formula: { type: 'percentage', percentage: 5 },
    };
    expect(calculatePoints(config, 100000)).toBe(5000);
  });

  it('calculates points with per_order formula', () => {
    const config: LoyaltyConfig = {
      ...defaultConfig,
      points_formula: { type: 'per_order' },
    };
    expect(calculatePoints(config, 500000)).toBe(1);
    expect(calculatePoints(config, 10000)).toBe(1);
  });

  it('never returns negative points', () => {
    expect(calculatePoints(defaultConfig, -50000)).toBe(0);
  });
});

describe('determineRank', () => {
  it('returns member for 0 points', () => {
    expect(determineRank(defaultConfig, 0)).toBe('member');
  });

  it('returns silver at 100 points', () => {
    expect(determineRank(defaultConfig, 100)).toBe('silver');
  });

  it('returns gold at 500 points', () => {
    expect(determineRank(defaultConfig, 500)).toBe('gold');
  });

  it('returns diamond at 2000 points', () => {
    expect(determineRank(defaultConfig, 2000)).toBe('diamond');
  });

  it('returns correct rank between thresholds', () => {
    expect(determineRank(defaultConfig, 99)).toBe('member');
    expect(determineRank(defaultConfig, 499)).toBe('silver');
    expect(determineRank(defaultConfig, 1999)).toBe('gold');
  });
});

describe('getRankDiscount', () => {
  it('returns correct discount for each rank', () => {
    expect(getRankDiscount(defaultConfig, 'member')).toBe(0);
    expect(getRankDiscount(defaultConfig, 'silver')).toBe(3);
    expect(getRankDiscount(defaultConfig, 'gold')).toBe(5);
    expect(getRankDiscount(defaultConfig, 'diamond')).toBe(10);
  });
});

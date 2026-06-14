import { resolveDiscount } from '@/lib/utils/discount';
import type { LoyaltyConfig, Promotion, MemberRank } from '@/lib/types/database';

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

const flashSale20: Promotion = {
  id: 'promo-1',
  shop_id: 'shop-1',
  name: 'Flash Sale 20%',
  description: null,
  type: 'flash_sale',
  discount_percent: 20,
  discount_amount: null,
  applicable_items: [],
  applicable_ranks: [],
  starts_at: new Date(Date.now() - 3600000).toISOString(),
  ends_at: new Date(Date.now() + 3600000).toISOString(),
  max_uses: null,
  current_uses: 0,
  max_uses_per_user: null,
  is_active: true,
  created_at: new Date().toISOString(),
};

describe('resolveDiscount', () => {
  it('returns no discount for member rank without promotions', () => {
    const result = resolveDiscount(100000, 'member', defaultConfig, []);
    expect(result.discountAmount).toBe(0);
    expect(result.discountType).toBeNull();
  });

  it('applies rank discount when no promotions', () => {
    const result = resolveDiscount(100000, 'gold', defaultConfig, []);
    expect(result.discountAmount).toBe(5000); // 5% of 100,000
    expect(result.discountType).toBe('rank_gold_5%');
  });

  it('takes highest when flash sale > rank discount', () => {
    const result = resolveDiscount(100000, 'gold', defaultConfig, [flashSale20]);
    expect(result.discountAmount).toBe(20000); // 20% > 5%
    expect(result.discountType).toBe('flash_sale_20%');
  });

  it('takes rank discount when higher than flash sale', () => {
    const smallSale: Promotion = { ...flashSale20, discount_percent: 2 };
    const result = resolveDiscount(100000, 'gold', defaultConfig, [smallSale]);
    expect(result.discountAmount).toBe(5000); // 5% > 2%
    expect(result.discountType).toBe('rank_gold_5%');
  });

  it('ignores expired promotions', () => {
    const expired: Promotion = {
      ...flashSale20,
      ends_at: new Date(Date.now() - 1000).toISOString(),
    };
    const result = resolveDiscount(100000, 'gold', defaultConfig, [expired]);
    expect(result.discountAmount).toBe(5000); // Only rank discount
  });
});

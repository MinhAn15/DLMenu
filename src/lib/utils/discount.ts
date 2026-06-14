import type { LoyaltyConfig, Promotion, MemberRank } from '@/lib/types/database';
import { getRankDiscount } from './points';

export interface DiscountResult {
  discountAmount: number;
  discountType: string | null;
  discountLabel: string | null;
}

/**
 * Resolve the best applicable discount for an order.
 * Rule: Take the highest discount only (no stacking).
 */
export function resolveDiscount(
  subtotal: number,
  userRank: MemberRank,
  loyaltyConfig: LoyaltyConfig,
  activePromotions: Promotion[]
): DiscountResult {
  const candidates: DiscountResult[] = [];

  // 1. Rank-based discount
  const rankDiscountPercent = getRankDiscount(loyaltyConfig, userRank);
  if (rankDiscountPercent > 0) {
    const rankNameMap: Record<MemberRank, string> = {
      member: 'member',
      silver: 'silver',
      gold: 'gold',
      diamond: 'diamond',
    };
    candidates.push({
      discountAmount: Math.floor(subtotal * rankDiscountPercent / 100),
      discountType: `rank_${rankNameMap[userRank]}_${rankDiscountPercent}%`,
      discountLabel: `Ưu đãi hạng ${userRank === 'silver' ? 'Bạc' : userRank === 'gold' ? 'Vàng' : userRank === 'diamond' ? 'Kim cương' : 'Thành viên'} (${rankDiscountPercent}%)`,
    });
  }

  // 2. Active promotions
  const now = new Date();
  for (const promo of activePromotions) {
    if (!promo.is_active) continue;
    if (new Date(promo.starts_at) > now) continue;
    if (new Date(promo.ends_at) < now) continue;
    if (promo.max_uses && promo.current_uses >= promo.max_uses) continue;

    let promoDiscount = 0;
    if (promo.discount_percent) {
      promoDiscount = Math.floor(subtotal * promo.discount_percent / 100);
    } else if (promo.discount_amount) {
      promoDiscount = Math.min(Number(promo.discount_amount), subtotal);
    }

    if (promoDiscount > 0) {
      candidates.push({
        discountAmount: promoDiscount,
        discountType: `flash_sale_${promo.discount_percent ?? promo.discount_amount}%`,
        discountLabel: `${promo.name} (${promo.discount_percent}%)`,
      });
    }
  }

  // 3. Take the highest
  if (candidates.length === 0) {
    return { discountAmount: 0, discountType: null, discountLabel: null };
  }

  candidates.sort((a, b) => b.discountAmount - a.discountAmount);
  return candidates[0];
}

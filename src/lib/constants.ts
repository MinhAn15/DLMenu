export const APP_NAME = 'DiLinhMenu';

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  preparing: 'Đang pha chế',
  ready: 'Sẵn sàng',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'var(--color-warning)',
  confirmed: 'var(--color-info)',
  preparing: 'var(--color-secondary)',
  ready: 'var(--color-success)',
  completed: 'var(--color-text-muted)',
  cancelled: 'var(--color-error)',
};

export const RANK_COLORS: Record<string, string> = {
  member: 'var(--color-rank-member)',
  silver: 'var(--color-rank-silver)',
  gold: 'var(--color-rank-gold)',
  diamond: 'var(--color-rank-diamond)',
};

export const RANK_LABELS: Record<string, string> = {
  member: 'Thành viên',
  silver: 'Bạc',
  gold: 'Vàng',
  diamond: 'Kim cương',
};

export const RANK_ICONS: Record<string, string> = {
  member: '👤',
  silver: '🥈',
  gold: '🥇',
  diamond: '💎',
};

export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 5;
export const OTP_MAX_ATTEMPTS_PER_HOUR = 3;

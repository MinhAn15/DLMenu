import { formatVND, formatDate, formatTime, formatPhone, formatOrderNumber } from '@/lib/utils/format';

describe('formatVND', () => {
  it('formats number to VND currency', () => {
    expect(formatVND(35000)).toBe('35.000₫');
    expect(formatVND(1500000)).toBe('1.500.000₫');
    expect(formatVND(0)).toBe('0₫');
  });

  it('handles negative numbers', () => {
    expect(formatVND(-5000)).toBe('-5.000₫');
  });
});

describe('formatDate', () => {
  it('formats ISO date to Vietnamese format', () => {
    const result = formatDate('2026-06-14T20:00:00+07:00');
    expect(result).toContain('14');
    expect(result).toContain('06');
  });
});

describe('formatPhone', () => {
  it('formats phone number with spaces', () => {
    expect(formatPhone('0901234567')).toBe('090 123 4567');
  });

  it('handles already formatted phone', () => {
    expect(formatPhone('090 123 4567')).toBe('090 123 4567');
  });
});

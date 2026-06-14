/**
 * Format a number as Vietnamese Dong currency.
 * Example: 35000 → "35.000₫"
 */
export function formatVND(amount: number): string {
  if (amount === 0) return '0₫';
  const formatted = new Intl.NumberFormat('vi-VN').format(amount);
  return `${formatted}₫`;
}

/**
 * Format ISO date string to "DD/MM/YYYY" in Vietnamese timezone.
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  });
}

/**
 * Format ISO date string to "HH:mm" in Vietnamese timezone.
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  });
}

/**
 * Format phone number with spaces: "0901234567" → "090 123 4567"
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\s/g, '');
  if (digits.length !== 10) return phone;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

/**
 * Format order number for display.
 */
export function formatOrderNumber(orderNumber: string): string {
  return orderNumber.startsWith('#') ? orderNumber : `#${orderNumber}`;
}

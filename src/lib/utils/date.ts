/**
 * Tính khoảng cách thời gian tương đối cho trang admin (KDS, orders).
 * Output tiếng Việt ngắn gọn ("Vừa xong", "2 phút trước", "1h 5m trước").
 *
 * @param isoString ISO timestamp (e.g. order.created_at)
 * @returns chuỗi hiển thị thời gian tương đối so với hiện tại
 */
export function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const past = new Date(isoString).getTime();
  const diffMs = now - past;

  if (Number.isNaN(diffMs)) return '—';

  const totalSeconds = Math.floor(diffMs / 1000);
  if (totalSeconds < 30) return 'Vừa xong';

  const minutes = Math.floor(totalSeconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const remMin = minutes % 60;
    return remMin === 0 ? `${hours}h trước` : `${hours}h ${remMin}m trước`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} tuần trước`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;

  const years = Math.floor(days / 365);
  return `${years} năm trước`;
}

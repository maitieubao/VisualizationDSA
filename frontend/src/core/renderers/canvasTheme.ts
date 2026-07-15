// --- System-wide Canvas & Rendering Design Tokens ---

export const CANVAS_COLORS = {
  // Trạng thái các phần tử trong hoạt ảnh (Sorting, Compare, v.v.)
  default: '#38BDF8', // cyan-400 (Màu cơ bản của mảng/nút)
  compare: '#FBBF24', // amber-400 (Đang so sánh)
  swap:    '#FB7185', // rose-400 (Đang hoán vị/đổi chỗ)
  sorted:  '#34D399', // emerald-400 (Đã sắp xếp xong)
  text:    '#F1F5F9', // slate-100 (Nhãn giá trị trên bar)
  muted:   '#64748B', // slate-500 (STT index)

  // Cấu hình mạng lưới & nền
  bgDark:  '#080c14',
  gridDark: 'rgba(6, 182, 212, 0.03)',
};

export const CANVAS_LAYOUT = {
  margin: 30,
  marginBottom: 100, // Khoảng trống an toàn phía dưới cho chỉ số/giới thiệu
  paddingTop: 45,
  borderRadius: 6,
};

/**
 * Chuyển đổi mã màu hex sang rgba với độ mờ (opacity) tùy chỉnh.
 * Ví dụ: hexToRgba('#38BDF8', 0.25) -> 'rgba(56, 189, 248, 0.25)'
 */
export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

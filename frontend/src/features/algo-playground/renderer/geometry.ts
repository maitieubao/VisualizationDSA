import { easeInOut, easeOut, lerp } from '@/utils/math';

// AL-036: ease/lerp dùng chung cho toàn bộ animation engine — tái xuất từ
// nguồn chuẩn '@/utils/math' — tránh định nghĩa lặp trong từng renderer.
export { easeInOut, easeOut, lerp };

/**
 * Tìm min/max trong vòng lặp O(n) kèm fallback — thay thế `Math.min(...arr)` / `Math.max(...arr)`
 * (spread vỡ stack khi mảng hàng chục nghìn phần tử — EC-022/AL-033).
 */
export function minWithFallback(arr: number[], fallback: number): number {
  let min = fallback;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (v < min) min = v;
  }
  return min;
}

export function maxWithFallback(arr: number[], fallback: number): number {
  let max = fallback;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (v > max) max = v;
  }
  return max;
}

export function clearCanvas(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.clearRect(0, 0, w, h);
}

/** Vẽ hình chữ nhật bo góc bằng path (dùng chung cho mọi renderer — AL-036). */
export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function parseColor(hex: string): { r: number; g: number; b: number; a: number } {
  if (hex.startsWith('rgb')) {
    const m = hex.match(/[\d.]+/g);
    return {
      r: +(m?.[0] ?? 0),
      g: +(m?.[1] ?? 0),
      b: +(m?.[2] ?? 0),
      a: m?.[3] !== undefined ? +m[3] : 1,
    };
  }
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
    a: 1,
  };
}

/** Nội suy màu giữa 2 chuỗi hex/rgb (giữ alpha khi có — dùng chung cho mọi renderer — AL-036). */
export function lerpColor(from: string, to: string, t: number): string {
  if (from === to) return from;
  const f = parseColor(from);
  const g = parseColor(to);
  const r = Math.round(f.r + (g.r - f.r) * t);
  const gg = Math.round(f.g + (g.g - f.g) * t);
  const b = Math.round(f.b + (g.b - f.b) * t);
  const a = f.a + (g.a - f.a) * t;
  // Giữ alpha: màu rgba (vd pruned 0.2) không được "đặc cứng" khi lerp
  if (f.a < 1 || g.a < 1) {
    return `rgba(${r},${gg},${b},${a.toFixed(2)})`;
  }
  return `rgb(${r},${gg},${b})`;
}

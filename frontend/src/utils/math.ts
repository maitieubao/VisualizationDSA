export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}

export function easeOut(t: number): number {
  return 1 - (1 - clamp(t, 0, 1)) ** 3;
}

export function easeInOut(t: number): number {
  const ct = clamp(t, 0, 1);
  return ct < 0.5 ? 2 * ct * ct : -1 + (4 - 2 * ct) * ct;
}

export function lerpArray(
  from: number[],
  to: number[],
  t: number,
): number[] {
  const len = Math.min(from.length, to.length);
  const result = new Array<number>(len);
  const clamped = clamp(t, 0, 1);
  for (let i = 0; i < len; i++) {
    result[i] = from[i] + (to[i] - from[i]) * clamped;
  }
  return result;
}

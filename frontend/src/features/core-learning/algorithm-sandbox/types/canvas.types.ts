/**
 * canvas.types.ts — Type definitions cho algorithm-sandbox feature module.
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface AnimatedItem {
  id: number;
  value: number;
  currentX: number;
  targetX: number;
  currentScale: number;
  targetScale: number;
  currentRGB: RGB;
  targetRGB: RGB;
  status: 'normal' | 'compare' | 'swap' | 'highlight';
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export const COLORS = {
  normal:    { r: 6,   g: 182, b: 212 },
  compare:   { r: 245, g: 158, b: 11  },
  swap:      { r: 244, g: 63,  b: 94  },
  highlight: { r: 16,  g: 185, b: 129 },
} as const;

export function lerpRGB(c1: RGB, c2: RGB, t: number): RGB {
  return {
    r: c1.r + (c2.r - c1.r) * t,
    g: c1.g + (c2.g - c1.g) * t,
    b: c1.b + (c2.b - c1.b) * t,
  };
}

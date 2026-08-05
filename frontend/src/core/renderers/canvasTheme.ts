function getCssVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return val || fallback;
}

function initColors() {
  return {
    default:  getCssVar('--color-accent-primary', '#4255ff'),
    compare:  getCssVar('--color-accent-primary-light', '#6b7bff'),
    swap:     getCssVar('--color-accent-red', '#f87171'),
    sorted:   getCssVar('--color-accent-green', '#34d399'),
    text:     getCssVar('--color-text-primary', '#d9dde8'),
    muted:    getCssVar('--color-text-muted', '#6b7385'),
    bgDark:   getCssVar('--canvas-bg', '#0d1020'),
    gridDark: getCssVar('--canvas-grid-color', 'rgba(66, 85, 255, 0.04)'),
  };
}

export const CANVAS_COLORS = initColors();

export function refreshCanvasColors() {
  const c = initColors();
  Object.assign(CANVAS_COLORS, c);
}

export const CANVAS_LAYOUT = {
  margin: 30,
  marginBottom: 100,
  paddingTop: 45,
  borderRadius: 6,
};

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ── Design System Color Resolution ──
// All canvas colors MUST resolve from CSS custom properties (design tokens).
// No hardcoded hex values allowed — see skills/visualization/color-system.md

function readCssVar(name: string): string {
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function cssAlpha(varName: string, alphaOverride?: number): string {
  const raw = readCssVar(varName);
  if (!raw) return '';
  if (alphaOverride !== undefined) {
    // Replace alpha in rgba()
    return raw.replace(/,\s*[\d.]+\)/, `, ${alphaOverride})`);
  }
  return raw;
}

/**
 * AL-036: Bảng màu dùng chung cho toàn bộ hệ canvas.
 * Resolve từ CSS design tokens — tự động dark/light theme.
 * Gọi refreshColors() khi theme thay đổi.
 */
export const COLORS: Record<string, string> & { pointerColors: Record<string, string> } = {
  barDefault: '',
  barCompare: '',
  barSwap: '',
  barSorted: '',
  barPruned: '',
  barText: '',
  nodeDefault: '',
  nodeBorder: '',
  nodeActive: '',
  nodeVisited: '',
  nodePruned: '',
  nodeText: '',
  nodeFound: '',
  edgeDefault: '',
  edgeHighlight: '',
  edgeWeightText: '',
  badgeBg: '',
  badgeText: '',
  rangeActive: '',
  rangePruned: '',
  pointerColors: {} as Record<string, string>,
  callStackBg: '',
  callStackBorder: '',
  callStackActive: '',
  legendBg: '',
  legendText: '',
  notFoundBg: '',
  notFoundText: '',
  targetBg: '',
  targetText: '',
  depthText: '',
  foundGlow: '',
  barSegment: '',
  chipBg: '',
  chipActive: '',
  chipOut: '',
  chipSlot: '',
  text: '',
  textDim: '',
  heapNodeDefault: '',
  heapNodeActive: '',
  heapText: '',
  heapBarDefault: '',
  nodeExtracted: '',
  nodeBeyond: '',
  edge: '',
  barExtracted: '',
  barBeyond: '',
  regionHeap: '',
  regionSorted: '',
  captionBg: '',
};

/** Fallback colors (dark theme) used when CSS vars are not yet available. */
const FALLBACK: Record<string, string> = {
  barDefault: 'rgba(255,255,255,0.25)',
  barCompare: 'rgba(255,255,255,0.65)',
  barSwap: '#b85c5c',
  barSorted: '#5ab88a',
  barPruned: 'rgba(255,255,255,0.08)',
  barText: 'rgba(255,255,255,0.88)',
  nodeDefault: '#3d9970',
  nodeBorder: 'rgba(255,255,255,0.14)',
  nodeActive: '#3d9970',
  nodeVisited: '#5ab88a',
  nodePruned: 'rgba(255,255,255,0.14)',
  nodeText: 'rgba(255,255,255,0.88)',
  nodeFound: '#c9a227',
  edgeDefault: 'rgba(255,255,255,0.12)',
  edgeHighlight: '#c9a227',
  edgeWeightText: '#22d3ee',
  badgeBg: 'rgba(10,13,11,0.88)',
  badgeText: 'rgba(255,255,255,0.55)',
  rangeActive: 'rgba(201,162,39,0.06)',
  rangePruned: 'rgba(184,92,92,0.06)',
  callStackBg: 'rgba(10,13,11,0.88)',
  callStackBorder: 'rgba(255,255,255,0.08)',
  callStackActive: '#c9a227',
  legendBg: 'rgba(10,13,11,0.88)',
  legendText: 'rgba(255,255,255,0.55)',
  notFoundBg: 'rgba(184,92,92,0.06)',
  notFoundText: '#b85c5c',
  targetBg: 'rgba(6,182,212,0.06)',
  targetText: '#06b6d4',
  depthText: '#a78bfa',
  foundGlow: '#c9a227',
  barSegment: '#c9a227',
  chipBg: 'rgba(30,35,32,0.55)',
  chipActive: '#c9a227',
  chipOut: '#3d9970',
  chipSlot: 'rgba(61,153,112,0.06)',
  text: 'rgba(255,255,255,0.88)',
  textDim: 'rgba(255,255,255,0.55)',
  heapNodeDefault: '#a78bfa',
  heapNodeActive: '#c9a227',
  heapText: 'rgba(255,255,255,0.88)',
  heapBarDefault: '#a78bfa',
  nodeExtracted: 'rgba(52,211,153,0.55)',
  nodeBeyond: 'rgba(71,85,105,0.45)',
  edge: 'rgba(148,163,184,0.5)',
  barExtracted: 'rgba(52,211,153,0.6)',
  barBeyond: 'rgba(71,85,105,0.4)',
  regionHeap: 'rgba(201,162,39,0.10)',
  regionSorted: 'rgba(52,211,153,0.12)',
  captionBg: 'rgba(10,13,11,0.9)',
};

const POINTER_FALLBACK: Record<string, string> = {
  L: '#06b6d4', H: '#c4b5fd', M: '#3d9970', R: '#b85c5c',
  Low: '#06b6d4', High: '#c4b5fd', Mid: '#3d9970',
  Left: '#06b6d4', Right: '#b85c5c',
};

/** Resolve all COLORS from CSS design tokens. Call on init + theme change. */
export function refreshColors(): void {
  const resolve = (cssVar: string, fallback: string): string => {
    const v = readCssVar(cssVar);
    return v || fallback;
  };

  COLORS.barDefault     = resolve('--vis-color-default', FALLBACK.barDefault);
  COLORS.barCompare     = resolve('--vis-color-compare', FALLBACK.barCompare);
  COLORS.barSwap        = resolve('--vis-color-swap', FALLBACK.barSwap);
  COLORS.barSorted      = resolve('--vis-color-sorted', FALLBACK.barSorted);
  COLORS.barPruned      = cssAlpha('--vis-color-default', 0.08) || FALLBACK.barPruned;
  COLORS.barText        = resolve('--color-text-primary', FALLBACK.barText);

  COLORS.nodeDefault    = resolve('--canvas-node-default', FALLBACK.nodeDefault);
  COLORS.nodeBorder     = resolve('--color-border-strong', FALLBACK.nodeBorder);
  COLORS.nodeActive     = resolve('--vis-color-active', FALLBACK.nodeActive);
  COLORS.nodeVisited    = resolve('--vis-color-sorted', FALLBACK.nodeVisited);
  COLORS.nodePruned     = cssAlpha('--color-text-disabled', 0.25) || FALLBACK.nodePruned;
  COLORS.nodeText       = resolve('--color-text-primary', FALLBACK.nodeText);
  COLORS.nodeFound      = resolve('--color-accent-primary', FALLBACK.nodeFound);

  COLORS.edgeDefault    = resolve('--canvas-edge-default', FALLBACK.edgeDefault);
  COLORS.edgeHighlight  = resolve('--color-accent-primary', FALLBACK.edgeHighlight);
  COLORS.edgeWeightText = resolve('--color-accent-cyan-light', FALLBACK.edgeWeightText);

  COLORS.badgeBg        = resolve('--color-bg-overlay', FALLBACK.badgeBg);
  COLORS.badgeText      = resolve('--color-text-secondary', FALLBACK.badgeText);

  COLORS.rangeActive    = cssAlpha('--color-accent-primary', 0.12) || FALLBACK.rangeActive;
  COLORS.rangePruned    = cssAlpha('--color-accent-red', 0.08) || FALLBACK.rangePruned;

  COLORS.callStackBg    = resolve('--color-bg-overlay', FALLBACK.callStackBg);
  COLORS.callStackBorder= resolve('--color-border-default', FALLBACK.callStackBorder);
  COLORS.callStackActive= resolve('--color-accent-primary', FALLBACK.callStackActive);

  COLORS.legendBg       = resolve('--color-bg-overlay', FALLBACK.legendBg);
  COLORS.legendText     = resolve('--color-text-secondary', FALLBACK.legendText);

  COLORS.notFoundBg     = cssAlpha('--color-accent-red', 0.15) || FALLBACK.notFoundBg;
  COLORS.notFoundText   = resolve('--color-accent-red', FALLBACK.notFoundText);
  COLORS.targetBg       = cssAlpha('--color-accent-cyan', 0.15) || FALLBACK.targetBg;
  COLORS.targetText     = resolve('--color-accent-cyan', FALLBACK.targetText);
  COLORS.depthText      = resolve('--color-accent-purple', FALLBACK.depthText);
  COLORS.foundGlow      = resolve('--color-accent-primary', FALLBACK.foundGlow);

  // Merge Sort colors
  COLORS.barSegment     = resolve('--color-accent-primary', FALLBACK.barSegment);
  COLORS.chipBg         = cssAlpha('--color-bg-surface', 0.55) || FALLBACK.chipBg;
  COLORS.chipActive     = resolve('--color-accent-primary', FALLBACK.chipActive);
  COLORS.chipOut        = resolve('--color-accent-green', FALLBACK.chipOut);
  COLORS.chipSlot       = cssAlpha('--color-accent-green', 0.15) || FALLBACK.chipSlot;
  COLORS.text           = resolve('--color-text-primary', FALLBACK.text);
  COLORS.textDim        = resolve('--color-text-secondary', FALLBACK.textDim);

  // Heap Sort colors
  COLORS.heapNodeDefault= resolve('--color-accent-purple', FALLBACK.heapNodeDefault);
  COLORS.heapNodeActive = resolve('--color-accent-primary', FALLBACK.heapNodeActive);
  COLORS.heapText       = resolve('--color-text-primary', FALLBACK.heapText);
  COLORS.heapBarDefault = resolve('--color-accent-purple', FALLBACK.heapBarDefault);
  COLORS.nodeExtracted  = 'rgba(52,211,153,0.55)';
  COLORS.nodeBeyond     = 'rgba(71,85,105,0.45)';
  COLORS.edge           = 'rgba(148,163,184,0.5)';
  COLORS.barExtracted   = 'rgba(52,211,153,0.6)';
  COLORS.barBeyond      = 'rgba(71,85,105,0.4)';
  COLORS.regionHeap     = cssAlpha('--color-accent-primary', 0.10) || FALLBACK.regionHeap;
  COLORS.regionSorted   = 'rgba(52,211,153,0.12)';
  COLORS.captionBg      = resolve('--color-bg-overlay', FALLBACK.captionBg);

  // Pointer colors
  COLORS.pointerColors = {
    L: resolve('--color-accent-cyan', POINTER_FALLBACK.L),
    H: resolve('--color-accent-purple-light', POINTER_FALLBACK.H),
    M: resolve('--color-accent-primary', POINTER_FALLBACK.M),
    R: resolve('--color-accent-red', POINTER_FALLBACK.R),
    Low: resolve('--color-accent-cyan', POINTER_FALLBACK.Low),
    High: resolve('--color-accent-purple-light', POINTER_FALLBACK.High),
    Mid: resolve('--color-accent-primary', POINTER_FALLBACK.Mid),
    Left: resolve('--color-accent-cyan', POINTER_FALLBACK.Left),
    Right: resolve('--color-accent-red', POINTER_FALLBACK.Right),
  };
}

// Auto-resolve on module load
refreshColors();

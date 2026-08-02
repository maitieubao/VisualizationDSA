import { ref, computed, watch, onMounted, onBeforeUnmount, type Ref } from 'vue';
import { useAnimationStore } from '../store/useAnimationStore';
import {
  MARGIN_BOTTOM, PADDING_TOP, GAP,
  COLOR_DEFAULT, COLOR_COMPARE, COLOR_SWAP, COLOR_SORTED, COLOR_TEXT,
  easeOut, lerp, calculateColumnWidth, calculateColumnHeight, calculateX,
} from './canvasMathHelpers';

interface BarPosition { x: number; targetX: number; }

export function useAnimationCanvas(
  canvasRef: Ref<HTMLCanvasElement | null>,
  containerRef: Ref<HTMLDivElement | null>
) {
  const store = useAnimationStore();
  const currentFrame   = computed(() => store.currentFrame);
  const totalSteps     = computed(() => store.totalSteps);
  const progressPercent = computed(() => store.progressPercent);

  let barPositions: BarPosition[] = [];
  let isTransitioning = false;
  let animationProgress = 0;
  let lastTimestamp = 0;
  let rafId: number | null = null;
  let resizeObserver: ResizeObserver | null = null;

  function determineColor(index: number): string {
    const frame = store.currentFrame;
    if (!frame || !frame.highlights) return COLOR_DEFAULT;
    if (frame.highlights.sorted?.includes(index))  return COLOR_SORTED;
    if (frame.highlights.swap?.includes(index))    return COLOR_SWAP;
    if (frame.highlights.compare?.includes(index)) return COLOR_COMPARE;
    return COLOR_DEFAULT;
  }

  function prepareTransition(): void {
    const frame = store.currentFrame;
    if (!frame || !canvasRef.value) return;
    const dpr = window.devicePixelRatio || 1;
    const canvasW = canvasRef.value.width / dpr;
    const n = frame.dataState?.length ?? 0;
    const columnWidth = calculateColumnWidth(n, canvasW);
    const newPositions: BarPosition[] = [];
    for (let i = 0; i < n; i++) {
      const targetX = calculateX(i, columnWidth);
      const currentX = barPositions[i]?.x ?? targetX;
      newPositions.push({ x: currentX, targetX });
    }
    barPositions = newPositions;
    animationProgress = 0;
    isTransitioning = true;
  }

  function renderCanvas(): void {
    const canvas = canvasRef.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    
    const style = getComputedStyle(document.documentElement);
    const colorBg = style.getPropertyValue('--canvas-bg').trim() || '#080808';
    ctx.fillStyle = colorBg;
    ctx.fillRect(0, 0, w, h);
    const frame = store.currentFrame;
    if (!frame) return;
    const n = frame.dataState?.length ?? 0;
    if (n === 0) return;
    const columnWidth = calculateColumnWidth(n, w);
    const maxVal = Math.max(...(frame.dataState ?? []), 1);
    for (let i = 0; i < n; i++) {
      const colH = calculateColumnHeight(frame.dataState?.[i] ?? 0, maxVal, h);
      const yPos = h - colH - MARGIN_BOTTOM;
      let xPos = calculateX(i, columnWidth);
      if (isTransitioning && barPositions[i]) {
        const t = easeOut(animationProgress);
        xPos = lerp(barPositions[i].x, barPositions[i].targetX, t);
      }
      const color = determineColor(i);
      ctx.fillStyle = color;
      const radius = Math.min(4, columnWidth / 4);
      ctx.beginPath();
      ctx.moveTo(xPos + radius, yPos);
      ctx.lineTo(xPos + columnWidth - radius, yPos);
      ctx.quadraticCurveTo(xPos + columnWidth, yPos, xPos + columnWidth, yPos + radius);
      ctx.lineTo(xPos + columnWidth, yPos + colH);
      ctx.lineTo(xPos, yPos + colH);
      ctx.lineTo(xPos, yPos + radius);
      ctx.quadraticCurveTo(xPos, yPos, xPos + radius, yPos);
      ctx.closePath();
      ctx.fill();
      if (color === COLOR_SORTED) { ctx.shadowColor = COLOR_SORTED; ctx.shadowBlur = 15; ctx.fill(); ctx.shadowBlur = 0; }
      ctx.fillStyle = COLOR_TEXT;
      ctx.font = `bold ${Math.min(12, columnWidth * 0.6)}px Inter, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText((frame.dataState?.[i] ?? 0).toString(), xPos + columnWidth / 2, yPos - 5);
      ctx.fillStyle = '#64748b';
      ctx.font = `${Math.min(10, columnWidth * 0.45)}px Inter, sans-serif`;
      ctx.textBaseline = 'top';
      ctx.fillText(i.toString(), xPos + columnWidth / 2, h - MARGIN_BOTTOM + 6);
    }
    if (!isTransitioning) {
      barPositions = (frame.dataState ?? []).map((_, i) => { const x = calculateX(i, columnWidth); return { x, targetX: x }; });
    }
  }

  function tick(timestamp: number): void {
    if (isTransitioning) {
      const duration = 300 / store.playbackSpeed;
      animationProgress += (timestamp - lastTimestamp) / duration;
      if (animationProgress >= 1) {
        animationProgress = 1; isTransitioning = false;
        barPositions.forEach((bp) => { bp.x = bp.targetX; });
      }
    }
    renderCanvas();
    lastTimestamp = timestamp;
    rafId = requestAnimationFrame(tick);
  }

  function resizeCanvas(): void {
    const canvas = canvasRef.value;
    const container = containerRef.value;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    renderCanvas();
  }

  watch(() => store.currentIndex, () => { prepareTransition(); });

  onMounted(() => {
    resizeCanvas();
    lastTimestamp = performance.now();
    rafId = requestAnimationFrame(tick);
    if (containerRef.value) {
      resizeObserver = new ResizeObserver(() => resizeCanvas());
      resizeObserver.observe(containerRef.value);
    }
  });

  onBeforeUnmount(() => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    resizeObserver?.disconnect();
  });

  return { currentFrame, totalSteps, progressPercent };
}

import { computed, watch, onMounted, onBeforeUnmount, type Ref } from 'vue';
import { useAnimationStore } from '../store/useAnimationStore';
import { useQuizStore } from '../../quiz-system/store/useQuizStore';
import { lerp, easeOut } from '@/utils/math';
import type { FrameDTO } from '../types/animation.types';
import type { CanvasNodeDTO } from '../../quiz-system/types/quiz.types';
import {
  MARGIN_BOTTOM,
  COLOR_DEFAULT, COLOR_COMPARE, COLOR_SWAP, COLOR_SORTED, COLOR_TEXT,
  calculateColumnWidth, calculateColumnHeight, calculateX,
} from './canvasMathHelpers';

interface BarSnapshot {
  value: number;
  x: number;
  sourceIndex: number;
}

// EC-009: lookup O(1)/bar thay cho quét mảng O(n²)/frame.
// `byKey` ưu tiên khớp (sourceIndex, value), `byValue` fallback khớp value.
interface PrevSnapshotLookup {
  byKey: Map<string, BarSnapshot>;
  byValue: Map<number, BarSnapshot>;
}

// QZ-004: bán kính hit-test node khớp GraphRenderer (`22*22` world space) để
// click trên canvas trúng đúng node — cùng không gian tọa độ CSS px.
const CANVAS_NODE_RADIUS = 22;
const FLASH_DURATION_MS = 900;
const FLASH_COLOR_CORRECT = '#10B981';
const FLASH_COLOR_WRONG = '#EF4444';

interface CanvasFlash {
  nodeId: string;
  isCorrect: boolean;
}

export function useAnimationCanvas(
  canvasRef: Ref<HTMLCanvasElement | null>,
  containerRef: Ref<HTMLDivElement | null>,
) {
  const store = useAnimationStore();
  const quizStore = useQuizStore();
  const currentFrame = computed(() => store.currentFrame);
  const totalSteps = computed(() => store.totalSteps);
  const progressPercent = computed(() => store.progressPercent);

  let resizeObserver: ResizeObserver | null = null;
  let rafId: number | null = null;
  let cachedColorBg = '#080808';
  let prevBarSnapshot: BarSnapshot[] = [];

  // ─── QZ-004: trạng thái flash node trúng/sai ───
  let canvasClickHandler: ((event: MouseEvent) => void) | null = null;
  let flash: CanvasFlash | null = null;
  let flashTimer: ReturnType<typeof setTimeout> | null = null;

  function buildBarSnapshot(data: number[], columnWidth: number): BarSnapshot[] {
    return data.map((value, i) => ({
      value,
      x: calculateX(i, columnWidth),
      sourceIndex: i,
    }));
  }

  // EC-009: thay `findPrevSnapshotForBar` (quét ngược O(n²)/frame) bằng Map.
  // Quét từ đầu & ghi đè giữ "occurrence CUỐI" — tương đương ngữ nghĩa bản cũ
  // (vòng lặp ngược return phần tử khớp cuối cùng trong mảng).
  function buildPrevSnapshotLookup(snapshot: BarSnapshot[]): PrevSnapshotLookup {
    const byKey = new Map<string, BarSnapshot>();
    const byValue = new Map<number, BarSnapshot>();
    for (let i = 0; i < snapshot.length; i++) {
      const s = snapshot[i];
      byKey.set(`${s.sourceIndex}:${s.value}`, s);
      byValue.set(s.value, s);
    }
    return { byKey, byValue };
  }

  function determineColor(index: number, frame: FrameDTO | null): string {
    if (!frame || !frame.highlights) return COLOR_DEFAULT;
    if (frame.highlights.sorted?.includes(index)) return COLOR_SORTED;
    if (frame.highlights.swap?.includes(index)) return COLOR_SWAP;
    if (frame.highlights.compare?.includes(index)) return COLOR_COMPARE;
    return COLOR_DEFAULT;
  }

  // QZ-004: GraphNodeDTO (frame) → CanvasNodeDTO (định dạng engine chấm điểm).
  function graphNodesFromFrame(frame: FrameDTO | null): CanvasNodeDTO[] {
    if (!frame?.graphNodes) return [];
    return frame.graphNodes.map((n) => ({
      id: String(n.id),
      x: n.x,
      y: n.y,
      radius: CANVAS_NODE_RADIUS,
    }));
  }

  // QZ-004: click canvas — chỉ hoạt động khi quiz store ở chế độ canvas-target.
  function handleCanvasClick(event: MouseEvent): void {
    if (!quizStore.isCanvasTargetMode) return;
    const canvas = canvasRef.value;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    // Tọa độ CSS px — cùng không gian vẽ sau ctx.setTransform(dpr, ...).
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    const nodes = graphNodesFromFrame(store.currentFrame);
    if (nodes.length === 0) return;
    quizStore.handleCanvasClickAnswer(clickX, clickY, nodes);
    if (!quizStore.isSubmitted) return; // click trượt — chưa nộp, không flash
    flash = {
      nodeId: quizStore.matchedNodeId ?? '',
      isCorrect: quizStore.isCorrect,
    };
    renderCanvas();
    if (flashTimer !== null) clearTimeout(flashTimer);
    flashTimer = setTimeout(() => {
      flashTimer = null;
      flash = null;
      renderCanvas();
    }, FLASH_DURATION_MS);
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

    ctx.fillStyle = cachedColorBg;
    ctx.fillRect(0, 0, w, h);

    const frame = store.currentFrame;
    if (!frame) return;

    // QZ-004: vẽ flash node trúng (xanh đúng / đỏ sai) ngay trên canvas — đặt
    // TRƯỚC early-return của bar render vì frame đồ thị (Dijkstra...) có thể
    // mang dataState rỗng nhưng vẫn cần flash.
    if (flash !== null && frame.graphNodes && flash.nodeId !== '') {
      const flashNodeId = flash.nodeId;
      const node = frame.graphNodes.find((g) => String(g.id) === flashNodeId);
      if (node) {
        const color = flash.isCorrect ? FLASH_COLOR_CORRECT : FLASH_COLOR_WRONG;
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, CANVAS_NODE_RADIUS + 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(node.x, node.y, CANVAS_NODE_RADIUS + 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const n = frame.dataState?.length ?? 0;
    if (n === 0) return;

    const progress = easeOut(store.subFrameProgress);
    const isTransitioning = store.isPlaying && progress > 0;
    const nextFrame = isTransitioning
      ? store.frames[store.currentIndex + 1] ?? null
      : null;

    const columnWidth = calculateColumnWidth(n, w);
    const currentData = frame.dataState ?? [];
    const nextData = nextFrame?.dataState ?? currentData;

    let maxVal = 1;
    for (let i = 0; i < currentData.length; i++) {
      if (currentData[i] > maxVal) maxVal = currentData[i];
    }
    for (let i = 0; i < nextData.length; i++) {
      if (nextData[i] > maxVal) maxVal = nextData[i];
    }

    const targetSnapshot = buildBarSnapshot(nextData, columnWidth);
    const useXInterpolation = isTransitioning && prevBarSnapshot.length === n;
    // EC-009: dựng Map lookup 1 lần mỗi frame (O(n)) thay vì quét ngược per-bar (O(n²)).
    const prevLookup = useXInterpolation ? buildPrevSnapshotLookup(prevBarSnapshot) : null;

    // EC-009: cache font/align — không gán lại 2 lần/bar mỗi frame.
    ctx.textAlign = 'center';
    const valueFont = `bold ${Math.min(12, columnWidth * 0.6)}px Inter, sans-serif`;
    const indexFont = `${Math.min(10, columnWidth * 0.45)}px Inter, sans-serif`;

    for (let i = 0; i < n; i++) {
      const currentVal = currentData[i] ?? 0;
      const nextVal = nextData[i] ?? currentVal;
      const interpolatedVal = lerp(currentVal, nextVal, progress);

      let xPos = calculateX(i, columnWidth);
      if (useXInterpolation && prevLookup !== null) {
        const prevSnapshot =
          prevLookup.byKey.get(`${i}:${currentVal}`) ??
          prevLookup.byValue.get(currentVal) ??
          null;
        if (prevSnapshot) {
          const targetX = targetSnapshot[i]?.x ?? xPos;
          xPos = lerp(prevSnapshot.x, targetX, progress);
        }
      }

      const colH = calculateColumnHeight(interpolatedVal, maxVal, h);
      const yPos = h - colH - MARGIN_BOTTOM;

      const color = determineColor(i, frame);
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

      // EC-009: bỏ shadowBlur=15 per-bar cho MỌI bar sorted (phép toán đắt nhất
      // canvas) — thay bằng globalAlpha overlay rẻ; giữ shadowBlur 12 chỉ cho
      // bar đang swap (số lượng nhỏ, chỉ khi đang chuyển tiếp).
      if (color === COLOR_SORTED) {
        ctx.globalAlpha = 0.35;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      if (isTransitioning && color === COLOR_SWAP) {
        ctx.shadowColor = COLOR_SWAP;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = COLOR_TEXT;
      ctx.font = valueFont;
      ctx.textBaseline = 'bottom';
      ctx.fillText(
        String(Math.round(interpolatedVal)),
        xPos + columnWidth / 2,
        yPos - 5,
      );

      ctx.fillStyle = '#64748b';
      ctx.font = indexFont;
      ctx.textBaseline = 'top';
      ctx.fillText(String(i), xPos + columnWidth / 2, h - MARGIN_BOTTOM + 6);
    }

    if (!isTransitioning) {
      prevBarSnapshot = buildBarSnapshot(currentData, columnWidth);
    }
  }

  function tick(): void {
    renderCanvas();
    if (store.isPlaying) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  }

  function startLoop(): void {
    if (rafId !== null) return;
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

  watch(
    () => store.currentIndex,
    () => { startLoop(); },
  );

  watch(
    () => store.isPlaying,
    (playing) => { if (playing) startLoop(); },
  );

  onMounted(() => {
    const style = getComputedStyle(document.documentElement);
    cachedColorBg = style.getPropertyValue('--canvas-bg').trim() || '#080808';
    resizeCanvas();
    renderCanvas();
    if (containerRef.value) {
      resizeObserver = new ResizeObserver(() => resizeCanvas());
      resizeObserver.observe(containerRef.value);
    }
    // QZ-004: nối click canvas 1 lần — gỡ ở onBeforeUnmount (không leak listener).
    const canvas = canvasRef.value;
    if (canvas) {
      canvasClickHandler = handleCanvasClick;
      canvas.addEventListener('click', canvasClickHandler);
    }
  });

  onBeforeUnmount(() => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    resizeObserver?.disconnect();
    // QZ-004: cleanup bắt buộc — gỡ listener + timer flash khi unmount.
    const canvas = canvasRef.value;
    if (canvas && canvasClickHandler !== null) {
      canvas.removeEventListener('click', canvasClickHandler);
      canvasClickHandler = null;
    }
    if (flashTimer !== null) {
      clearTimeout(flashTimer);
      flashTimer = null;
    }
    flash = null;
  });

  return { currentFrame, totalSteps, progressPercent };
}

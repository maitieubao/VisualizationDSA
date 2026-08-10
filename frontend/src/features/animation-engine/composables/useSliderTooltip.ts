import { ref } from 'vue';
import { useAnimationStore } from '../store/useAnimationStore';
import { parseEmojiToSvg, escapeHtmlText } from '../../../utils/emojiParser';

export interface TooltipState {
  visible: boolean;
  x: number;
  step: number;
  text: string;
  html: string;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// ─── Cache parse emoji → SVG theo nội dung text (EC-019) ───
// Trước đây `parseEmojiToSvg(escapeHtmlText(...))` chạy lại MỖI lần template
// re-render (60-120Hz khi hover kéo slider). Cache theo text giúp mỗi chuỗi
// giải thích chỉ parse đúng 1 lần trong toàn bộ phiên làm việc.
const parsedHtmlCache = new Map<string, string>();

function resolveTooltipHtml(text: string): string {
  const cached = parsedHtmlCache.get(text);
  if (cached !== undefined) return cached;
  const html = parseEmojiToSvg(escapeHtmlText(text));
  parsedHtmlCache.set(text, html);
  return html;
}

export function useSliderTooltip() {
  const animStore = useAnimationStore();
  const tooltip = ref<TooltipState>({ visible: false, x: 0, step: 0, text: '', html: '' });

  // EC-019: vị trí tooltip theo sát chuột nhưng được gom về 1 rAF — chỉ cập
  // nhật 1 lần trong khung hình cuối trước paint, không re-render 60-120Hz.
  let positionRafId: number | null = null;
  let pendingX: number | null = null;

  function commitPendingPosition(): void {
    positionRafId = null;
    if (pendingX !== null) {
      tooltip.value = { ...tooltip.value, x: pendingX };
      pendingX = null;
    }
  }

  function handleSliderHover(event: MouseEvent, container: HTMLElement | null): void {
    if (!container || animStore.frames.length <= 1) {
      tooltip.value.visible = false;
      return;
    }

    const rect = container.getBoundingClientRect();
    const hoverX = event.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, hoverX / rect.width));
    const targetIdx = Math.round(ratio * (animStore.frames.length - 1));
    const frame = animStore.frames[targetIdx];

    if (!frame) return;

    // Nội dung (step/text) không đổi so với lần trước → chỉ dịch vị trí, gom
    // vào rAF. Không tạo object tooltip mới, không parse lại HTML (EC-019).
    if (
      tooltip.value.visible &&
      tooltip.value.step === targetIdx + 1 &&
      tooltip.value.text === frame.explanation
    ) {
      pendingX = hoverX - 100;
      if (positionRafId === null) {
        positionRafId = requestAnimationFrame(commitPendingPosition);
      }
      return;
    }

    // Đổi frame/tooltip mới → cập nhật ngay, html được cache 1 lần/text.
    tooltip.value = {
      visible: true,
      x: hoverX - 100,
      step: targetIdx + 1,
      text: frame.explanation,
      html: resolveTooltipHtml(frame.explanation),
    };
  }

  function hideTooltip(): void {
    if (positionRafId !== null) {
      cancelAnimationFrame(positionRafId);
      positionRafId = null;
      pendingX = null;
    }
    tooltip.value = { ...tooltip.value, visible: false };
  }

  // Vệ sinh rAF đang chờ khi component bị tháo — không để tick orphan chạy.
  function dispose(): void {
    if (positionRafId !== null) {
      cancelAnimationFrame(positionRafId);
      positionRafId = null;
      pendingX = null;
    }
  }

  return { tooltip, handleSliderHover, hideTooltip, dispose };
}
import { ref } from 'vue';
import { useAnimationStore } from '../store/useAnimationStore';

export interface TooltipState {
  visible: boolean;
  x: number;
  step: number;
  text: string;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function useSliderTooltip() {
  const animStore = useAnimationStore();
  const tooltip = ref<TooltipState>({ visible: false, x: 0, step: 0, text: '' });

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

    if (frame) {
      tooltip.value = {
        visible: true,
        x: hoverX - 100,
        step: targetIdx + 1,
        text: frame.explanation,
      };
    }
  }

  function hideTooltip(): void {
    tooltip.value = { ...tooltip.value, visible: false };
  }

  return { tooltip, handleSliderHover, hideTooltip };
}

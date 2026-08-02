import { ref } from 'vue';
import { CoreAnimationEngine } from '../../../core/CoreAnimationEngine';
import type { PlaybackFrame } from '../../../core/CompilerStepExecutor';
import { type AnimatedItem, COLORS, lerpRGB } from '../types/canvas.types';

const slotWidth = 70;
const gap = 20;

export function useAnimatedItems() {
  const items = ref<AnimatedItem[]>([]);

  const initializeItems = (arr: number[]) => {
    items.value = arr.map((val, idx) => {
      const targetX = idx * (slotWidth + gap);
      return {
        id: idx, value: val,
        currentX: targetX, targetX,
        currentScale: 1.0, targetScale: 1.0,
        currentRGB: { ...COLORS.normal },
        targetRGB: { ...COLORS.normal },
        status: 'normal' as const,
      };
    });
  };

  const matchNewArrayToItems = (newArr: number[]) => {
    const usedIds = new Set<number>();
    const newOrder: AnimatedItem[] = [];

    for (let i = 0; i < newArr.length; i++) {
      const val = newArr[i];
      let bestMatchIdx = -1;
      let minDistance = Infinity;

      for (let j = 0; j < items.value.length; j++) {
        if (usedIds.has(items.value[j].id)) continue;
        if (items.value[j].value === val) {
          const dist = Math.abs(j - i);
          if (dist < minDistance) { minDistance = dist; bestMatchIdx = j; }
        }
      }

      if (bestMatchIdx !== -1) {
        usedIds.add(items.value[bestMatchIdx].id);
        newOrder.push(items.value[bestMatchIdx]);
      } else {
        newOrder.push({
          id: Math.random(), value: val,
          currentX: i * (slotWidth + gap), targetX: i * (slotWidth + gap),
          currentScale: 0.0, targetScale: 1.0,
          currentRGB: { ...COLORS.normal }, targetRGB: { ...COLORS.normal },
          status: 'normal',
        });
      }
    }

    items.value = newOrder;
    items.value.forEach((item, idx) => { item.targetX = idx * (slotWidth + gap); });
  };

  const updateItemStatuses = (frame: PlaybackFrame) => {
    const comparing: number[]   = frame.canvasStateSnapshot.comparingIndices  || [];
    const swapping: number[]    = frame.canvasStateSnapshot.swappingIndices   || [];
    const highlighted = frame.canvasStateSnapshot.highlightedIndices || [];

    items.value.forEach((item, idx) => {
      if (swapping.includes(idx)) {
        item.status = 'swap'; item.targetRGB = { ...COLORS.swap }; item.targetScale = 1.12;
      } else if (comparing.includes(idx)) {
        item.status = 'compare'; item.targetRGB = { ...COLORS.compare }; item.targetScale = 1.05;
      } else if (highlighted.includes(idx)) {
        item.status = 'highlight'; item.targetRGB = { ...COLORS.highlight }; item.targetScale = 1.08;
      } else {
        item.status = 'normal'; item.targetRGB = { ...COLORS.normal }; item.targetScale = 1.0;
      }
    });
  };

  const tickLerp = (lerpFactor: number) => {
    items.value.forEach(item => {
      item.currentX     = CoreAnimationEngine.lerp(item.currentX,     item.targetX,     lerpFactor);
      item.currentScale = CoreAnimationEngine.lerp(item.currentScale, item.targetScale, lerpFactor);
      item.currentRGB   = lerpRGB(item.currentRGB, item.targetRGB, lerpFactor);
    });
  };

  return {
    items,
    slotWidth,
    gap,
    COLORS,
    initializeItems,
    matchNewArrayToItems,
    updateItemStatuses,
    tickLerp,
  };
}

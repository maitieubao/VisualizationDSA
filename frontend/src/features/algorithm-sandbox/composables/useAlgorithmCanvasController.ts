import { computed, onMounted, onBeforeUnmount, watch, type Ref } from 'vue';
import { useVcrStore } from '../../vcr-player/store/useVcrStore';
import { CoreAnimationEngine } from '../../../core/CoreAnimationEngine';
import { isPlaybackFrame } from '../../../core/CompilerStepExecutor';
import { useCamera } from './useCamera';
import { useMousePan } from './useMousePan';
import { useCanvasResize } from './useCanvasResize';
import { useAnimatedItems } from './useAnimatedItems';
import { renderArrayBar } from '../renderers/renderArrayBar';
import { renderLoopPointers } from '../renderers/renderLoopPointer';

export function useAlgorithmCanvasController(
  canvas: Ref<HTMLCanvasElement | null>,
  container: Ref<HTMLDivElement | null>,
  SLOT_WIDTH = 70,
  SLOT_HEIGHT = 160,
  GAP = 20
) {
  const vcrStore = useVcrStore();
  const { camera, resetViewport, handleWheel } = useCamera(canvas, SLOT_WIDTH, SLOT_HEIGHT, GAP);
  const { onMouseDown, onMouseMove, onMouseUp, onMouseLeave } = useMousePan(camera);
  const { items, initializeItems, matchNewArrayToItems, updateItemStatuses, tickLerp } = useAnimatedItems();

  const { resizeCanvas, startListening, stopListening } = useCanvasResize(canvas, container, () => {
    resetViewport(vcrStore.inputArray.length || 6);
  });

  const currentStepDescription = computed(() => vcrStore.currentFrame?.description ?? 'Sẵn sàng khởi chạy thuật toán');
  const handleResetViewport = () => resetViewport(vcrStore.inputArray.length || 6);

  let animationEngine: CoreAnimationEngine | null = null;

  const render = (deltaTime: number) => {
    if (!canvas.value) return;
    const ctx = canvas.value.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.translate(camera.value.x, camera.value.y);
    ctx.scale(camera.value.zoom, camera.value.zoom);

    const maxVal = Math.max(...items.value.map(i => i.value), 1);
    const speedAdjustedT = Math.min(0.008 * deltaTime * vcrStore.playbackSpeed, 1.0);
    const lerpFactor = vcrStore.isPlaying ? speedAdjustedT : Math.min(0.012 * deltaTime, 1.0);

    tickLerp(lerpFactor);

    items.value.forEach((item, idx) => renderArrayBar(ctx, item, idx, maxVal, SLOT_WIDTH, SLOT_HEIGHT));

    const frame = vcrStore.currentFrame;
    if (isPlaybackFrame(frame) && frame.canvasStateSnapshot.loopVariables) {
      renderLoopPointers(ctx, frame.canvasStateSnapshot.loopVariables, items.value, SLOT_WIDTH);
    }
    ctx.restore();
  };

  watch(() => vcrStore.inputArray, (newArr) => {
    initializeItems(newArr);
    resetViewport(newArr.length);
  }, { deep: true });

  watch(() => vcrStore.currentFrame, (newFrame) => {
    if (isPlaybackFrame(newFrame)) {
      matchNewArrayToItems(newFrame.canvasStateSnapshot.array);
      updateItemStatuses(newFrame);
    }
  });

  onMounted(() => {
    initializeItems(vcrStore.inputArray);
    setTimeout(() => {
      resizeCanvas();
      canvas.value?.addEventListener('wheel', handleWheel, { passive: false });
    }, 100);
    startListening();
    animationEngine = new CoreAnimationEngine();
    animationEngine.registerRender(render);
  });

  onBeforeUnmount(() => {
    stopListening();
    canvas.value?.removeEventListener('wheel', handleWheel);
    animationEngine?.destroy();
  });

  return {
    camera,
    currentStepDescription,
    handleResetViewport,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
  };
}

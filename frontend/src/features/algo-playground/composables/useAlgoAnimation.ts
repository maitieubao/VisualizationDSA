import { ref, watch, onMounted, onBeforeUnmount, type Ref } from 'vue';
import { AlgoAnimationEngine } from '../engine/AlgoAnimationEngine';
import type { useAlgoPlaygroundStore } from '../store/useAlgoPlaygroundStore';

export function useAlgoAnimation(
  canvasRef: Ref<HTMLCanvasElement | null>,
  store: ReturnType<typeof useAlgoPlaygroundStore>,
) {
  const engine = new AlgoAnimationEngine();
  const isReady = ref(false);

  function syncSnapshots(): void {
    const idx = store.currentIndex;
    const frames = store.frames;
    if (frames.length === 0) return;

    const currentFrame = frames[idx];
    if (!currentFrame) return;

    // Ở bước 0, prev = chính frame 0 (thay vì null): nếu null, engine loop
    // không bao giờ advance (điều kiện `this.prev && this.curr`) → bấm ▶ không chạy,
    // phải next step 1 lần mới chạy. Với prev = curr, transition 'move' vẽ tĩnh rồi advance.
    const prevFrame = frames[Math.max(0, idx - 1)];

    engine.setSnapshots(
      prevFrame?.canvasStateSnapshot ?? null,
      currentFrame.canvasStateSnapshot,
    );
  }

  function handleFrameAdvance(): void {
    store.stepNext();
  }

  watch(() => store.currentIndex, () => {
    syncSnapshots();
  });

  watch(() => store.isPlaying, (playing) => {
    if (playing) {
      engine.play();
    } else {
      engine.pause();
      // Dừng ở frame tĩnh của bước hiện tại — không treo giữa chừng transition
      engine.snapToCurrent();
    }
  });

  watch(() => store.playbackSpeed, (speed) => {
    engine.setSpeed(speed);
  });

  watch(() => store.frames, () => {
    // AL-003: watcher isPlaying chạy TRƯỚC watcher frames khi Play→compile→auto-play
    // (engine.pause() cứng ở đây ghi đè play vừa bật) → store isPlaying=true nhưng
    // engine đứng im frame 0. Nay theo đúng trạng thái store: đang play thì play(),
    // không thì pause() (snapToCurrent để frame tĩnh do watcher isPlaying lo).
    if (store.isPlaying) {
      engine.play();
    } else {
      engine.pause();
    }
    syncSnapshots();
  });

  watch(() => store.demoId, (id) => {
    engine.setAlgorithm(id ?? '');
  }, { immediate: true });

  function onStepNext(): void {
    store.stepNext();
    engine.snapToCurrent();
  }

  function onStepPrev(): void {
    store.stepPrev();
    engine.snapToCurrent();
  }

  function onJumpToFrame(index: number): void {
    store.jumpToFrame(index);
    engine.snapToCurrent();
  }

  function onReset(): void {
    store.reset();
    engine.pause();
    syncSnapshots();
  }

  function onResize(): void {
    engine.snapToCurrent();
  }

  onMounted(() => {
    if (canvasRef.value) {
      engine.start(canvasRef.value, handleFrameAdvance);
      engine.setSpeed(store.playbackSpeed);
      isReady.value = true;
      syncSnapshots();
    }
  });

  onBeforeUnmount(() => {
    engine.destroy();
  });

  return {
    engine,
    isReady,
    onStepNext,
    onStepPrev,
    onJumpToFrame,
    onReset,
    onResize,
  };
}

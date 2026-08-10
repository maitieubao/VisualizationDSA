import { onMounted, onBeforeUnmount } from 'vue';
import { useAnimationStore } from '../store/useAnimationStore';

export function usePlaybackHotkeys() {
  const animStore = useAnimationStore();

  function createHotkeyHandler(): (event: KeyboardEvent) => void {
    return (event: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
        return;
      }

      if (animStore.playbackState === 'UNINITIALIZED') return;
      if (animStore.interactionLocked) return;

      // Chặn phím lặp (giữ phím) cho Space/R — tránh toggle rung nhấp nháy.
      // Arrow cho phép repeat vì store đã có debounce 100ms cho step.
      if (event.repeat && (event.code === 'Space' || event.code === 'KeyR')) return;

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          if (animStore.isFinished) {
            animStore.goToFrame(0);
            animStore.play();
          } else {
            animStore.togglePlay();
          }
          break;

        case 'ArrowRight':
          event.preventDefault();
          if (event.shiftKey) {
            animStore.goToFrame(animStore.frames.length - 1);
            animStore.pause();
          } else {
            animStore.stepForward();
          }
          break;

        case 'ArrowLeft':
          event.preventDefault();
          if (event.shiftKey) {
            animStore.goToFrame(0);
            animStore.pause();
          } else {
            animStore.stepBackward();
          }
          break;

        case 'KeyR':
        case 'Escape':
          event.preventDefault();
          animStore.stop();
          break;

        default:
          break;
      }
    };
  }

  function registerHotkeys(): () => void {
    const handler = createHotkeyHandler();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }

  return { createHotkeyHandler, registerHotkeys };
}

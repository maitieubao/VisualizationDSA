import { onMounted, onBeforeUnmount } from 'vue';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';





export function useDSAKeyboard(
  isAlgorithmActive: () => boolean,
  animStore: ReturnType<typeof useAnimationStore>,
): void {
  function handleKeydown(e: KeyboardEvent): void {
    if (!isAlgorithmActive()) return;
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLSelectElement
    ) return;

    switch (e.key) {
      case ' ':
        e.preventDefault();
        animStore.isPlaying ? animStore.pause() : animStore.play();
        break;
      case 'ArrowRight':
        e.preventDefault();
        animStore.stepForward();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        animStore.stepBackward();
        break;
      case 'r':
      case 'R':
        e.preventDefault();
        animStore.stop();
        break;
    }
  }

  onMounted(() => document.addEventListener('keydown', handleKeydown));
  onBeforeUnmount(() => document.removeEventListener('keydown', handleKeydown));
}

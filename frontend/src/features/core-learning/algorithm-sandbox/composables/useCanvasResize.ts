import type { Ref } from 'vue';

/**
 * useCanvasResize — xử lý resize canvas khi container thay đổi kích thước.
 * Tự động xử lý devicePixelRatio (DPR) để hỗ trợ màn hình Retina.
 */
export function useCanvasResize(
  canvasRef: Ref<HTMLCanvasElement | null>,
  containerRef: Ref<HTMLDivElement | null>,
  onResized: () => void
) {
  const resizeCanvas = () => {
    if (!canvasRef.value || !containerRef.value) return;
    const rect = containerRef.value.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvasRef.value.width = rect.width * dpr;
    canvasRef.value.height = rect.height * dpr;
    canvasRef.value.style.width = `${rect.width}px`;
    canvasRef.value.style.height = `${rect.height}px`;
    onResized();
  };

  const startListening = () => window.addEventListener('resize', resizeCanvas);
  const stopListening = () => window.removeEventListener('resize', resizeCanvas);

  return { resizeCanvas, startListening, stopListening };
}

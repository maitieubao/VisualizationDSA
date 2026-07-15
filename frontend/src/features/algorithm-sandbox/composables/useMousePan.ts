import { ref } from 'vue';
import type { Ref } from 'vue';
import type { Camera } from './useCamera';

/**
 * useMousePan — xử lý toàn bộ sự kiện chuột để pan camera.
 * Tách ra từ AlgorithmCanvas.vue để đảm bảo SRP.
 */
export function useMousePan(camera: Ref<Camera>) {
  const isPanning = ref(false);
  const panStart = ref({ x: 0, y: 0 });

  const onMouseDown = (e: MouseEvent) => {
    isPanning.value = true;
    panStart.value = { x: e.clientX - camera.value.x, y: e.clientY - camera.value.y };
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isPanning.value) return;
    camera.value.x = e.clientX - panStart.value.x;
    camera.value.y = e.clientY - panStart.value.y;
  };

  const onMouseUp = () => { isPanning.value = false; };
  const onMouseLeave = () => { isPanning.value = false; };

  return { onMouseDown, onMouseMove, onMouseUp, onMouseLeave };
}

import type { Ref } from 'vue';
import { ref } from 'vue';


export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

/**
 * useCamera — quản lý trạng thái camera viewport (pan, zoom, reset).
 * Tách ra từ AlgorithmCanvas.vue để đảm bảo SRP.
 */
export function useCamera(
  canvasRef: Ref<HTMLCanvasElement | null>,
  slotWidth: number,
  slotHeight: number,
  gap: number
) {
  const camera = ref<Camera>({ x: 0, y: 0, zoom: 1.0 });

  const resetViewport = (arrLength: number) => {
    if (!canvasRef.value) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvasRef.value.width / dpr;
    const h = canvasRef.value.height / dpr;

    const totalW = arrLength * slotWidth + (arrLength - 1) * gap;
    let zoom = 1.0;
    if (totalW > w * 0.75) zoom = (w * 0.75) / totalW;

    camera.value.zoom = zoom;
    camera.value.x = (w - totalW * zoom) / 2;
    camera.value.y = (h - slotHeight * zoom) / 2 - 20;
  };

  const handleWheel = (e: WheelEvent) => {
    if (!canvasRef.value) return;
    e.preventDefault();
    const rect = canvasRef.value.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const canvasX = (mouseX - camera.value.x) / camera.value.zoom;
    const canvasY = (mouseY - camera.value.y) / camera.value.zoom;
    const zoomIntensity = 0.08;
    const delta = -e.deltaY;
    let newZoom = camera.value.zoom * (1 + (delta > 0 ? zoomIntensity : -zoomIntensity));
    newZoom = Math.max(0.4, Math.min(3.5, newZoom));
    camera.value.zoom = newZoom;
    camera.value.x = mouseX - canvasX * newZoom;
    camera.value.y = mouseY - canvasY * newZoom;
  };

  return { camera, resetViewport, handleWheel };
}

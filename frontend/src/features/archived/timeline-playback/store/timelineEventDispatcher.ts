import type { CanvasStateSnapshot } from '../types/timeline-playback.types';

export function triggerMonacoLineSync(lineNumber: number): void {
  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
    const syncEvent = new CustomEvent('MONACO_REVEAL_LINE_INSIGHT', {
      detail: { lineNumber },
    });
    window.dispatchEvent(syncEvent);
  }
}

export function triggerCanvasStateUpdate(snapshot: CanvasStateSnapshot): void {
  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
    const syncEvent = new CustomEvent('CANVAS_REDRAW_STATE_SNAPSHOT', {
      detail: { snapshot },
    });
    window.dispatchEvent(syncEvent);
  }
}

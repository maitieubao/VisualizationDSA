import type { SortFrame } from '../types/sorting.types';

/**
 * enrichFramesWithIds — Assigns stable element IDs across all frames so that
 * Vue's transition-group can track elements correctly between steps.
 *
 * If the first frame already has arrayStateWithIds populated (e.g. from an
 * algorithm that manages its own IDs like Radix Sort), this function is a
 * no-op — the in-algorithm IDs are used as-is to prevent ID corruption.
 */
export function enrichFramesWithIds(frames: SortFrame[]): void {
  if (frames.length === 0) return;

  // Skip enrichment for algorithms that already emit stable IDs themselves
  if (frames[0].arrayStateWithIds && frames[0].arrayStateWithIds.length > 0) return;

  const n = frames[0].arrayState.length;
  
  // Assign initial stable IDs 0 to n-1
  const initialIds = Array.from({ length: n }, (_, i) => i);
  frames[0].arrayStateWithIds = frames[0].arrayState.map((val, idx) => ({
    id: initialIds[idx],
    value: val
  }));

  for (let k = 1; k < frames.length; k++) {
    const prevFrame = frames[k - 1];
    const currFrame = frames[k];
    const currArr = currFrame.arrayState;
    const prevItems = [...prevFrame.arrayStateWithIds!];
    const currIds: number[] = [];

    for (let i = 0; i < currArr.length; i++) {
      const val = currArr[i];
      let matchIdx = -1;
      let minDist = Infinity;

      for (let j = 0; j < prevItems.length; j++) {
        if (prevItems[j].value === val) {
          const dist = Math.abs(j - i);
          if (dist < minDist) {
            minDist = dist;
            matchIdx = j;
          }
        }
      }

      if (matchIdx !== -1) {
        currIds.push(prevItems[matchIdx].id);
        prevItems.splice(matchIdx, 1);
      } else {
        currIds.push(Math.random());
      }
    }

    currFrame.arrayStateWithIds = currArr.map((val, idx) => ({
      id: currIds[idx],
      value: val
    }));
  }
}

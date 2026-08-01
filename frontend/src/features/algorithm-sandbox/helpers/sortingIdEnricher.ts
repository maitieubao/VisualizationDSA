import type { SortFrame } from '../types/sorting.types';

let globalIdCounter = 10000;

function nextId(): number {
  return globalIdCounter++;
}

export function enrichFramesWithIds(frames: SortFrame[]): void {
  if (frames.length === 0) return;

  if (frames[0].arrayStateWithIds && frames[0].arrayStateWithIds.length > 0) return;

  const n = frames[0].arrayState.length;
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
        currIds.push(nextId());
      }
    }

    currFrame.arrayStateWithIds = currArr.map((val, idx) => ({
      id: currIds[idx],
      value: val
    }));
  }
}

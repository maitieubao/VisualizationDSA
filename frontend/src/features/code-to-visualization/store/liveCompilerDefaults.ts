import type { LiveFrameDTO } from '../types/compiler.types';
import type { FrameDTO } from '../../animation-engine/types/animation.types';

export const DEFAULT_SOURCE_CODE = `function bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
}`;

export const DEFAULT_INPUT_ARRAY = [5, 3, 8, 1, 9, 2, 7, 4, 6];

/**
 * Chuyển đổi LiveFrameDTO[] sang FrameDTO[] tương thích useAnimationStore.
 */
export function convertToAnimationFrames(liveFrames: LiveFrameDTO[]): FrameDTO[] {
  return liveFrames.map((lf, index) => {
    const highlights = {
      compare: lf.type === 'COMPARE' ? lf.indices : [],
      swap:    lf.type === 'SWAP'    ? lf.indices : [],
      sorted:  lf.type === 'ACCESS'  ? Array.from({ length: lf.arrayState.length }, (_, i) => i) : [],
    };

    let explanation = '';
    if (lf.type === 'COMPARE')      explanation = `So sánh phần tử tại vị trí [${lf.indices.join(', ')}]`;
    else if (lf.type === 'SWAP')    explanation = `Gán trị phần tử tại vị trí [${lf.indices.join(', ')}]`;
    else                            explanation = 'Thuật toán hoàn thành — mảng đã được sắp xếp.';

    return { stepId: index + 1, activeLine: 0, explanation, dataState: lf.arrayState, highlights, variables: lf.variables };
  });
}

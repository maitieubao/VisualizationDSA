import type { LiveFrameDTO } from '../types/compiler.types';
import type { FrameDTO, HighlightIndices } from '../../animation-engine/types/animation.types';

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




export function convertToAnimationFrames(liveFrames: LiveFrameDTO[]): FrameDTO[] {
  return liveFrames.map((lf, index) => {
    // CV-144: ASSIGN (gán 1 phần tử) đi vào kênh highlight riêng `assign`,
    // không còn giả làm SWAP (hoán vị 2 phần tử) — ngữ nghĩa hình ảnh khớp text.
    // Key chỉ xuất hiện trên frame ASSIGN để không phá toEqual các suite khác.
    const highlights: HighlightIndices = {
      compare: lf.type === 'COMPARE' ? lf.indices : [],
      swap:    lf.type === 'SWAP' ? lf.indices : [],
      sorted:  [],
      ...(lf.type === 'ASSIGN' ? { assign: lf.indices } : {}),
    };

    let explanation = '';
    if (lf.type === 'COMPARE')      explanation = `So sánh phần tử tại vị trí [${lf.indices.join(', ')}]`;
    else if (lf.type === 'SWAP')    explanation = `Hoán vị phần tử tại vị trí [${lf.indices.join(', ')}]`;
    else if (lf.type === 'ASSIGN')  explanation = `Gán giá trị mới cho phần tử tại vị trí [${lf.indices.join(', ')}]`;
    else                            explanation = 'Thuật toán kết thúc.';

    return { stepId: index + 1, activeLine: lf.lineNumber ?? 0, explanation, dataState: lf.arrayState, highlights, variables: lf.variables };
  });
}

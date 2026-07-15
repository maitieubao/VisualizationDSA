/**
 * Kịch bản mã nguồn đa ngôn ngữ cho thuật toán Bubble Sort.
 * Ánh xạ logicalId chéo ngôn ngữ: FUNC_DECL, OUTER_LOOP, INNER_LOOP, COMPARE_STEP, SWAP_STEP.
 */

import type { PseudocodeScript } from '../types/pseudocode.types';

export const bubbleSortScript: PseudocodeScript = {
  algorithmId: 'bubble-sort',
  languages: [
    {
      language: 'cpp',
      lines: [
        { lineNumber: 1, text: 'void bubbleSort(int arr[], int n) {', logicalId: 'FUNC_DECL' },
        { lineNumber: 2, text: '  for (int i = 0; i < n-1; i++) {', logicalId: 'OUTER_LOOP' },
        { lineNumber: 3, text: '    for (int j = 0; j < n-i-1; j++) {', logicalId: 'INNER_LOOP' },
        { lineNumber: 4, text: '      if (arr[j] > arr[j+1]) {', logicalId: 'COMPARE_STEP' },
        { lineNumber: 5, text: '        swap(arr[j], arr[j+1]);', logicalId: 'SWAP_STEP' },
        { lineNumber: 6, text: '      }', logicalId: 'NO_ACTION' },
        { lineNumber: 7, text: '    }', logicalId: 'NO_ACTION' },
        { lineNumber: 8, text: '  }', logicalId: 'NO_ACTION' },
        { lineNumber: 9, text: '}', logicalId: 'NO_ACTION' },
      ],
    },
    {
      language: 'java',
      lines: [
        { lineNumber: 1, text: 'void bubbleSort(int[] arr, int n) {', logicalId: 'FUNC_DECL' },
        { lineNumber: 2, text: '  for (int i = 0; i < n-1; i++) {', logicalId: 'OUTER_LOOP' },
        { lineNumber: 3, text: '    for (int j = 0; j < n-i-1; j++) {', logicalId: 'INNER_LOOP' },
        { lineNumber: 4, text: '      if (arr[j] > arr[j+1]) {', logicalId: 'COMPARE_STEP' },
        { lineNumber: 5, text: '        int temp = arr[j];', logicalId: 'SWAP_STEP' },
        { lineNumber: 6, text: '        arr[j] = arr[j+1];', logicalId: 'SWAP_STEP' },
        { lineNumber: 7, text: '        arr[j+1] = temp;', logicalId: 'SWAP_STEP' },
        { lineNumber: 8, text: '      }', logicalId: 'NO_ACTION' },
        { lineNumber: 9, text: '    }', logicalId: 'NO_ACTION' },
        { lineNumber: 10, text: '  }', logicalId: 'NO_ACTION' },
        { lineNumber: 11, text: '}', logicalId: 'NO_ACTION' },
      ],
    },
    {
      language: 'python',
      lines: [
        { lineNumber: 1, text: 'def bubble_sort(arr):', logicalId: 'FUNC_DECL' },
        { lineNumber: 2, text: '    n = len(arr)', logicalId: 'FUNC_DECL' },
        { lineNumber: 3, text: '    for i in range(n - 1):', logicalId: 'OUTER_LOOP' },
        { lineNumber: 4, text: '        for j in range(n - i - 1):', logicalId: 'INNER_LOOP' },
        { lineNumber: 5, text: '            if arr[j] > arr[j + 1]:', logicalId: 'COMPARE_STEP' },
        { lineNumber: 6, text: '                arr[j], arr[j+1] = arr[j+1], arr[j]', logicalId: 'SWAP_STEP' },
      ],
    },
    {
      language: 'javascript',
      lines: [
        { lineNumber: 1, text: 'function bubbleSort(arr) {', logicalId: 'FUNC_DECL' },
        { lineNumber: 2, text: '  const n = arr.length;', logicalId: 'FUNC_DECL' },
        { lineNumber: 3, text: '  for (let i = 0; i < n - 1; i++) {', logicalId: 'OUTER_LOOP' },
        { lineNumber: 4, text: '    for (let j = 0; j < n - i - 1; j++) {', logicalId: 'INNER_LOOP' },
        { lineNumber: 5, text: '      if (arr[j] > arr[j + 1]) {', logicalId: 'COMPARE_STEP' },
        { lineNumber: 6, text: '        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];', logicalId: 'SWAP_STEP' },
        { lineNumber: 7, text: '      }', logicalId: 'NO_ACTION' },
        { lineNumber: 8, text: '    }', logicalId: 'NO_ACTION' },
        { lineNumber: 9, text: '  }', logicalId: 'NO_ACTION' },
        { lineNumber: 10, text: '}', logicalId: 'NO_ACTION' },
      ],
    },
  ],
};

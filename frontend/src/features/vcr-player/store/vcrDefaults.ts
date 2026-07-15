/**
 * Default bubble sort source code cho VCR player.
 * Tách ra để giữ useVcrStore.ts < 100 dòng.
 */
export const DEFAULT_BUBBLE_SORT_CODE = `// Thuật toán Sắp xếp nổi bọt
for (let i = 0; i < array.length - 1; i++) {
  for (let j = 0; j < array.length - i - 1; j++) {
    // Gọi compare để tô sáng 2 phần tử đang được so sánh
    compare(j, j + 1);
    
    if (array[j] > array[j + 1]) {
      // Gọi swap để tráo đổi vị trí của chúng
      swap(j, j + 1);
    }
  }
  // Đánh dấu phần tử cuối cùng của lượt này đã đứng đúng chỗ
  highlight(array.length - i - 1);
}
// Đánh dấu phần tử đầu tiên đã xếp xong
highlight(0);`;

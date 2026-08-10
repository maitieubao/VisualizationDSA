



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

/** Chuỗi input mặc định hiển thị trong ô nhập dữ liệu (EC-049: gom hằng số tránh hardcode rải rác). */
export const DEFAULT_INPUT_RAW = '45, 12, 85, 32, 9, 60';

/** Mảng input fallback khi user xóa trống ô nhập (EC-049) — trước đây hardcode trùng trong useVcrStore. */
export const DEFAULT_INPUT_ARRAY: number[] = [45, 12, 85, 32, 9, 60];

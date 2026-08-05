import type { CodeLabTask } from '../types/lesson.types';

/**
 * Registry bài tập CodeLab mức cơ bản cho khóa học nhập môn.
 * Key = demo id của AlgoPlayground (`sandboxConfig.demo`).
 *
 * Quy ước testcase:
 *   • `input` là JSON ARRAY các tham số của entry function, vd "[[1,3,5,7,9],7]" → fn([1,3,5,7,9], 7)
 *   • `expectedOutput` là JSON.stringify của kết quả mong đợi (khoảng trắng bị bỏ qua khi so sánh).
 */
export const CODELAB_TASK_REGISTRY: Record<string, CodeLabTask> = {
  'binary-search': {
    description:
      'Hoàn thiện hàm `binarySearch(arr, target)` trả về chỉ số của target trong mảng đã sắp xếp tăng dần, hoặc -1 nếu không tồn tại. Yêu cầu độ phức tạp O(log N).',
    initialCode: `function binarySearch(arr, target) {
  // TODO: Viết code tại đây

  return -1;
}`,
    solution: `function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
    entryFunction: 'binarySearch',
    testCases: [
      { input: '[[1, 3, 5, 7, 9], 7]', expectedOutput: '3' },
      { input: '[[1, 3, 5, 7, 9], 4]', expectedOutput: '-1' },
      { input: '[[] , 5]', expectedOutput: '-1', isHidden: true },
    ],
    hints: [
      'Khởi tạo hai con trỏ lo = 0, hi = arr.length - 1.',
      'Tính mid = Math.floor((lo + hi) / 2); nếu arr[mid] < target thì lo = mid + 1, ngược lại hi = mid - 1.',
      'Lặp while (lo <= hi) — khi lo vượt hi nghĩa là không tìm thấy, trả về -1.',
    ],
  },

  'bubble-sort': {
    description:
      'Hoàn thiện hàm `bubbleSort(arr)` trả về mảng đã sắp xếp tăng dần bằng thuật toán Bubble Sort (so sánh cặp liền kề, phần tử lớn "nổi" về cuối).',
    initialCode: `function bubbleSort(arr) {
  // TODO: Viết code tại đây

  return arr;
}`,
    solution: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return arr;
}`,
    entryFunction: 'bubbleSort',
    testCases: [
      { input: '[[5, 2, 9, 1, 5, 6]]', expectedOutput: '[1, 2, 5, 5, 6, 9]' },
      { input: '[[10, -2, 4, 0]]', expectedOutput: '[-2, 0, 4, 10]' },
      { input: '[[]]', expectedOutput: '[]', isHidden: true },
    ],
    hints: [
      'Dùng hai vòng lặp lồng nhau: vòng ngoài chạy 0..n-2, vòng trong so sánh cặp liền kề.',
      'Nếu arr[j] > arr[j+1] thì hoán đổi hai phần tử.',
      'Tối ưu: nếu một lượt duyệt không có hoán đổi nào, mảng đã sắp xếp — dừng sớm.',
    ],
  },

  'stack': {
    description:
      'Hoàn thiện hàm `isValid(s)` kiểm tra chuỗi ngoặc `()[]{}` có hợp lệ hay không, sử dụng cấu trúc Ngăn xếp (LIFO). Trả về true nếu hợp lệ, false nếu không.',
    initialCode: `function isValid(s) {
  // TODO: Dùng stack để kiểm tra ngoặc cân bằng

  return true;
}`,
    solution: `function isValid(s) {
  const stack = [];
  const pairs = { ')': '(', ']': '[', '}': '{' };
  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch);
    } else {
      if (stack.length === 0 || stack.pop() !== pairs[ch]) return false;
    }
  }
  return stack.length === 0;
}`,
    entryFunction: 'isValid',
    testCases: [
      { input: '["()[]{}"]', expectedOutput: 'true' },
      { input: '["([)]"]', expectedOutput: 'false' },
      { input: '["(]"]', expectedOutput: 'false', isHidden: true },
    ],
    hints: [
      'Gặp ký tự mở ngoặc ( ( [ { ) thì push vào stack.',
      'Gặp ký tự đóng ngoặc thì kiểm tra đỉnh stack có khớp cặp mở tương ứng không.',
      'Cuối cùng stack phải rỗng thì chuỗi mới hợp lệ.',
    ],
  },

  'tree-traversal': {
    description:
      'Hoàn thiện hàm đệ quy `factorial(n)` tính n! (n ≥ 0). Đây là ví dụ kinh điển minh họa Call Stack đệ quy: mỗi lần gọi đẩy một frame lên stack cho tới base case.',
    initialCode: `function factorial(n) {
  // TODO: Viết code đệ quy tại đây

  return 0;
}`,
    solution: `function factorial(n) {
  if (n <= 1) return 1; // base case
  return n * factorial(n - 1); // recursive case
}`,
    entryFunction: 'factorial',
    testCases: [
      { input: '[5]', expectedOutput: '120' },
      { input: '[0]', expectedOutput: '1' },
      { input: '[10]', expectedOutput: '3628800', isHidden: true },
    ],
    hints: [
      'Base case: n ≤ 1 thì trả về 1 (điều kiện dừng).',
      'Recursive case: trả về n * factorial(n - 1).',
      'Nếu thiếu base case, hàm sẽ tràn Call Stack (StackOverflow).',
    ],
  },

  'two-pointers': {
    description:
      'Hoàn thiện hàm `isPalindrome(s)` kiểm tra chuỗi có phải palindrome hay không (đọc xuôi ngược giống nhau, bỏ qua khoảng trắng) bằng kỹ thuật hai con trỏ trái/phải.',
    initialCode: `function isPalindrome(s) {
  // TODO: Dùng hai con trỏ left/right tại đây

  return true;
}`,
    solution: `function isPalindrome(s) {
  let left = 0, right = s.length - 1;
  while (left < right) {
    if (s[left] !== s[right]) return false;
    left++;
    right--;
  }
  return true;
}`,
    entryFunction: 'isPalindrome',
    testCases: [
      { input: '["racecar"]', expectedOutput: 'true' },
      { input: '["hello"]', expectedOutput: 'false' },
      { input: '[""]', expectedOutput: 'true', isHidden: true },
    ],
    hints: [
      'Đặt con trỏ left ở đầu, right ở cuối chuỗi.',
      'So sánh s[left] với s[right]; khác nhau → không phải palindrome.',
      'Mỗi bước di chuyển left++ và right-- cho tới khi left ≥ right.',
    ],
  },
};

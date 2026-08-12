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
      'Hoàn thiện hàm đệ quy `inorder(root)` duyệt cây nhị phân theo thứ tự In-order (trái → gốc → phải) và trả về mảng giá trị. Cây biểu diễn dạng mảng lồng nhau `[value, left, right]`; node rỗng là `null`. Ví dụ `[1,[2,null,null],[3,null,null]]` là cây gốc 1, trái 2, phải 3 → kết quả `[2,1,3]`.',
    initialCode: `function inorder(root) {
  // TODO: Duyệt cây In-order (trái → gốc → phải) tại đây
  const result = [];
  return result;
}`,
    solution: `function inorder(root) {
  const result = [];
  function dfs(node) {
    if (node === null) return; // base case
    dfs(node[1]); // trái
    result.push(node[0]); // gốc
    dfs(node[2]); // phải
  }
  dfs(root);
  return result;
}`,
    entryFunction: 'inorder',
    testCases: [
      { input: '[[1,[2,[4,null,null],null],[3,null,null]]]', expectedOutput: '[4,2,1,3]' },
      { input: '[[1,null,[2,null,null]]]', expectedOutput: '[1,2]' },
      { input: '[null]', expectedOutput: '[]', isHidden: true },
    ],
    hints: [
      'Biểu diễn node: node[0] = giá trị, node[1] = cây con trái, node[2] = cây con phải; node === null là cây rỗng.',
      'Viết hàm con dfs(node): nếu node null thì dừng; đệ quy sang trái, push giá trị node[0], rồi đệ quy sang phải.',
      'Thiếu base case (node === null) sẽ tràn Call Stack (StackOverflow) — giống lỗi kinh điển khi viết đệ quy.',
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

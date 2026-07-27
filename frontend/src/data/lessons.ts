import type { Lesson } from '../features/lesson/types/lesson.types';

export const LESSONS: Record<string, Lesson> = {
  'quick-sort': {
    id: 'quick-sort',
    title: 'Quick Sort - Sắp xếp nhanh',
    algorithmId: 'quick-sort',
    xpReward: 100,
    theoryContent: `
# 🚀 Quick Sort – Sắp xếp nhanh

**Quick Sort** là thuật toán sắp xếp theo chiến lược **Chia để Trị** (Divide and Conquer).

## Ý tưởng chính
1. **Chọn Pivot**: Chọn một phần tử làm chốt (thường là phần tử cuối cùng).
2. **Phân hoạch (Partition)**: Sắp xếp lại mảng sao cho:
   - Các phần tử ≤ Pivot nằm bên trái.
   - Các phần tử > Pivot nằm bên phải.
3. **Đệ quy**: Áp dụng đệ quy cho mảng con bên trái và bên phải.

## Độ phức tạp
- **Thời gian**: O(n log n) trung bình, O(n²) trong trường hợp xấu nhất.
- **Bộ nhớ**: O(log n) do stack đệ quy.

## Mã giả
\`\`\`javascript
function quickSort(arr, low, high) {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      swap(arr, i, j);
    }
  }
  swap(arr, i + 1, high);
  return i + 1;
}
\`\`\`
    `,
    quizQuestions: [
      {
        id: 'q1',
        questionText: 'Trong thuật toán Quick Sort, Pivot thường được chọn là phần tử nào?',
        options: ['Phần tử đầu tiên', 'Phần tử cuối cùng', 'Phần tử giữa', 'Bất kỳ phần tử nào cũng được'],
        correctIndex: 3,
        explanation: 'Mặc dù cài đặt Lomuto thường chọn phần tử cuối cùng, nhưng về mặt lý thuyết, bất kỳ phần tử nào cũng có thể được chọn làm Pivot.'
      },
      {
        id: 'q2',
        questionText: 'Độ phức tạp thời gian trung bình của Quick Sort là bao nhiêu?',
        options: ['O(1)', 'O(N)', 'O(N log N)', 'O(N²)'],
        correctIndex: 2,
        explanation: 'Trung bình Quick Sort chạy trong thời gian O(N log N), tuy nhiên trường hợp xấu nhất có thể lên tới O(N²).'
      },
      {
        id: 'q3',
        questionText: 'Quick Sort là một thuật toán sắp xếp ổn định (Stable Sort). Đúng hay sai?',
        options: ['Đúng', 'Sai'],
        correctIndex: 1,
        explanation: 'Quick Sort không ổn định (Unstable) vì quá trình hoán đổi có thể làm thay đổi thứ tự tương đối của các phần tử có giá trị bằng nhau.'
      },
      {
        id: 'q4',
        questionText: 'Trong quá trình Phân hoạch (Partition), các phần tử nằm bên trái Pivot có đặc điểm gì?',
        options: ['Lớn hơn Pivot', 'Nhỏ hơn hoặc bằng Pivot', 'Đã được sắp xếp', 'Bằng Pivot'],
        correctIndex: 1,
        explanation: 'Tất cả các phần tử nhỏ hơn hoặc bằng Pivot sẽ được đẩy về phía bên trái của Pivot.'
      },
      {
        id: 'q5',
        questionText: 'Điều gì xảy ra nếu mảng đầu vào đã được sắp xếp sẵn và ta luôn chọn phần tử cuối làm Pivot?',
        options: ['Quick Sort sẽ chạy rất nhanh (O(N))', 'Quick Sort sẽ rơi vào trường hợp xấu nhất O(N²)', 'Quick Sort sẽ báo lỗi đệ quy vô hạn', 'Không có vấn đề gì, vẫn là O(N log N)'],
        correctIndex: 1,
        explanation: 'Nếu mảng đã sắp xếp và luôn chọn phần tử cuối làm Pivot, mỗi lần phân hoạch sẽ tạo ra một mảng có N-1 phần tử, dẫn đến độ phức tạp O(N²).'
      }
    ],
    codelabTask: {
      description: 'Hoàn thiện hàm quickSort dưới đây bằng JavaScript (sử dụng Lomuto partition scheme).',
      initialCode: `function quickSort(arr, low = 0, high = arr.length - 1) {
  // TODO: Viết code tại đây
  
  return arr;
}`,
      solution: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
      testCases: [
        { input: '[3, 6, 8, 10, 1, 2, 1]', expectedOutput: '[1, 1, 2, 3, 6, 8, 10]' },
        { input: '[5, 2, 9, 1, 5, 6]', expectedOutput: '[1, 2, 5, 5, 6, 9]' },
        { input: '[10, -2, 4, 0]', expectedOutput: '[-2, 0, 4, 10]' },
        { input: '[]', expectedOutput: '[]', isHidden: true }
      ]
    }
  }
};

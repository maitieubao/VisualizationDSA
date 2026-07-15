import type { QuizScript } from '../types/quiz.types';

/**
 * Bubble Sort Interactive Quiz Script
 * Contains checkpoint questions triggered at specific animation frames.
 */
export const bubbleSortQuiz: QuizScript = {
  algorithmId: 'bubble-sort',
  checkpoints: [
    {
      frameIndex: 1,
      question: {
        id: 'bs_q1',
        type: 'MULTIPLE_CHOICE',
        prompt: 'Phép hoán vị (Swap) có xảy ra ở bước so sánh đầu tiên này hay không?',
        options: [
          'Có — vì phần tử bên trái lớn hơn phần tử bên phải',
          'Không — vì hai phần tử đã đúng thứ tự',
          'Không thể xác định — cần thêm thông tin',
        ],
        correctOptionIndex: 0,
        explanation:
          '**Chính xác!** Ở bước đầu tiên, thuật toán so sánh `A[0]` và `A[1]`. ' +
          'Vì `A[0] = 5 > A[1] = 3`, phép hoán vị sẽ xảy ra để đưa phần tử nhỏ hơn lên trước. ' +
          'Đây chính là nguyên lý cốt lõi của Bubble Sort: **nổi bọt phần tử lớn lên cuối mảng**.',
      },
    },
    {
      frameIndex: 5,
      question: {
        id: 'bs_q2',
        type: 'TRUE_FALSE',
        prompt: 'Sau khi hoàn thành vòng lặp ngoài đầu tiên (i=0), phần tử lớn nhất sẽ nằm ở vị trí cuối cùng của mảng.',
        options: ['Đúng', 'Sai'],
        correctOptionIndex: 0,
        explanation:
          '**Đúng!** Sau mỗi vòng lặp ngoài, phần tử lớn nhất trong phần chưa sắp xếp sẽ "nổi bọt" ' +
          'lên vị trí cuối cùng. Sau vòng `i=0`, phần tử lớn nhất `9` đã ở đúng vị trí `A[4]`. ' +
          'Đây là tính chất **bất biến (loop invariant)** quan trọng của Bubble Sort.',
      },
    },
    {
      frameIndex: 10,
      question: {
        id: 'bs_q3',
        type: 'MULTIPLE_CHOICE',
        prompt: 'Tại sao vòng lặp trong của Bubble Sort chỉ chạy đến `n - i - 1` thay vì chạy hết mảng?',
        options: [
          'Vì các phần tử ở cuối mảng đã được sắp xếp đúng vị trí sau mỗi vòng ngoài',
          'Vì thuật toán chỉ cần so sánh nửa đầu mảng',
          'Vì giới hạn bộ nhớ không cho phép duyệt toàn bộ',
          'Vì cần tiết kiệm thời gian CPU',
        ],
        correctOptionIndex: 0,
        explanation:
          '**Chính xác!** Sau vòng lặp ngoài thứ `i`, `i+1` phần tử lớn nhất đã nằm đúng vị trí ở cuối mảng. ' +
          'Do đó vòng lặp trong chỉ cần duyệt `n - i - 1` phần tử còn lại. ' +
          'Đây là **tối ưu hóa cơ bản** giảm số phép so sánh không cần thiết.',
      },
    },
    {
      frameIndex: 16,
      question: {
        id: 'bs_q4',
        type: 'MULTIPLE_CHOICE',
        prompt: 'Độ phức tạp thời gian trường hợp xấu nhất (Worst Case) của Bubble Sort là gì?',
        options: [
          'O(n)',
          'O(n log n)',
          'O(n²)',
          'O(2ⁿ)',
        ],
        correctOptionIndex: 2,
        explanation:
          '**Chính xác!** Trường hợp xấu nhất xảy ra khi mảng sắp xếp ngược hoàn toàn. ' +
          'Lúc này Bubble Sort cần `n-1` vòng lặp ngoài, mỗi vòng duyệt tối đa `n-1` phần tử, ' +
          'tổng cộng khoảng `n(n-1)/2` phép so sánh, tức **O(n²)**. ' +
          'Đây là lý do Bubble Sort không phù hợp cho dữ liệu lớn.',
      },
    },
  ],
};

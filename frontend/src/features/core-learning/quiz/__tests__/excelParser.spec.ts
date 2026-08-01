import { describe, it, expect } from 'vitest';
import { parseExcelRows } from '../service/excelParser';

describe('Excel Quiz Parser Unit Tests', () => {
  it('should successfully parse valid quiz rows from Excel data structure', () => {
    const mockRows = [
      {
        'Tiêu đề Quiz': 'Mảng tĩnh và Mảng động',
        'Chủ đề': 'array',
        'Độ khó (easy/medium/hard)': 'easy',
        'XP Thưởng': '50',
        'Câu hỏi': 'Độ phức tạp thời gian truy xuất phần tử theo chỉ số là gì?',
        'Đáp án A': 'O(1)',
        'Đáp án B': 'O(N)',
        'Đáp án C': 'O(log N)',
        'Đáp án D': 'O(N log N)',
        'Đáp án đúng (A/B/C/D)': 'A',
        'Giải thích': 'Mảng cho phép tính toán trực tiếp địa chỉ và truy xuất chỉ trong O(1).'
      },
      {
        'Tiêu đề Quiz': 'Mảng tĩnh và Mảng động',
        'Chủ đề': 'array',
        'Độ khó (easy/medium/hard)': 'easy',
        'XP Thưởng': '50',
        'Câu hỏi': 'Mảng động tăng kích thước thế nào khi đầy?',
        'Đáp án A': 'Tăng thêm 1',
        'Đáp án B': 'Nhân đôi dung lượng',
        'Đáp án đúng (A/B/C/D)': 'B',
        'Giải thích': 'Mảng động thường nhân đôi dung lượng.'
      }
    ];

    const results = parseExcelRows(mockRows);

    expect(results).toHaveLength(1);
    const quiz = results[0];
    expect(quiz.title).toBe('Mảng tĩnh và Mảng động');
    expect(quiz.topic).toBe('array');
    expect(quiz.difficulty).toBe('easy');
    expect(quiz.xpReward).toBe(50);
    expect(quiz.validationErrors).toHaveLength(0);
    expect(quiz.questions).toHaveLength(2);

    // Kiểm tra câu hỏi 1
    const q1 = quiz.questions[0];
    expect(q1.text).toBe('Độ phức tạp thời gian truy xuất phần tử theo chỉ số là gì?');
    expect(q1.options).toEqual(['O(1)', 'O(N)', 'O(log N)', 'O(N log N)']);
    expect(q1.correctIndex).toBe(0); // A
    expect(q1.explanation).toContain('O(1)');

    // Kiểm tra câu hỏi 2 (lọc bỏ các đáp án rỗng C, D)
    const q2 = quiz.questions[1];
    expect(q2.text).toBe('Mảng động tăng kích thước thế nào khi đầy?');
    expect(q2.options).toEqual(['Tăng thêm 1', 'Nhân đôi dung lượng']);
    expect(q2.correctIndex).toBe(1); // B
  });

  it('should skip rows that have an empty Quiz Title', () => {
    const mockRows = [
      {
        'Tiêu đề Quiz': '',
        'Câu hỏi': 'Câu hỏi không có tiêu đề quiz?',
        'Đáp án A': 'Đáp án A',
        'Đáp án B': 'Đáp án B',
        'Đáp án đúng (A/B/C/D)': 'A'
      }
    ];

    const results = parseExcelRows(mockRows);
    expect(results).toHaveLength(0);
  });

  it('should collect validation errors for missing questions, missing options, or invalid correct option', () => {
    const mockRows = [
      {
        'Tiêu đề Quiz': 'Lỗi Validation Quiz',
        'Chủ đề': 'array',
        'Câu hỏi': '', // Thiếu câu hỏi
        'Đáp án A': 'O(1)',
        'Đáp án B': 'O(N)',
        'Đáp án đúng (A/B/C/D)': 'A'
      },
      {
        'Tiêu đề Quiz': 'Lỗi Validation Quiz',
        'Chủ đề': 'array',
        'Câu hỏi': 'Thiếu đáp án B?',
        'Đáp án A': 'Có đáp án A',
        'Đáp án B': '', // Thiếu đáp án B
        'Đáp án đúng (A/B/C/D)': 'A'
      },
      {
        'Tiêu đề Quiz': 'Lỗi Validation Quiz',
        'Chủ đề': 'array',
        'Câu hỏi': 'Đáp án đúng không hợp lệ?',
        'Đáp án A': 'Đáp án A',
        'Đáp án B': 'Đáp án B',
        'Đáp án đúng (A/B/C/D)': 'X' // Đáp án không hợp lệ
      }
    ];

    const results = parseExcelRows(mockRows);

    expect(results).toHaveLength(1);
    const quiz = results[0];
    expect(quiz.validationErrors).toHaveLength(4);
    expect(quiz.validationErrors[0]).toContain('Câu hỏi không được để trống');
    expect(quiz.validationErrors[1]).toContain('Thiếu đáp án bắt buộc A hoặc B');
    expect(quiz.validationErrors[2]).toContain('Phải có ít nhất 2 đáp án');
    expect(quiz.validationErrors[3]).toContain('Đáp án đúng phải là A, B, C hoặc D');
  });
});

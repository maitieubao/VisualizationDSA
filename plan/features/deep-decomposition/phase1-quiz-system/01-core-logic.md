# 🧠 Quiz Verification & Canvas Click Chấm điểm Engine (TypeScript)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của lớp hạt nhân chịu trách nhiệm chấm điểm các loại câu hỏi trắc nghiệm, nhận diện tọa độ click trúng đỉnh Canvas đáp án và cập nhật chuỗi thành tích học tập.

---

## 1. Bộ máy Kiểm tra đáp án & Chấm điểm va chạm Canvas (TypeScript Class)

Lớp `QuizVerificationEngine` đóng vai trò là động cơ chấm điểm Client-side tích hợp hình học:

```typescript
export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'CANVAS_TARGET';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  correctOptionIndex?: number;
  targetNodeId?: string; // ID của đỉnh đáp án đúng trên Canvas
  explanation: string;
}

export interface CanvasNodeDTO {
  id: string;
  x: number;
  y: number;
  radius: number;
  [key: string]: any;
}

export interface VerificationResult {
  isCorrect: boolean;
  explanation: string;
  matchedNodeId?: string; // ID đỉnh người học click trúng (cho CANVAS_TARGET)
}

export class QuizVerificationEngine {
  /**
   * 1. Chấm điểm câu hỏi dạng trắc nghiệm chọn phương án (MC/TF)
   */
  public static verifyOptionAnswer(
    selectedIndex: number,
    question: QuizQuestion
  ): VerificationResult {
    const isCorrect = selectedIndex === question.correctOptionIndex;
    return {
      isCorrect,
      explanation: question.explanation
    };
  }

  /**
   * 2. Giải thuật Chấm điểm tương tác hình học click đỉnh Canvas
   * Tính khoảng cách Euclide để xác định đỉnh bị click trúng và đối chiếu đáp án đúng
   */
  public static verifyCanvasClickAnswer(
    clickX: number,
    clickY: number,
    nodes: CanvasNodeDTO[],
    question: QuizQuestion
  ): VerificationResult {
    if (question.type !== 'CANVAS_TARGET') {
      return { isCorrect: false, explanation: 'Kiểu câu hỏi không tương thích Canvas.' };
    }

    let clickedNode: CanvasNodeDTO | null = null;

    // A. Quét tìm đỉnh bị click trúng bằng phép toán khoảng cách Euclide
    for (const node of nodes) {
      const dx = clickX - node.x;
      const dy = clickY - node.y;
      const distSquared = dx * dx + dy * dy;

      if (distSquared <= node.radius * node.radius) {
        clickedNode = node;
        break; // Trúng đỉnh đầu tiên, dừng quét
      }
    }

    // B. Trường hợp click ra ngoài khoảng trống không trúng đỉnh nào
    if (!clickedNode) {
      return {
        isCorrect: false,
        explanation: 'Bạn nhấp chưa trúng đỉnh nào trên Canvas. Hãy nhìn kỹ sơ đồ và thử lại!'
      };
    }

    // C. Đối chiếu ID đỉnh bị nhấp trúng với đáp án đúng cấu hình trong câu hỏi
    const isCorrect = clickedNode.id === question.targetNodeId;

    return {
      isCorrect,
      explanation: question.explanation,
      matchedNodeId: clickedNode.id
    };
  }
}
```

---

## 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)

Để bảo đảm bộ máy chấm điểm hoạt động chính xác tuyệt đối trước khi đóng gói bài giảng, chúng ta xây dựng bộ unit tests cơ bản:

```typescript
import { describe, it, expect } from 'vitest';
import { QuizVerificationEngine, QuizQuestion, CanvasNodeDTO } from './QuizVerificationEngine';

const mockMCQuestion: QuizQuestion = {
  id: 'q1',
  type: 'MULTIPLE_CHOICE',
  prompt: 'Đáp án nào đúng?',
  options: ['Sai A', 'Đúng B', 'Sai C'],
  correctOptionIndex: 1,
  explanation: 'Đúng B là chính xác lý thuyết.'
};

const mockCanvasQuestion: QuizQuestion = {
  id: 'q2',
  type: 'CANVAS_TARGET',
  prompt: 'Hãy click vào đỉnh đích C',
  targetNodeId: 'node_C',
  explanation: 'Đỉnh C là đỉnh kề ngắn nhất bước này.'
};

const mockNodes: CanvasNodeDTO[] = [
  { id: 'node_A', x: 100, y: 100, radius: 20 },
  { id: 'node_C', x: 200, y: 200, radius: 20 }
];

describe('QuizVerificationEngine Unit Tests', () => {
  it('Should verify correct Multiple Choice answer', () => {
    const result = QuizVerificationEngine.verifyOptionAnswer(1, mockMCQuestion);
    expect(result.isCorrect).toBe(true);
    expect(result.explanation).toContain('chính xác');
  });

  it('Should verify incorrect Multiple Choice answer', () => {
    const result = QuizVerificationEngine.verifyOptionAnswer(0, mockMCQuestion);
    expect(result.isCorrect).toBe(false);
  });

  it('Should verify correct Canvas click target answer', () => {
    // Tọa độ click (202, 198) nằm trong bán kính đỉnh C tâm (200, 200) R=20
    const result = QuizVerificationEngine.verifyCanvasClickAnswer(202, 198, mockNodes, mockCanvasQuestion);
    expect(result.isCorrect).toBe(true);
    expect(result.matchedNodeId).toBe('node_C');
  });

  it('Should reject out of bounds click on Canvas', () => {
    // Click tọa độ (500, 500) xa tít tắp không trúng đỉnh nào
    const result = QuizVerificationEngine.verifyCanvasClickAnswer(500, 500, mockNodes, mockCanvasQuestion);
    expect(result.isCorrect).toBe(false);
    expect(result.matchedNodeId).toBeUndefined();
    expect(result.explanation).toContain('chưa trúng');
  });
});
```
Mã nguồn kiểm thử tự động cam kết tuyệt đối chất lượng sư phạm của các giáo án điện tử DSA, không bao giờ xảy ra lỗi click đúng mà chấm sai gây bức xúc cho học viên.

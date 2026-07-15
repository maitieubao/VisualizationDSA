# ⚙️ Infrastructure & Automated Quiz Script Preloader (Phase 1)

Tài liệu này đặc tả chi tiết các giải pháp kỹ thuật hạ tầng giúp tự động tải trước kịch bản câu hỏi trắc nghiệm (Quiz Preloading) để giảm thiểu độ trễ mạng và công cụ kiểm thử cấu trúc kịch bản câu hỏi (Schema Verification Script).

---

## 1. Cơ chế Tải trước Câu hỏi (Quiz Asset Preloading)

Để đảm bảo các câu hỏi trắc nghiệm đè lên Canvas diễn ra tức thì tại các khung hình định trước mà không bị trễ hình ảnh hoặc xoay vòng tròn chờ đợi tải mạng (`loading spinner`), hệ thống thực hiện tải trước bộ câu hỏi ngay tại vòng đời tải trang đầu tiên.

```typescript
import { useQuizStore } from '@/stores/useQuizStore';

export class QuizPreloaderService {
  private static cachedQuizzes = new Map<string, any>();

  /**
   * Tải trước kịch bản câu hỏi trắc nghiệm từ Backend khi học sinh mở bài học
   */
  public static async preloadQuizForAlgorithm(algorithmId: string): Promise<boolean> {
    if (this.cachedQuizzes.has(algorithmId)) {
      return true; // Trả về bộ đệm (Memory cache) tức thời
    }

    try {
      const response = await fetch(`/api/v1/algorithms/${algorithmId}/quiz`);
      if (!response.ok) throw new Error('Không thể tải tệp trắc nghiệm từ API.');

      const quizData = await response.json();
      this.cachedQuizzes.set(algorithmId, quizData);
      return true;
    } catch (error) {
      console.error(`Lỗi tải trước trắc nghiệm cho thuật toán ${algorithmId}:`, error);
      return false;
    }
  }

  /**
   * Trích xuất câu hỏi từ bộ nhớ đệm
   */
  public static getQuizFromCache(algorithmId: string): any | null {
    return this.cachedQuizzes.get(algorithmId) || null;
  }
}
```

---

## 2. Công cụ Kiểm tra Tính toàn vẹn của Bộ đề (Schema Verification Script)

Để cam kết giáo viên không đăng tải nhầm cấu trúc tệp trắc nghiệm bị thiếu các trường quan trọng (Ví dụ: câu hỏi `CANVAS_TARGET` quên khai báo ID đỉnh đáp án đúng `targetNodeId`), chúng ta thiết lập kịch bản Node.js/TypeScript tự động kiểm chứng tệp trước khi đóng gói:

```typescript
export class QuizSchemaValidator {
  /**
   * Kiểm chứng cấu trúc tệp câu hỏi trắc nghiệm đầu vào
   */
  public static validateQuizJson(jsonData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!jsonData || !Array.isArray(jsonData.questions)) {
      return { isValid: false, errors: ['Tệp JSON trắc nghiệm bắt buộc phải chứa mảng "questions".'] };
    }

    jsonData.questions.forEach((q: any, idx: number) => {
      const qPrefix = `Câu hỏi số [${idx + 1}] (ID: ${q.id || 'Chưa rõ'}):`;

      if (!q.id) errors.push(`${qPrefix} Khuyết thiếu trường "id".`);
      if (!q.prompt) errors.push(`${qPrefix} Khuyết thiếu nội dung câu hỏi "prompt".`);
      if (!q.type) {
        errors.push(`${qPrefix} Khuyết thiếu kiểu câu hỏi "type".`);
      } else {
        // Kiểm thử nghiệp vụ theo dạng câu hỏi
        if (q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE') {
          if (!Array.isArray(q.options) || q.options.length < 2) {
            errors.push(`${qPrefix} Dạng trắc nghiệm lựa chọn bắt buộc phải có mảng "options" chứa từ 2 phương án trở lên.`);
          }
          if (typeof q.correctOptionIndex !== 'number' || q.correctOptionIndex < 0) {
            errors.push(`${qPrefix} Dạng trắc nghiệm lựa chọn phải có chỉ số đáp án đúng "correctOptionIndex" hợp lệ.`);
          }
        }

        if (q.type === 'CANVAS_TARGET') {
          if (!q.targetNodeId) {
            errors.push(`${qPrefix} Dạng câu hỏi nhấp Canvas bắt buộc phải khai báo trường ID đỉnh đáp án đúng "targetNodeId".`);
          }
        }
      }

      if (!q.explanation) {
        errors.push(`${qPrefix} Cảnh báo sư phạm: Khuyết thiếu nội dung giải thích chi tiết "explanation".`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```
 Tích hợp bộ kiểm thử biên tự động (Automated Schema Validator) vào khâu biên soạn giúp hệ thống giáo trình trắc nghiệm luôn hoạt động ổn định và chính xác tuyệt đối, tránh tuyệt đối các lỗi rò rỉ bộ nhớ hoặc đứng hình Canvas ở Client-side.

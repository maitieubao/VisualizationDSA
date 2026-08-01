/**
 * QuizSchemaValidator — Validates quiz JSON structure before loading.
 * Ensures all required fields are present for each question type.
 */
export class QuizSchemaValidator {
  static validateQuizJson(jsonData: unknown): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!jsonData || typeof jsonData !== 'object') {
      return { isValid: false, errors: ['Tệp JSON trắc nghiệm không hợp lệ.'] };
    }

    const data = jsonData as Record<string, unknown>;
    if (!Array.isArray(data.checkpoints)) {
      return { isValid: false, errors: ['Tệp JSON trắc nghiệm bắt buộc phải chứa mảng "checkpoints".'] };
    }

    (data.checkpoints as Array<Record<string, unknown>>).forEach((cp, idx) => {
      const prefix = `Checkpoint [${idx}]:`;

      if (typeof cp.frameIndex !== 'number' || cp.frameIndex < 0) {
        errors.push(`${prefix} Khuyết thiếu hoặc không hợp lệ "frameIndex".`);
      }

      const q = cp.question as Record<string, unknown> | undefined;
      if (!q || typeof q !== 'object') {
        errors.push(`${prefix} Khuyết thiếu đối tượng "question".`);
        return;
      }

      if (!q.id) errors.push(`${prefix} Khuyết thiếu "question.id".`);
      if (!q.prompt) errors.push(`${prefix} Khuyết thiếu "question.prompt".`);
      if (!q.explanation) errors.push(`${prefix} Khuyết thiếu "question.explanation".`);

      if (!q.type) {
        errors.push(`${prefix} Khuyết thiếu "question.type".`);
      } else {
        if (q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE') {
          if (!Array.isArray(q.options) || q.options.length < 2) {
            errors.push(`${prefix} Dạng trắc nghiệm cần mảng "options" có ít nhất 2 phương án.`);
          }
          if (typeof q.correctOptionIndex !== 'number' || q.correctOptionIndex < 0) {
            errors.push(`${prefix} Cần "correctOptionIndex" hợp lệ.`);
          }
        }

        if (q.type === 'CANVAS_TARGET') {
          if (!q.targetNodeId) {
            errors.push(`${prefix} Dạng CANVAS_TARGET cần khai báo "targetNodeId".`);
          }
        }
      }
    });

    return { isValid: errors.length === 0, errors };
  }
}

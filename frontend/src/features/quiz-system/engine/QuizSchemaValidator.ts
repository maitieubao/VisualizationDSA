/**
 * Bộ kiểm tra lược đồ (Schema) cho tệp JSON trắc nghiệm quiz.
 * - QZ-010: cận trên correctOptionIndex (< options.length) + Number.isInteger
 * - QZ-011: question.type không hợp lệ → lỗi tường minh
 * - QZ-012: checkpoint null/non-object → lỗi thay vì crash TypeError
 * - QZ-020: checkpoints rỗng → "Quiz không có câu hỏi nào"
 * - QZ-021: frameIndex phải là số nguyên
 * - QZ-022: trùng frameIndex / trùng question.id (Set)
 * - QZ-038: TRUE_FALSE đúng 2 phương án + phương án là chuỗi không rỗng + radius > 0 cho node CANVAS_TARGET
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

    // QZ-020: quiz không có câu hỏi nào là cấu hình chết — không checkpoint nào kích hoạt được
    if (data.checkpoints.length === 0) {
      errors.push('Quiz không có câu hỏi nào.');
    }

    // QZ-022: Set dò trùng — frameIndex trùng làm câu 2 không bao giờ kích hoạt; question.id trùng làm sai lệch tracking attempt/streak
    const seenFrameIndexes = new Set<number>();
    const seenQuestionIds = new Set<string>();

    (data.checkpoints as Array<unknown>).forEach((cp, idx) => {
      const prefix = `Checkpoint [${idx}]:`;

      // QZ-012: checkpoint null / non-object → báo lỗi tường minh, tuyệt đối không đụng cp.frameIndex
      if (!cp || typeof cp !== 'object' || Array.isArray(cp)) {
        errors.push(`${prefix} Checkpoint phải là một đối tượng hợp lệ.`);
        return;
      }

      const checkpoint = cp as Record<string, unknown>;

      // QZ-021: frameIndex phải là số nguyên — giá trị thực (5.5) không bao giờ khớp frame nguyên `===` của VCR → checkpoint chết âm thầm
      const frameIndex = checkpoint.frameIndex;
      if (typeof frameIndex !== 'number' || !Number.isInteger(frameIndex) || frameIndex < 0) {
        errors.push(`${prefix} Khuyết thiếu hoặc không hợp lệ "frameIndex" (cần số nguyên không âm).`);
      } else if (seenFrameIndexes.has(frameIndex)) {
        // QZ-022: trùng frameIndex → checkpoint sau bị che khuất vĩnh viễn, không bao giờ hiện
        errors.push(`${prefix} Trùng lặp "frameIndex" ${frameIndex} với checkpoint trước đó.`);
      } else {
        seenFrameIndexes.add(frameIndex);
      }

      const q = checkpoint.question as Record<string, unknown> | undefined;
      if (!q || typeof q !== 'object' || Array.isArray(q)) {
        errors.push(`${prefix} Khuyết thiếu đối tượng "question".`);
        return;
      }

      if (!q.id) {
        errors.push(`${prefix} Khuyết thiếu "question.id".`);
      } else if (seenQuestionIds.has(String(q.id))) {
        // QZ-022: trùng question.id → đáp án/explanation của câu sau ghi đè câu trước trong tracking
        errors.push(`${prefix} Trùng lặp "question.id" "${String(q.id)}" với checkpoint trước đó.`);
      } else {
        seenQuestionIds.add(String(q.id));
      }
      if (!q.prompt) errors.push(`${prefix} Khuyết thiếu "question.prompt".`);
      if (!q.explanation) errors.push(`${prefix} Khuyết thiếu "question.explanation".`);

      if (!q.type) {
        errors.push(`${prefix} Khuyết thiếu "question.type".`);
      } else if (q.type !== 'MULTIPLE_CHOICE' && q.type !== 'TRUE_FALSE' && q.type !== 'CANVAS_TARGET') {
        // QZ-011: type lạ (MATCHING, typo...) → lỗi tường minh, không bỏ qua im lặng
        errors.push(`${prefix} Kiểu câu hỏi không hỗ trợ: ${String(q.type)}.`);
      } else {
        if (q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE') {
          if (q.type === 'TRUE_FALSE') {
            // QZ-038: TRUE_FALSE chỉ đúng 2 phương án (Đúng/Sai) — 3+ phương án là cấu hình sai
            if (!Array.isArray(q.options) || q.options.length !== 2) {
              errors.push(`${prefix} Dạng TRUE_FALSE cần đúng 2 phương án.`);
            }
          } else if (!Array.isArray(q.options) || q.options.length < 2) {
            errors.push(`${prefix} Dạng trắc nghiệm cần mảng "options" có ít nhất 2 phương án.`);
          }

          // QZ-038 (liên quan QZ-039): phương án phải là chuỗi không rỗng
          if (Array.isArray(q.options)) {
            (q.options as unknown[]).forEach((opt, optIdx) => {
              if (typeof opt !== 'string' || opt.trim().length === 0) {
                errors.push(`${prefix} Phương án [${optIdx}] phải là chuỗi không rỗng.`);
              }
            });
          }

          // QZ-010: correctOptionIndex phải là số nguyên KHÔNG ÂM nằm trong dải phương án —
          // index ngoài dải khiến mọi lựa chọn đều chấm sai vĩnh viễn dù học viên chọn đúng
          if (
            typeof q.correctOptionIndex !== 'number' ||
            !Number.isInteger(q.correctOptionIndex) ||
            q.correctOptionIndex < 0
          ) {
            errors.push(`${prefix} Cần "correctOptionIndex" hợp lệ (số nguyên không âm).`);
          } else if (Array.isArray(q.options) && q.correctOptionIndex >= q.options.length) {
            errors.push(
              `${prefix} "correctOptionIndex" nằm ngoài dải phương án (chỉ có ${q.options.length} phương án).`
            );
          }
        }

        if (q.type === 'CANVAS_TARGET') {
          if (!q.targetNodeId) {
            errors.push(`${prefix} Dạng CANVAS_TARGET cần khai báo "targetNodeId".`);
          }
        }
      }
    });

    // QZ-038: nếu JSON kèm danh sách node Canvas (CanvasNodeDTO) thì radius phải dương —
    // radius <= 0 khiến đỉnh không bao giờ nhận được click trúng (vùng va chạm Euclide bằng 0)
    if (data.nodes !== undefined) {
      if (!Array.isArray(data.nodes)) {
        errors.push('Mảng "nodes" (CANVAS_TARGET) phải là một mảng hợp lệ.');
      } else {
        (data.nodes as unknown[]).forEach((node, nodeIdx) => {
          if (!node || typeof node !== 'object' || Array.isArray(node)) {
            errors.push(`Node CANVAS_TARGET [${nodeIdx}]: phải là một đối tượng hợp lệ.`);
            return;
          }
          const nodeRecord = node as Record<string, unknown>;
          if (typeof nodeRecord.radius !== 'number' || !(nodeRecord.radius > 0)) {
            errors.push(`Node CANVAS_TARGET [${nodeIdx}]: "radius" phải là số dương (> 0).`);
          }
        });
      }
    }

    return { isValid: errors.length === 0, errors };
  }
}

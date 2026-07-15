export interface QuestionDto {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizImportData {
  title: string;
  topic: string;
  difficulty: string;
  xpReward: number;
  questions: QuestionDto[];
  validationErrors: string[];
  imported?: boolean;
}

export interface ExcelRowInput {
  'Tiêu đề Quiz'?: string | number;
  'Tiêu đề trắc nghiệm'?: string | number;
  'Chủ đề'?: string | number;
  'Độ khó (easy/medium/hard)'?: string | number;
  'XP Thưởng'?: string | number;
  'Câu hỏi'?: string | number;
  'Đáp án A'?: string | number;
  'Đáp án B'?: string | number;
  'Đáp án C'?: string | number;
  'Đáp án D'?: string | number;
  'Đáp án đúng (A/B/C/D)'?: string | number;
  'Giải thích'?: string | number;
  [key: string]: string | number | undefined;
}

function cleanText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Phân tích các hàng thô từ file Excel/JSON thành danh sách Quiz có cấu trúc và được kiểm thử hợp lệ.
 * @param rows Mảng các hàng từ sheet Excel
 */
export function parseExcelRows(rows: ExcelRowInput[]): QuizImportData[] {
  const tempQuizzesMap = new Map<string, QuizImportData>();
  const validTopics = ['sorting', 'graph', 'oop', 'solid', 'di', 'array', 'linked-list', 'design-patterns'];

  rows.forEach((row, idx) => {
    const title = cleanText((row['Tiêu đề trắc nghiệm'] || row['Tiêu đề Quiz'] || '').toString());
    const topic = cleanText((row['Chủ đề'] || '').toString()).toLowerCase();
    const difficulty = cleanText((row['Độ khó (easy/medium/hard)'] || 'medium').toString()).toLowerCase();
    const xpRewardVal = row['XP Thưởng'];
    const xpReward = typeof xpRewardVal === 'number' ? xpRewardVal : parseInt((xpRewardVal ?? '50').toString().trim(), 10);
    const questionText = cleanText((row['Câu hỏi'] || '').toString());
    
    const optA = cleanText((row['Đáp án A'] || '').toString());
    const optB = cleanText((row['Đáp án B'] || '').toString());
    const optC = cleanText((row['Đáp án C'] || '').toString());
    const optD = cleanText((row['Đáp án D'] || '').toString());
    const correctOpt = cleanText((row['Đáp án đúng (A/B/C/D)'] || '').toString()).toUpperCase();
    const explanation = cleanText((row['Giải thích'] || '').toString());

    if (!title) return; // Bỏ qua dòng trống tiêu đề

    const errors: string[] = [];

    // Validate Title
    if (title.length < 3) {
      errors.push(`Hàng ${idx + 2}: Tiêu đề Quiz "${title}" quá ngắn (tối thiểu 3 ký tự).`);
    }
    if (title.length > 150) {
      errors.push(`Hàng ${idx + 2}: Tiêu đề Quiz không được vượt quá 150 ký tự.`);
    }

    // Validate Topic
    if (!topic) {
      errors.push(`Hàng ${idx + 2}: Thiếu chủ đề.`);
    } else if (!validTopics.includes(topic)) {
      errors.push(`Hàng ${idx + 2}: Chủ đề "${topic}" không hợp lệ. Phải là một trong: ${validTopics.join(', ')}.`);
    }

    // Validate Difficulty
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      errors.push(`Hàng ${idx + 2}: Độ khó "${difficulty}" không hợp lệ. Phải là easy, medium hoặc hard.`);
    }

    // Validate XP Reward
    if (isNaN(xpReward) || xpReward < 10 || xpReward > 500) {
      errors.push(`Hàng ${idx + 2}: XP Thưởng "${xpReward}" không hợp lệ. Phải là số từ 10 đến 500.`);
    }

    // Validate Question Text
    if (!questionText) {
      errors.push(`Hàng ${idx + 2}: Câu hỏi không được để trống.`);
    } else if (questionText.length < 5) {
      errors.push(`Hàng ${idx + 2}: Nội dung câu hỏi quá ngắn (tối thiểu 5 ký tự).`);
    }

    // Validate Options
    const providedOptions = [optA, optB, optC, optD].filter(o => o !== '');
    if (!optA || !optB) {
      errors.push(`Hàng ${idx + 2}: Thiếu đáp án bắt buộc A hoặc B.`);
    }
    if (providedOptions.length < 2) {
      errors.push(`Hàng ${idx + 2}: Phải có ít nhất 2 đáp án.`);
    }

    // Kiểm tra trùng lặp đáp án
    const uniqueOptions = new Set(providedOptions);
    if (uniqueOptions.size !== providedOptions.length) {
      errors.push(`Hàng ${idx + 2}: Các đáp án không được trùng lặp nội dung.`);
    }

    // Validate correctIndex
    let correctIdx = -1;
    if (correctOpt === 'A') correctIdx = 0;
    else if (correctOpt === 'B') correctIdx = 1;
    else if (correctOpt === 'C') correctIdx = 2;
    else if (correctOpt === 'D') correctIdx = 3;

    if (correctIdx === -1) {
      errors.push(`Hàng ${idx + 2}: Đáp án đúng phải là A, B, C hoặc D (nhận được: "${correctOpt}").`);
    } else {
      const selectedOption = [optA, optB, optC, optD][correctIdx];
      if (!selectedOption) {
        errors.push(`Hàng ${idx + 2}: Đáp án đúng "${correctOpt}" trỏ vào một đáp án rỗng.`);
      }
    }

    // Lấy hoặc khởi tạo Quiz
    if (!tempQuizzesMap.has(title)) {
      tempQuizzesMap.set(title, {
        title,
        topic: topic || 'general',
        difficulty: ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium',
        xpReward: isNaN(xpReward) ? 50 : xpReward,
        questions: [],
        validationErrors: []
      });
    }

    const quiz = tempQuizzesMap.get(title)!;
    quiz.validationErrors.push(...errors);

    // Thêm câu hỏi vào quiz
    quiz.questions.push({
      id: `imported-q-${quiz.questions.length + 1}`,
      text: questionText,
      options: providedOptions,
      correctIndex: correctIdx,
      explanation
    });
  });

  return Array.from(tempQuizzesMap.values());
}

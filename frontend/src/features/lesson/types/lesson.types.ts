export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface CodeLabTask {
  description: string;
  initialCode: string;
  solution: string;
  testCases: TestCase[];
  /** Tên hàm entry point được gọi với các tham số parse từ `TestCase.input` (mặc định: solution). */
  entryFunction?: string;
  /** Gợi ý phân tầng (tiered hints). */
  hints?: string[];
  /** Độ khó hiển thị trên badge (LM-043) — mặc định "Cơ bản". */
  difficulty?: string;
  /** Giới hạn thời gian chạy (ms) hiển thị trên giao diện (LM-043). */
  timeLimitMs?: number;
}

/** Trạng thái xuất bản bài học (A1.4) — khớp SaveDraftLessonDto.publishStatus. */
export type PublishStatus = 'Draft' | 'Private' | 'Published';

export interface Lesson {
  id: string;
  title: string;
  algorithmId: string;
  xpReward: number;
  theoryContent: string;
  quizQuestions?: QuizQuestion[];
  codelabTask?: CodeLabTask;
  /** Id codelab do teacher gắn (A1.3) — null khi bài chưa gắn codelab nào. */
  codelabId?: string | null;
  /** Trạng thái xuất bản bài học (A1.4). */
  publishStatus?: PublishStatus;
}

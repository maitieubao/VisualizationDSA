import { ref, reactive } from 'vue';
import { useTeacherApi } from './useTeacherApi';

// TC-001: QuizBuilderTab dùng chung useTeacherApi + endpoint /api/v1/concepts/quiz/manage
// (endpoint /api/v1/quizzes cũ không tồn tại CRUD trên backend).
// TC-043: thay toàn bộ `any` bằng interface.

export interface QuizListItem {
  id: string;
  title: string;
  topic?: string;
  difficulty?: string | number;
  xpReward?: number;
  questionCount?: number;
}

export interface QuizQuestion {
  id?: string;
  text?: string;
  question?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizDetail {
  id?: string;
  title: string;
  topic: string;
  difficulty: string | number;
  xpReward: number;
  questions: QuizQuestion[];
}

export interface QuizSavePayload {
  id?: string;
  title: string;
  topic?: string;
  difficulty?: string | number;
  xpReward?: number;
  questions?: Array<{
    id?: string;
    text: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
}

// TC-031: đồng bộ thang độ khó easy/medium/hard — bank quiz trả Difficulty dạng int
// (1-5) trong khi quiz DB trả nhãn; chuẩn hóa về nhãn trước khi đưa vào UI.
export function normalizeDifficulty(diff: string | number | undefined): string {
  if (typeof diff === 'number') {
    if (diff <= 2) return 'easy';
    if (diff >= 4) return 'hard';
    return 'medium';
  }
  return diff || 'medium';
}

export function useQuizBuilder() {
  const { BASE_URL, teacherRequest } = useTeacherApi();

  const quizzesList = ref<QuizListItem[]>([]);
  const loading = ref(false);
  const quizQuestions = reactive<Record<string, QuizQuestion[]>>({});
  // reactive (không phải ref) — truy cập builder.loadingQuizQuestions[id] trực tiếp.
  const loadingQuizQuestions = reactive<Record<string, boolean>>({});
  const expandedQuizId = ref<string | null>(null);
  const topics = ref<string[]>([]);
  // TC-007: AbortController hủy request cũ khi search/filter thay đổi — tránh race ghi đè danh sách.
  let activeRequest: AbortController | null = null;

  async function loadQuizzes(): Promise<void> {
    activeRequest?.abort();
    const controller = new AbortController();
    activeRequest = controller;
    loading.value = true;
    try {
      // TC-001: endpoint chuẩn của StatelessQuizController (GET /concepts/quiz/all)
      const res = await teacherRequest(`${BASE_URL}/api/v1/concepts/quiz/all`, { signal: controller.signal });
      if (res.ok) {
        const data = await res.json();
        const list: QuizListItem[] = Array.isArray(data) ? data : (data.quizzes || []);
        quizzesList.value = list.map((q) => ({
          ...q,
          difficulty: normalizeDifficulty(q.difficulty)
        }));
        const ts: string[] = [...new Set(quizzesList.value.map((q) => q.topic).filter((t): t is string => Boolean(t)))];
        topics.value = ts.sort();
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      console.error('Failed to load quizzes:', err);
    } finally {
      loading.value = false;
    }
  }

  async function loadQuizQuestions(quizId: string): Promise<void> {
    loadingQuizQuestions[quizId] = true;
    try {
      // TC-001: không có endpoint /quizzes/{id}/questions — đọc detail (withAnswers=true)
      // để giáo viên xem/sửa đáp án (khớp TeacherQuizTab fetchQuizDetail).
      const res = await teacherRequest(`${BASE_URL}/api/v1/concepts/quiz/${quizId}?withAnswers=true`);
      if (res.ok) {
        const data = await res.json();
        quizQuestions[quizId] = data.questions || data;
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      loadingQuizQuestions[quizId] = false;
    }
  }

  async function createQuiz(data: QuizSavePayload): Promise<void> {
    const res = await teacherRequest(`${BASE_URL}/api/v1/concepts/quiz/manage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Thêm quiz thất bại.');
    }
    await loadQuizzes();
  }

  async function updateQuiz(id: string, data: QuizSavePayload): Promise<void> {
    const res = await teacherRequest(`${BASE_URL}/api/v1/concepts/quiz/manage/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, id: undefined })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Cập nhật quiz thất bại.');
    }
    await loadQuizzes();
  }

  async function deleteQuiz(quizId: string): Promise<void> {
    const res = await teacherRequest(`${BASE_URL}/api/v1/concepts/quiz/manage/${quizId}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Xóa quiz thất bại.');
    }
    quizzesList.value = quizzesList.value.filter((q) => q.id !== quizId);
  }

  // TC-008: thêm câu hỏi — POST manage/{quizId}/questions (contract questions endpoints).
  async function addQuestionToQuiz(quizId: string, data: QuizQuestion): Promise<void> {
    const res = await teacherRequest(`${BASE_URL}/api/v1/concepts/quiz/manage/${quizId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Thêm câu hỏi thất bại.');
    }
    await loadQuizQuestions(quizId);
  }

  // TC-008: sửa câu hỏi — PUT manage/{quizId}/questions/{questionId}.
  async function updateQuestion(quizId: string, questionId: string, data: QuizQuestion): Promise<void> {
    const res = await teacherRequest(`${BASE_URL}/api/v1/concepts/quiz/manage/${quizId}/questions/${questionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Cập nhật câu hỏi thất bại.');
    }
    await loadQuizQuestions(quizId);
  }

  async function deleteQuestion(quizId: string, questionId: string): Promise<void> {
    const res = await teacherRequest(`${BASE_URL}/api/v1/concepts/quiz/manage/${quizId}/questions/${questionId}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Xóa câu hỏi thất bại.');
    }
    await loadQuizQuestions(quizId);
  }

  return {
    quizzesList,
    loading,
    quizQuestions,
    loadingQuizQuestions,
    expandedQuizId,
    topics,
    loadQuizzes,
    loadQuizQuestions,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    addQuestionToQuiz,
    updateQuestion,
    deleteQuestion
  };
}

import { ref, reactive } from 'vue';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export function useQuizBuilder() {
  const quizzesList = ref<any[]>([]);
  const loading = ref(false);
  const quizQuestions = reactive<Record<string, any[]>>({});
  const loadingQuizQuestions = ref<Record<string, boolean>>({});
  const expandedQuizId = ref<string | null>(null);
  const topics = ref<string[]>([]);

  async function loadQuizzes() {
    loading.value = true;
    try {
      const res = await fetch(`${BASE_URL}/api/v1/quizzes`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        quizzesList.value = data.quizzes || data;
        const ts: string[] = [...new Set(quizzesList.value.map((q: any) => q.topic).filter(Boolean))];
        topics.value = ts.sort();
      }
    } catch (err) {
      console.error('Failed to load quizzes:', err);
    } finally {
      loading.value = false;
    }
  }

  async function loadQuizQuestions(quizId: string) {
    loadingQuizQuestions.value[quizId] = true;
    try {
      const res = await fetch(`${BASE_URL}/api/v1/quizzes/${quizId}/questions`, { headers: getAuthHeaders() });
      if (res.ok) {
        quizQuestions[quizId] = await res.json();
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      loadingQuizQuestions.value[quizId] = false;
    }
  }

  async function createQuiz(data: any) {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/quizzes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) {
        await loadQuizzes();
      }
    } catch (err) {
      console.error('Failed to create quiz:', err);
    }
  }

  async function updateQuiz(id: string, data: any) {
    try {
      await fetch(`${BASE_URL}/api/v1/quizzes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.error('Failed to update quiz:', err);
    }
  }

  async function deleteQuiz(quizId: string) {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        quizzesList.value = quizzesList.value.filter((q: any) => q.id !== quizId);
      }
    } catch (err) {
      console.error('Failed to delete quiz:', err);
    }
  }

  async function addQuestionToQuiz(quizId: string, data: any) {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/quizzes/${quizId}/questions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) {
        await loadQuizQuestions(quizId);
      }
    } catch (err) {
      console.error('Failed to add question:', err);
    }
  }

  async function deleteQuestion(quizId: string, questionId: string) {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/quizzes/${quizId}/questions/${questionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        await loadQuizQuestions(quizId);
      }
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
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
    deleteQuestion
  };
}

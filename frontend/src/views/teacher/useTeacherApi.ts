import { useAuthStore } from '../../features/auth/store/useAuthStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

// TC-013: timeout tối đa cho mọi request teacher — request treo không kẹt spinner vĩnh viễn.
const TEACHER_REQUEST_TIMEOUT_MS = 15000;

export function useTeacherApi() {
  const authStore = useAuthStore();

  function getAuthHeaders(): Record<string, string> {
    const token = authStore.getAccessToken() || '';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // TC-013: fetch teacher chuẩn cho mọi tab — timeout 15s (AbortController) + 401 →
  // authStore.refreshAccessToken() → retry 1 lần với token mới (pattern adminRequest AD-019).
  async function teacherRequest(url: string, init: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TEACHER_REQUEST_TIMEOUT_MS);
    try {
      const baseHeaders = getAuthHeaders();
      const extraHeaders = (init.headers ?? {}) as Record<string, string>;

      const doFetch = async (bearerToken?: string): Promise<Response> => {
        const headers: Record<string, string> = { ...baseHeaders, ...extraHeaders };
        if (bearerToken) headers['Authorization'] = `Bearer ${bearerToken}`;
        // TC-010: body FormData → bỏ Content-Type để browser tự set multipart boundary
        // (gửi 'application/json' làm mất boundary → backend 400 NO_FILE).
        if (typeof FormData !== 'undefined' && init.body instanceof FormData) {
          delete headers['Content-Type'];
        }
        return fetch(url, { ...init, headers, signal: controller.signal });
      };

      let res = await doFetch();
      if (res.status === 401) {
        const newToken = await authStore.refreshAccessToken();
        if (newToken) res = await doFetch(newToken);
      }
      return res;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  function formatTopic(topic: string): string {
    const map: Record<string, string> = {
      // Quiz topics (chữ thường)
      'sorting': 'Sắp xếp',
      'graph': 'Đồ thị',
      'oop': 'Hướng đối tượng',
      'solid': 'Nguyên lý SOLID',
      'di': 'DI/IoC',
      'array': 'Mảng',
      'linked-list': 'Danh sách liên kết',
      'design-patterns': 'Mẫu thiết kế',
      // Course categories (PascalCase) — TC-036
      'DataStructure': 'Cấu trúc dữ liệu',
      'Algorithm': 'Thuật toán',
      'Sorting': 'Sắp xếp',
      'Graph': 'Đồ thị',
      'OOP': 'Hướng đối tượng',
      'SOLID': 'Nguyên lý SOLID',
      'Patterns': 'Mẫu thiết kế',
      'SystemDesign': 'Thiết kế hệ thống',
      'Other': 'Khác'
    };
    return map[topic] || topic;
  }

  function formatDifficulty(diff: string): string {
    const map: Record<string, string> = {
      'easy': 'Dễ',
      'medium': 'Trung bình',
      'hard': 'Khó',
      // Course difficulties (Beginner/Intermediate/Advanced) — khớp option CourseTab
      'beginner': 'Dễ',
      'intermediate': 'Trung bình',
      'advanced': 'Khó'
    };
    return map[diff.toLowerCase()] || diff;
  }

  function formatDate(dateString: string): string {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  }

  function formatAttemptDate(dateString: string): string {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('vi-VN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  return {
    BASE_URL,
    getAuthHeaders,
    teacherRequest,
    formatTopic,
    formatDifficulty,
    formatDate,
    formatAttemptDate
  };
}

import { ref } from 'vue';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

// AD-019: timeout tối đa cho mọi request admin — request treo không kẹt spinner vĩnh viễn.
const ADMIN_REQUEST_TIMEOUT_MS = 15000;

interface AuditLog {
  time: string;
  type: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}


const auditLogs = ref<AuditLog[]>([
  { time: '15:20:04', type: 'INFO', message: 'Hệ thống Admin khởi động hoàn tất.' },
  { time: '15:20:08', type: 'INFO', message: 'Đã kết nối cơ sở dữ liệu PostgreSQL.' },
  { time: '15:22:15', type: 'INFO', message: 'Lấy danh sách người dùng thành công.' }
]);

export function useAdminApi() {
  const authStore = useAuthStore();

  function getAuthHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authStore.getAccessToken()}`
    };
  }

  // AD-019: fetch admin chuẩn cho mọi tab — timeout 15s (AbortController) + 401 →
  // authStore.refreshAccessToken() → retry 1 lần với token mới. Trước đây request treo
  // vô hạn và 401 im lặng khiến spinner kẹt.
  async function adminRequest(url: string, init: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ADMIN_REQUEST_TIMEOUT_MS);
    try {
      const baseHeaders = getAuthHeaders();
      const extraHeaders = (init.headers ?? {}) as Record<string, string>;

      const doFetch = async (bearerToken?: string): Promise<Response> => {
        const headers: Record<string, string> = { ...baseHeaders, ...extraHeaders };
        if (bearerToken) headers['Authorization'] = `Bearer ${bearerToken}`;
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

  function pushLog(type: 'INFO' | 'WARN' | 'ERROR', message: string): void {
    const d = new Date();
    const time = d.toTimeString().split(' ')[0];
    auditLogs.value.unshift({ time, type, message });
    if (auditLogs.value.length > 15) auditLogs.value.pop();
  }

  function getDifficultyLabel(diff: string): string {
    if (diff === 'easy') return 'Dễ';
    if (diff === 'hard') return 'Khó';
    return 'Trung bình';
  }

  return {
    BASE_URL,
    authStore,
    auditLogs,
    getAuthHeaders,
    pushLog,
    getDifficultyLabel,
    adminRequest
  };
}

import { ref } from 'vue';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

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
    getDifficultyLabel
  };
}

import { getActivePinia } from 'pinia';
import { useAuthStore } from '../features/auth/store/useAuthStore';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055') + '/api/v1';

// CU-011: timeout 15s cho mọi request — AbortSignal.timeout tự hủy fetch khi quá hạn.
const REQUEST_TIMEOUT_MS = 15000;

export function getStoredToken(): string | null {
  if (getActivePinia()) {
    const authStore = useAuthStore();
    return authStore.getAccessToken();
  }
  return null;
}

export interface ApiError {
  status: number;
  title: string;
  detail: string;
  errors?: Record<string, string[]>;
}

// CU-011: chỉ parse JSON khi response thực sự trả content-type application/json —
// tránh SyntaxError thô khi backend trả text/html (trang lỗi proxy...).
// Response KHÔNG có header content-type (một số proxy/mock test lược bỏ) → mặc định
// coi là JSON để parse (hành vi cũ); content-type rõ ràng không phải JSON mới bị chặn.
function isJsonResponse(response: Response): boolean {
  const contentType = response.headers?.get('content-type') ?? '';
  if (contentType === '') return true;
  return contentType.includes('application/json');
}

async function parseErrorBody(response: Response): Promise<ApiError> {
  if (isJsonResponse(response)) {
    try {
      return await response.json() as ApiError;
    } catch {
      // Body JSON hư hỏng — rơi xuống shape mặc định bên dưới.
    }
  }
  return {
    status: response.status,
    title: response.statusText,
    detail: `HTTP ${response.status}`,
  };
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  // Authorization KHÔNG gắn ở lớp này (AU-044): global fetch wrapper trong main.ts là
  // nơi duy nhất gắn Bearer cho request /api/v1 — tránh header trùng 2 lớp.
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // CU-011: kết hợp signal caller (nếu có) với timeout 15s — hủy khi một trong hai kích hoạt.
  let signal: AbortSignal;
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  if (options.signal) {
    const controller = new AbortController();
    const onAbort = (): void => controller.abort();
    if (options.signal!.aborted || timeoutSignal.aborted) {
      controller.abort();
    } else {
      options.signal!.addEventListener('abort', onAbort, { once: true });
      timeoutSignal.addEventListener('abort', onAbort, { once: true });
    }
    signal = controller.signal;
  } else {
    signal = timeoutSignal;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    signal,
  });

  if (!response.ok) {
    throw await parseErrorBody(response);
  }

  if (response.status === 204) return undefined as T;

  // CU-011: guard content-type trước parse JSON — response không phải JSON
  // (200 text/html...) trả undefined thay vì ném SyntaxError.
  if (!isJsonResponse(response)) return undefined as T;

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),
};

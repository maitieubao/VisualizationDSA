import { useAuthStore } from '../../auth/store/useAuthStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

// NT-022: fetch luôn có AbortSignal.timeout — backend treo không kẹt spinner vĩnh viễn.
const REQUEST_TIMEOUT_MS = 10000;

export interface NotificationDto {
  id: string;
  content: string;
  isRead: boolean;
  linkUrl: string;
  createdAt: string;
}

/** Refresh token 1 lần (NT-008, pattern QZ-025/AD-019) — thất bại trả null, lỗi gốc giữ cho caller. */
async function refreshAccessTokenOnce(): Promise<string | null> {
  try {
    return await useAuthStore().refreshAccessToken();
  } catch {
    return null;
  }
}

/** Parse JSON chỉ khi phản hồi đúng content-type JSON (NT-022) — tránh parse HTML/empty vô nghĩa.
 *  Thiếu header content-type (response test/204) thì để json() tự quyết định, không chặn oan. */
async function parseJson<T>(response: Response): Promise<T> {
  const contentType = response.headers?.get?.('content-type') ?? '';
  if (contentType && !contentType.includes('application/json')) {
    throw new Error(`HTTP ${response.status}: phản hồi không phải JSON`);
  }
  return response.json() as Promise<T>;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await parseJson<{ message?: string }>(response).catch(() => null);
    // NT-008: giữ status HTTP trong Error — authStore.isAuthFailureError (AU-008) cần
    // `status` để phân loại 401 thật (refresh/logout) khác lỗi mạng thoáng qua.
    const error = new Error(body?.message ?? `HTTP ${response.status}: ${response.statusText}`) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return parseJson<T>(response);
}

/** Fetch có timeout (NT-022) + 401 → refreshAccessToken → retry 1 lần với Bearer mới (NT-008);
 *  refresh thất bại → giữ lỗi gốc (status 401) — auth store tự toast + redirect (AU-007).
 *  Store cũng có retry dự phòng (defense-in-depth) nhưng api xử lý trước. */
async function request<T>(url: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch (err) {
    if (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
      throw new Error('timeout');
    }
    throw err;
  }

  if (response.status === 401) {
    const newToken = await refreshAccessTokenOnce();
    if (newToken) {
      const headers: Record<string, string> = { ...(init.headers as Record<string, string> | undefined) };
      headers['Authorization'] = `Bearer ${newToken}`;
      try {
        response = await fetch(url, { ...init, headers, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
      } catch (err) {
        if (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
          throw new Error('timeout');
        }
        throw err;
      }
    }
  }
  return handleResponse<T>(response);
}

function getAuthHeaders(accessToken: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

// NT-001: route thật của backend là /api/v1/notifications (không có đoạn /concepts).
export async function getNotifications(accessToken: string): Promise<NotificationDto[]> {
  return request<NotificationDto[]>(`${API_BASE}/api/v1/notifications`, {
    method: 'GET',
    headers: getAuthHeaders(accessToken),
  });
}

export async function markAsRead(id: string, accessToken: string): Promise<void> {
  await request<void>(`${API_BASE}/api/v1/notifications/${id}/read`, {
    method: 'PUT',
    headers: getAuthHeaders(accessToken),
  });
}

export async function markAllAsRead(accessToken: string): Promise<void> {
  await request<void>(`${API_BASE}/api/v1/notifications/read-all`, {
    method: 'PUT',
    headers: getAuthHeaders(accessToken),
  });
}

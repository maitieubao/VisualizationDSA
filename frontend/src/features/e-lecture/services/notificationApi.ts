/**
 * notificationApi.ts — HTTP client kết nối API thông báo.
 * Tương ứng backend: api/v1/concepts/notifications
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

export interface NotificationDto {
  id: string;
  content: string;
  isRead: boolean;
  linkUrl: string;
  createdAt: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

function getAuthHeaders(accessToken: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

/** Lấy tất cả thông báo của người dùng hiện tại */
export async function getNotifications(accessToken: string): Promise<NotificationDto[]> {
  const res = await fetch(`${API_BASE}/api/v1/concepts/notifications`, {
    method: 'GET',
    headers: getAuthHeaders(accessToken),
  });
  return handleResponse<NotificationDto[]>(res);
}

/** Đánh dấu một thông báo là đã đọc */
export async function markAsRead(id: string, accessToken: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/concepts/notifications/${id}/read`, {
    method: 'PUT',
    headers: getAuthHeaders(accessToken),
  });
  await handleResponse(res);
}

/** Đánh dấu tất cả thông báo là đã đọc */
export async function markAllAsRead(accessToken: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/concepts/notifications/read-all`, {
    method: 'PUT',
    headers: getAuthHeaders(accessToken),
  });
  await handleResponse(res);
}

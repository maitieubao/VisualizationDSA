import { describe, it, expect, vi, afterEach } from 'vitest';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationApi';
import type { NotificationDto } from '../services/notificationApi';

const API_BASE = 'http://localhost:5055';

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

describe('notificationApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getNotifications gọi GET đúng URL và trả về danh sách', async () => {
    const list: NotificationDto[] = [
      { id: 'n1', content: 'Xin chào', isRead: false, linkUrl: '/welcome', createdAt: '2026-08-01T10:00:00Z' },
    ];
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse(list));

    const result = await getNotifications('token-abc');

    expect(result).toEqual(list);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/api/v1/concepts/notifications`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer token-abc',
        'Content-Type': 'application/json',
      },
    });
  });

  it('getNotifications ném lỗi khi response không ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse({ message: 'Unauthorized' }, false, 401));

    await expect(getNotifications('bad-token')).rejects.toThrow('Unauthorized');
  });

  it('markAsRead gọi PUT đúng URL với id', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse(null));

    await markAsRead('n1', 'token-abc');

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/api/v1/concepts/notifications/n1/read`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer token-abc',
        'Content-Type': 'application/json',
      },
    });
  });

  it('markAsRead ném lỗi khi response không ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse({ message: 'Not found' }, false, 404));

    await expect(markAsRead('n1', 'token-abc')).rejects.toThrow('Not found');
  });

  it('markAllAsRead gọi PUT đúng URL read-all', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse(null));

    await markAllAsRead('token-abc');

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/api/v1/concepts/notifications/read-all`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer token-abc',
        'Content-Type': 'application/json',
      },
    });
  });

  it('markAllAsRead ném lỗi khi response không ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse({ message: 'Server error' }, false, 500));

    await expect(markAllAsRead('token-abc')).rejects.toThrow('Server error');
  });
});

// CONTRACT SPEC — NotificationsController (NT-001 P0, NT-008 P2, NT-022 P3, NT-027 P3).
// Contract (fix Round 21, đã có trong source):
//  - URL gốc: /api/v1/notifications (KHÔNG có /concepts/) cho cả 3 endpoint.
//  - Mọi request kèm Authorization: Bearer <accessToken> + AbortSignal.timeout(10s) (NT-022).
//  - Lỗi HTTP giữ status (401 → store phân loại refresh+retry NT-008); 401 KHÔNG retry ở tầng api.
//  - Lỗi mạng (fetch reject) → ném lên, không nuốt.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationApi';
import type { NotificationDto } from '../services/notificationApi';

// NT-027: base URL lấy từ env như source — CI đổi VITE_API_BASE_URL không fail oan.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';
const API_PREFIX = `${API_BASE}/api/v1/notifications`;

function jsonResponse(body: unknown, ok = true, status = 200, headers?: HeadersInit): Response {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    headers: headers ? new Headers(headers) : undefined,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

function fetchUrl(fetchMock: ReturnType<typeof vi.fn>, index = 0): string {
  return String(fetchMock.mock.calls[index]?.[0] ?? '');
}

function fetchInit(fetchMock: ReturnType<typeof vi.fn>, index = 0): RequestInit {
  return (fetchMock.mock.calls[index]?.[1] as RequestInit) ?? {};
}

describe('notificationApi — contract NotificationsController (NT-001, NT-008, NT-022, NT-027)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('NT-001: getNotifications gọi GET /api/v1/notifications + Bearer', async () => {
    const list: NotificationDto[] = [
      { id: 'n1', content: 'Xin chào', isRead: false, linkUrl: '/welcome', createdAt: '2026-08-01T10:00:00Z' },
    ];
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse(list));

    const result = await getNotifications('token-abc');

    expect(result).toEqual(list);
    expect(fetchUrl(fetchMock)).toBe(API_PREFIX);
    // NT-001: tuyệt đối không trỏ về /api/v1/concepts/notifications (backend route → 404).
    expect(fetchUrl(fetchMock)).not.toContain('/concepts/notifications');
    expect(fetchInit(fetchMock)).toEqual(expect.objectContaining({
      method: 'GET',
      headers: {
        Authorization: 'Bearer token-abc',
        'Content-Type': 'application/json',
      },
    }));
    // NT-022: fetch có signal timeout (không treo vĩnh viễn khi backend đứng im).
    expect(fetchInit(fetchMock).signal).toBeDefined();
  });

  it('NT-001: markAsRead gọi PUT /api/v1/notifications/{id}/read + Bearer', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse(null));

    await markAsRead('n1', 'token-abc');

    expect(fetchUrl(fetchMock)).toBe(`${API_PREFIX}/n1/read`);
    expect(fetchUrl(fetchMock)).not.toContain('/concepts/notifications');
    expect(fetchInit(fetchMock)).toEqual(expect.objectContaining({
      method: 'PUT',
      headers: {
        Authorization: 'Bearer token-abc',
        'Content-Type': 'application/json',
      },
    }));
  });

  it('NT-001: markAllAsRead gọi PUT /api/v1/notifications/read-all + Bearer', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse(null));

    await markAllAsRead('token-abc');

    expect(fetchUrl(fetchMock)).toBe(`${API_PREFIX}/read-all`);
    expect(fetchUrl(fetchMock)).not.toContain('/concepts/notifications');
    expect(fetchInit(fetchMock)).toEqual(expect.objectContaining({
      method: 'PUT',
      headers: {
        Authorization: 'Bearer token-abc',
        'Content-Type': 'application/json',
      },
    }));
  });

  it('getNotifications ném lỗi khi response không ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse({ message: 'Unauthorized' }, false, 401));

    await expect(getNotifications('bad-token')).rejects.toThrow('Unauthorized');
  });

  it('NT-008: lỗi HTTP giữ status (401 → store phân loại refresh+retry)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse({ message: 'Unauthorized' }, false, 401));

    await expect(getNotifications('bad-token')).rejects.toMatchObject({ status: 401 });
  });

  it('NT-022: phản hồi không phải JSON → ném lỗi rõ ràng', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      jsonResponse('<html>login page</html>', true, 200, { 'content-type': 'text/html' }),
    );

    await expect(getNotifications('token-abc')).rejects.toThrow(/không phải JSON/i);
  });

  it('markAsRead ném lỗi khi response không ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse({ message: 'Not found' }, false, 404));

    await expect(markAsRead('n1', 'token-abc')).rejects.toThrow('Not found');
  });

  it('markAllAsRead ném lỗi khi response không ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse({ message: 'Server error' }, false, 500));

    await expect(markAllAsRead('token-abc')).rejects.toThrow('Server error');
  });

  it('NT-027: mất mạng (fetch reject) → API ném lỗi, không nuốt', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(getNotifications('token-abc')).rejects.toThrow('Failed to fetch');
  });
});

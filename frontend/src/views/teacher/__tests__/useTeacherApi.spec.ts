// @vitest-environment jsdom
// TC-043t (P3) + TC-013 (P1) + TC-038 (P2): CONTRACT SPEC cho useTeacherApi.
//  - getAuthHeaders lấy token từ auth store (KHÔNG localStorage — TC-006).
//  - teacherRequest: timeout + 401 → refreshAccessToken → retry Bearer mới; 403 KHÔNG retry.
//  - formatTopic map đầy đủ DataStructure/Algorithm/Sorting/Patterns/SystemDesign (TC-036).
//  - Typed 100% — không dùng `any`.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const authMocks = vi.hoisted(() => ({
  accessToken: 'teacher-token',
  refreshAccessToken: vi.fn(),
  impersonate: vi.fn(),
  getAccessToken: () => 'teacher-token',
}));

vi.mock('../../../features/auth/store/useAuthStore', () => ({
  useAuthStore: () => ({
    accessToken: authMocks.accessToken,
    getAccessToken: authMocks.getAccessToken,
    refreshAccessToken: authMocks.refreshAccessToken,
    impersonate: authMocks.impersonate,
  }),
}));

import { useTeacherApi } from '../useTeacherApi';

const BASE_URL = 'http://localhost:5055';

interface FetchCall {
  url: string;
  init?: RequestInit;
}

function getCalls(fetchMock: ReturnType<typeof vi.fn>): FetchCall[] {
  return (fetchMock.mock.calls as [string, RequestInit?][]).map(([url, init]) => ({ url, init }));
}

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, statusText: ok ? 'OK' : 'Error', json: async () => body } as unknown as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;

function stubFetch(): void {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
}

describe('useTeacherApi — Contract Spec (TC-013/TC-038/TC-043t)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    authMocks.accessToken = 'teacher-token';
    stubFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getAuthHeaders / format* (unit)', () => {
    it('getAuthHeaders: Content-Type JSON + Bearer từ auth store (không localStorage — TC-006)', () => {
      localStorage.setItem('accessToken', 'stale-token');
      const api = useTeacherApi();
      expect(api.getAuthHeaders()).toEqual({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer teacher-token',
      });
    });

    it('BASE_URL = VITE_API_BASE_URL fallback http://localhost:5055', () => {
      expect(useTeacherApi().BASE_URL).toBe(BASE_URL);
    });

    it('formatTopic map đầy đủ DataStructure/Algorithm/Sorting/Patterns/SystemDesign (TC-036)', () => {
      const api = useTeacherApi();
      expect(api.formatTopic('DataStructure')).toBe('Cấu trúc dữ liệu');
      expect(api.formatTopic('Algorithm')).toBe('Thuật toán');
      expect(api.formatTopic('Sorting')).toBe('Sắp xếp');
      expect(api.formatTopic('Patterns')).toBe('Mẫu thiết kế');
      expect(api.formatTopic('SystemDesign')).toBe('Thiết kế hệ thống');
    });

    it('formatTopic vẫn giữ map topic quiz cũ (sorting/graph/oop/solid/di/array/linked-list/design-patterns)', () => {
      const api = useTeacherApi();
      expect(api.formatTopic('sorting')).toBe('Sắp xếp');
      expect(api.formatTopic('graph')).toBe('Đồ thị');
      expect(api.formatTopic('oop')).toBe('Hướng đối tượng');
      expect(api.formatTopic('solid')).toBe('Nguyên lý SOLID');
      expect(api.formatTopic('di')).toBe('DI/IoC');
      expect(api.formatTopic('array')).toBe('Mảng');
      expect(api.formatTopic('linked-list')).toBe('Danh sách liên kết');
      expect(api.formatTopic('design-patterns')).toBe('Mẫu thiết kế');
    });

    it('formatTopic fallback: key không biết → trả về nguyên bản', () => {
      expect(useTeacherApi().formatTopic('unknown-key')).toBe('unknown-key');
    });

    it('formatDifficulty map easy/medium/hard', () => {
      const api = useTeacherApi();
      expect(api.formatDifficulty('easy')).toBe('Dễ');
      expect(api.formatDifficulty('medium')).toBe('Trung bình');
      expect(api.formatDifficulty('hard')).toBe('Khó');
    });

    it('formatDate/formatAttemptDate không throw với chuỗi ngày hợp lệ', () => {
      const api = useTeacherApi();
      expect(api.formatDate('2024-07-01T10:00:00Z')).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
      const attempt = api.formatAttemptDate('2024-07-01T10:00:00Z');
      expect(typeof attempt).toBe('string');
      expect(attempt.length).toBeGreaterThan(0);
    });
  });

  describe('teacherRequest: 401 → refresh → retry (TC-013)', () => {
    it('401 → gọi refreshAccessToken() 1 lần → retry với Bearer mới → trả response thành công', async () => {
      authMocks.refreshAccessToken.mockResolvedValueOnce('fresh-token');
      fetchMock
        .mockResolvedValueOnce(jsonResponse({ message: 'Token expired' }, false, 401))
        .mockResolvedValueOnce(jsonResponse({ ok: true }));

      const api = useTeacherApi();
      const res = await api.teacherRequest(`${BASE_URL}/api/v1/concepts/quiz/all`);

      expect(res.ok).toBe(true);
      expect(authMocks.refreshAccessToken).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      const calls = getCalls(fetchMock);
      const retryHeaders = calls[1].init?.headers as Record<string, string> | undefined;
      expect(retryHeaders?.['Authorization']).toBe('Bearer fresh-token');
    });

    it('refreshAccessToken trả null (hết hạn) → giữ nguyên response 401, không retry', async () => {
      authMocks.refreshAccessToken.mockResolvedValueOnce(null);
      fetchMock.mockResolvedValue(jsonResponse({ message: 'Token expired' }, false, 401));

      const api = useTeacherApi();
      const res = await api.teacherRequest(`${BASE_URL}/api/v1/concepts/quiz/all`);

      expect(res.status).toBe(401);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(authMocks.refreshAccessToken).toHaveBeenCalledTimes(1);
    });

    it('403 (Student role / Forbidden) → KHÔNG gọi refresh, trả 403 nguyên trạng (TC-038)', async () => {
      authMocks.refreshAccessToken.mockResolvedValue('fresh-token');
      fetchMock.mockResolvedValue(jsonResponse({ message: 'Forbidden' }, false, 403));

      const api = useTeacherApi();
      const res = await api.teacherRequest(`${BASE_URL}/api/v1/concepts/admin/users`);

      expect(res.status).toBe(403);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(authMocks.refreshAccessToken).not.toHaveBeenCalled();
    });

    it('thành công ngay (200) → chỉ 1 fetch, không refresh', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ data: [] }));

      const api = useTeacherApi();
      const res = await api.teacherRequest(`${BASE_URL}/api/v1/concepts/quiz/all`);

      expect(res.ok).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(authMocks.refreshAccessToken).not.toHaveBeenCalled();
    });

    it('request kèm Authorization Bearer từ auth store', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

      const api = useTeacherApi();
      await api.teacherRequest(`${BASE_URL}/api/v1/concepts/quiz/all`);

      const calls = getCalls(fetchMock);
      const headers = calls[0].init?.headers as Record<string, string> | undefined;
      expect(headers?.['Authorization']).toBe('Bearer teacher-token');
      expect(headers?.['Content-Type']).toBe('application/json');
    });
  });
});

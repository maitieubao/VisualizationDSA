// @vitest-environment jsdom
// CU-038 (P3): contract spec apiClient (src/services/apiClient — nguồn duy nhất sau CU-012).
// - timeout/AbortController: mọi request nhận AbortSignal (15s) + signal caller được nối (CU-011)
// - error shape: ApiError {status, title, detail, errors?} + fallback khi body không phải JSON
// - Bearer: apiClient KHÔNG gắn Authorization (AU-044 — wrapper main.ts là nơi duy nhất)
// - content-type guard: response không phải application/json → undefined, không SyntaxError thô (CU-011)
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { apiRequest, api, type ApiError } from '../../services/apiClient';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

function jsonResponse(
  body: unknown,
  init: { ok?: boolean; status?: number; statusText?: string; contentType?: string } = {},
): Response {
  const { ok = true, status = 200, statusText = 'OK', contentType = 'application/json' } = init;
  return {
    ok,
    status,
    statusText,
    headers: { get: (name: string) => (name.toLowerCase() === 'content-type' ? contentType : null) },
    json: async () => body,
  } as unknown as Response;
}

function headersOf(init: RequestInit | undefined): Record<string, string> {
  return (init?.headers as Record<string, string>) ?? {};
}

describe('apiClient — CU-038', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('GET thành công → parse JSON + URL /api/v1 + Content-Type mặc định', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ items: [1, 2] }));
    vi.stubGlobal('fetch', fetchMock);

    const data = await apiRequest<{ items: number[] }>('/concepts');

    expect(data).toEqual({ items: [1, 2] });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('http://localhost:5055/api/v1/concepts');
    expect(headersOf(init)['Content-Type']).toBe('application/json');
  });

  it('CU-038/AU-044: không gắn Authorization ở lớp này — kể cả khi đã có token (Bearer do wrapper main.ts)', async () => {
    const authStore = useAuthStore();
    authStore.accessToken = 'tok-123';
    const fetchMock = vi.fn(async () => jsonResponse({}));
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest<unknown>('/x');

    const init = (fetchMock.mock.calls[0] as unknown as [string, RequestInit | undefined])[1];
    expect(headersOf(init).Authorization).toBeUndefined();
  });

  it('HTTP 400 + body JSON → ApiError đầy đủ (status/title/detail/errors)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(
      { status: 400, title: 'Bad Request', detail: 'Email đã tồn tại.', errors: { email: ['Đã dùng'] } },
      { ok: false, status: 400, statusText: 'Bad Request' },
    )));

    const err = await apiRequest<unknown>('/x').catch((e) => e);

    expect(err).toMatchObject({
      status: 400,
      title: 'Bad Request',
      detail: 'Email đã tồn tại.',
      errors: { email: ['Đã dùng'] },
    });
  });

  it('HTTP 500 + body không phải JSON → fallback ApiError (title=statusText, detail=HTTP status)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      headers: { get: () => null },
      json: async () => { throw new SyntaxError('Unexpected token'); },
    } as unknown as Response)));

    const err = await apiRequest<unknown>('/x').catch((e) => e);

    expect(err).toMatchObject({ status: 500, title: 'Internal Server Error', detail: 'HTTP 500' });
  });

  it('204 No Content → trả undefined, không parse json', async () => {
    const jsonSpy = vi.fn(async () => { throw new Error('json không được gọi'); });
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      status: 204,
      statusText: 'No Content',
      headers: { get: () => null },
      json: jsonSpy,
    } as unknown as Response)));

    const data = await apiRequest<unknown>('/x', { method: 'DELETE' });

    expect(data).toBeUndefined();
    expect(jsonSpy).not.toHaveBeenCalled();
  });

  it('CU-011: content-type text/html (200) → trả undefined, không SyntaxError thô', async () => {
    const jsonSpy = vi.fn(async () => { throw new SyntaxError('Unexpected token'); });
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: { get: (name: string) => (name.toLowerCase() === 'content-type' ? 'text/html' : null) },
      json: jsonSpy,
    } as unknown as Response)));

    const data = await apiRequest<unknown>('/x').catch((e) => e);

    expect(data).toBeUndefined();
    expect(jsonSpy).not.toHaveBeenCalled();
  });

  it('CU-011: mọi request đều nhận AbortSignal (timeout 15s mặc định)', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({}));
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest<unknown>('/x');

    const init = (fetchMock.mock.calls[0] as unknown as [string, RequestInit | undefined])[1];
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    expect(init?.signal!.aborted).toBe(false);
  });

  it('CU-011: abort signal của caller → request reject AbortError', async () => {
    const controller = new AbortController();
    const fetchMock = vi.fn((_url: string, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      const signal = init?.signal;
      if (!signal) {
        reject(new Error('Không có AbortSignal'));
        return;
      }
      signal.addEventListener('abort', () => {
        reject(new DOMException('The operation was aborted.', 'AbortError'));
      });
    }));
    vi.stubGlobal('fetch', fetchMock);

    const promise = apiRequest<unknown>('/slow', { signal: controller.signal });
    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('api helpers: get/post/put/delete — method + JSON body đúng', async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method === 'DELETE') {
        return { ok: true, status: 204, statusText: 'No Content', headers: { get: () => null }, json: async () => { throw new Error('no'); } } as unknown as Response;
      }
      return jsonResponse({ id: 1 });
    });
    vi.stubGlobal('fetch', fetchMock);

    await api.get<unknown>('/a');
    expect((fetchMock.mock.calls[0][1] as RequestInit | undefined)?.method).toBeUndefined();

    await api.post<unknown>('/b', { name: 'x' });
    expect((fetchMock.mock.calls[1][1] as RequestInit).method).toBe('POST');
    expect(JSON.parse(String((fetchMock.mock.calls[1][1] as RequestInit).body))).toEqual({ name: 'x' });

    await api.put<unknown>('/c', { name: 'y' });
    expect((fetchMock.mock.calls[2][1] as RequestInit).method).toBe('PUT');
    expect(JSON.parse(String((fetchMock.mock.calls[2][1] as RequestInit).body))).toEqual({ name: 'y' });

    await api.delete<unknown>('/d');
    expect((fetchMock.mock.calls[3][1] as RequestInit).method).toBe('DELETE');
  });
});

/**
 * authApi.ts — HTTP client cho Auth endpoints.
 * Tương ứng backend: POST /api/v1/auth/login|register|refresh|logout
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUserDto {
  id:           string;
  email:        string;
  username:     string;
  totalXP:      number;
  currentLevel: number;
  streakDays:   number;
  createdAt:    string;
  badges:       unknown[];
  isPremium:    boolean;
  role?:        'Student' | 'Teacher' | 'Admin';
  nickname?:    string;
  bio?:         string;
  university?:  string;
}

export interface AuthResponse {
  accessToken:  string;
  refreshToken: string;
  expiresIn:    number;    // seconds (15 * 60 = 900)
  user:         AuthUserDto;
}

export interface RegisterPayload {
  email:    string;
  username: string;
  password: string;
}

export interface LoginPayload {
  email:    string;
  password: string;
}

// ── Helper ────────────────────────────────────────────────────────────────────

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

const JSON_HEADERS: HeadersInit = { 'Content-Type': 'application/json' };

// ── Endpoints ─────────────────────────────────────────────────────────────────

/** Đăng ký tài khoản mới */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
    method:  'POST',
    headers: JSON_HEADERS,
    body:    JSON.stringify(payload),
  });
  return handleResponse<AuthResponse>(res);
}

/** Đăng nhập, nhận Access Token + Refresh Token */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method:  'POST',
    headers: JSON_HEADERS,
    body:    JSON.stringify(payload),
  });
  return handleResponse<AuthResponse>(res);
}

/** Dùng Refresh Token để lấy Access Token mới */
export async function refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
    method:  'POST',
    headers: JSON_HEADERS,
    body:    JSON.stringify({ refreshToken }),
  });
  return handleResponse<AuthResponse>(res);
}

/** Đăng xuất — thu hồi Refresh Token trên server */
export async function logout(accessToken: string, refreshToken: string): Promise<void> {
  await fetch(`${API_BASE}/api/v1/auth/logout`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
  }).catch(() => {
    // Logout luôn success ở phía client dù server có lỗi
  });
}

/** Lấy thông tin user hiện tại từ JWT */
export async function getMe(accessToken: string): Promise<AuthUserDto> {
  const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  return handleResponse<AuthUserDto>(res);
}

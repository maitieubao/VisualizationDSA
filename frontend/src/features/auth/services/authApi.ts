




const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';



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
  expiresIn:    number;    
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



async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body: { message?: string } | null = await response.json().catch(() => null);
    const error = new Error(body?.message ?? `HTTP ${response.status}: ${response.statusText}`);
    // Gắn HTTP status — cần thiết để phân biệt lỗi auth (401/403) với lỗi mạng/5xx
    // (production thay message bằng safe-message → regex không dựa được).
    (error as { status?: number }).status = response.status;
    throw error;
  }
  return response.json() as Promise<T>;
}

const JSON_HEADERS: HeadersInit = { 'Content-Type': 'application/json' };




export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
    method:  'POST',
    headers: JSON_HEADERS,
    body:    JSON.stringify(payload),
  });
  return handleResponse<AuthResponse>(res);
}


export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method:  'POST',
    headers: JSON_HEADERS,
    body:    JSON.stringify(payload),
  });
  return handleResponse<AuthResponse>(res);
}


export async function refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
    method:  'POST',
    headers: JSON_HEADERS,
    body:    JSON.stringify({ refreshToken }),
  });
  return handleResponse<AuthResponse>(res);
}


export async function logout(accessToken: string, refreshToken: string): Promise<void> {
  await fetch(`${API_BASE}/api/v1/auth/logout`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
  }).catch(() => {
    
  });
}


export async function getMe(accessToken: string): Promise<AuthUserDto> {
  const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  return handleResponse<AuthUserDto>(res);
}

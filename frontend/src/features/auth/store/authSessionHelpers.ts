import type { Ref } from 'vue';
import * as authApi from '../services/authApi';

const REFRESH_TOKEN_KEY  = 'vdsa_refresh_token';
const ACCESS_EXPIRES_KEY = 'vdsa_access_expires'; // epoch ms

/**
 * Lưu session mới (access token, refresh token, user) vào store và localStorage.
 * Trả về refreshTimer ID.
 */
export function setSession(
  response: authApi.AuthResponse,
  accessToken: Ref<string | null>,
  currentUser: Ref<authApi.AuthUserDto | null>,
  scheduleRefresh: (expiresIn: number) => void,
): void {
  const { accessToken: at, refreshToken: rt, expiresIn, user } = response;
  accessToken.value  = at;
  currentUser.value  = user;
  localStorage.setItem(REFRESH_TOKEN_KEY,  rt);
  localStorage.setItem(ACCESS_EXPIRES_KEY, String(Date.now() + expiresIn * 1000));
  scheduleRefresh(expiresIn);
}

/** Xóa toàn bộ session: memory + localStorage + timer. */
export function clearSession(
  accessToken: Ref<string | null>,
  currentUser: Ref<authApi.AuthUserDto | null>,
  refreshTimer: { value: ReturnType<typeof setTimeout> | null },
): void {
  accessToken.value = null;
  currentUser.value = null;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ACCESS_EXPIRES_KEY);
  if (refreshTimer.value) { clearTimeout(refreshTimer.value); refreshTimer.value = null; }
}

/** Lấy refresh token đã lưu trong localStorage. */
export function getSavedRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

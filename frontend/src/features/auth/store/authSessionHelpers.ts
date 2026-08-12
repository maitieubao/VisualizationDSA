import type { Ref } from 'vue';
import * as authApi from '../services/authApi';

export const REFRESH_TOKEN_KEY  = 'vdsa_refresh_token';
export const ACCESS_EXPIRES_KEY = 'vdsa_access_expires'; 
export const STATELESS_USER_ID_KEY = 'vdsa_stateless_user_id';
export const ADMIN_ACCESS_TOKEN_KEY  = 'vdsa_admin_access_token';
export const ADMIN_REFRESH_TOKEN_KEY = 'vdsa_admin_refresh_token';
export const ADMIN_USER_ID_KEY       = 'vdsa_admin_user_id';
export const ADMIN_USER_DATA_KEY     = 'vdsa_admin_user_data';
export const ADMIN_ACCESS_EXPIRES_KEY = 'vdsa_admin_access_expires';





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
  // Classic login phải xóa dấu vết stateless — nếu không, reload sau đó bị route nhầm sang
  // stateless refresh (init ưu tiên STATELESS_USER_ID_KEY) → 401 → mất phiên oan.
  localStorage.removeItem('vdsa_stateless_user_id');
  scheduleRefresh(expiresIn);
}


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


export function getSavedRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

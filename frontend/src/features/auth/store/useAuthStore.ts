









import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as authApi from '../services/authApi';
import {
  setSession, clearSession, getSavedRefreshToken,
  REFRESH_TOKEN_KEY, ACCESS_EXPIRES_KEY, STATELESS_USER_ID_KEY,
  ADMIN_ACCESS_TOKEN_KEY, ADMIN_REFRESH_TOKEN_KEY, ADMIN_USER_ID_KEY, ADMIN_USER_DATA_KEY,
} from './authSessionHelpers';
import { statelessAuthApi } from '../services/statelessAuthApi';
import type { StatelessUserDto, StatelessAuthResponse } from '../services/statelessAuthApi';

export const useAuthStore = defineStore('auth', () => {
  
  const accessToken  = ref<string | null>(null);      
  const currentUser  = ref<authApi.AuthUserDto | null>(null);
  const isLoading    = ref<boolean>(false);
  const authError    = ref<string | null>(null);

  const refreshTimer = { value: null as ReturnType<typeof setTimeout> | null };

  
  const isAuthenticated = computed(() => accessToken.value !== null && currentUser.value !== null);
  const userName        = computed(() => currentUser.value?.username ?? 'Khách');
  const userLevel       = computed(() => currentUser.value?.currentLevel ?? 1);
  const userXP          = computed(() => currentUser.value?.totalXP ?? 0);
  const isPremium       = computed(() => currentUser.value?.isPremium ?? false);
  const userRole        = computed(() => currentUser.value?.role ?? 'Student');
  const isTeacher       = computed(() => userRole.value === 'Teacher');
  const isAdmin         = computed(() => userRole.value === 'Admin');

  
  // Cleanup phiên stateless dùng chung (timer catch + refresh fail) — trước đây timer catch
  // gọi clearSession classic-only → bỏ sót stateless keys, trạng thái nửa vời.
  function _clearStatelessSession(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ACCESS_EXPIRES_KEY);
    localStorage.removeItem(STATELESS_USER_ID_KEY);
    // Dọn cả dấu vết impersonate — tránh UI "đang impersonate" khi session đã chết.
    localStorage.removeItem('vdsa_admin_access_token');
    localStorage.removeItem('vdsa_admin_refresh_token');
    localStorage.removeItem('vdsa_admin_user_id');
    localStorage.removeItem('vdsa_admin_user_data');
    if (refreshTimer.value) { clearTimeout(refreshTimer.value); refreshTimer.value = null; }
    accessToken.value = null;
    currentUser.value = null;
    statelessUser.value = null;
    isStatelessMode.value = false;
    impersonateTrigger.value++;
  }

  function _scheduleRefresh(expiresInSeconds: number): void {
    if (refreshTimer.value) clearTimeout(refreshTimer.value);
    const delay = Math.max(0, (expiresInSeconds - 120) * 1000);
    refreshTimer.value = setTimeout(async () => {
      const saved = getSavedRefreshToken();
      if (!saved) return;
      try {
        // Đi qua refreshAccessToken() của store: tự chọn đúng mode (stateless/classic)
        // và dùng chung dedupe refreshPromise — tránh 2 request song song/đường chéo mode.
        await refreshAccessToken();
      } catch (err) {
        // refreshAccessToken đã quyết định giữ/xóa phiên theo loại lỗi —
        // timer chỉ dọn dẹp phần còn lại khi session thực sự vô hiệu.
        const httpStatus = (err as { status?: number } | null)?.status;
        // Mọi 4xx (trừ 429 rate-limit) đều là lỗi auth cần xóa phiên — gồm 404 khi refresh
        // (user bị xóa khỏi memory) để không kẹt vòng lặp 401-refresh.
        const isAuthFailure = (httpStatus !== undefined && httpStatus >= 400 && httpStatus < 500 && httpStatus !== 429)
          || (err instanceof Error && /token|expired|invalid|hết hạn|không còn hiệu lực/i.test(err.message));
        if (!isAuthFailure) return;
        if (isStatelessMode.value || localStorage.getItem(STATELESS_USER_ID_KEY)) {
          _clearStatelessSession();
        } else {
          clearSession(accessToken, currentUser, refreshTimer);
        }
      }
    }, delay);
  }

  

  
  async function init(): Promise<void> {
    const savedUserId = localStorage.getItem(STATELESS_USER_ID_KEY);
    if (savedUserId) {
      await statelessInit();
      await loadStatelessProfile();
      return;
    }
    const saved = getSavedRefreshToken();
    if (!saved) return;
    try { setSession(await authApi.refreshAccessToken(saved), accessToken, currentUser, _scheduleRefresh); }
    catch { clearSession(accessToken, currentUser, refreshTimer); }
  }

  async function register(email: string, username: string, password: string): Promise<void> {
    isLoading.value = true; authError.value = null;
    try { setSession(await authApi.register({ email, username, password }), accessToken, currentUser, _scheduleRefresh); }
    catch (err) { authError.value = err instanceof Error ? err.message : 'Đăng ký thất bại.'; throw err; }
    finally { isLoading.value = false; }
  }

  async function logIn(email: string, password: string): Promise<void> {
    isLoading.value = true; authError.value = null;
    try { setSession(await authApi.login({ email, password }), accessToken, currentUser, _scheduleRefresh); }
    catch (err) { authError.value = err instanceof Error ? err.message : 'Đăng nhập thất bại.'; throw err; }
    finally { isLoading.value = false; }
  }

  async function logOut(): Promise<void> {
    const savedRefresh = getSavedRefreshToken();
    if (accessToken.value && savedRefresh) await authApi.logout(accessToken.value, savedRefresh);
    clearSession(accessToken, currentUser, refreshTimer);
  }

  
  function getAccessToken(): string | null { return accessToken.value; }

  let refreshPromise: Promise<string | null> | null = null;

  async function refreshAccessToken(): Promise<string | null> {
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      const savedRefresh = getSavedRefreshToken();
      const savedUserId = localStorage.getItem(STATELESS_USER_ID_KEY);

      if (!savedRefresh) {
        throw new Error('No refresh token available');
      }

      try {
        if (savedUserId || isStatelessMode.value) {
          const userId = savedUserId || statelessUser.value?.id;
          if (!userId) throw new Error('No user ID available for stateless refresh');
          const response = await statelessAuthApi.refresh(savedRefresh, userId);
          _applyStatelessAuth(response);
          return response.accessToken;
        } else {
          const response = await authApi.refreshAccessToken(savedRefresh);
          setSession(response, accessToken, currentUser, _scheduleRefresh);
          return response.accessToken;
        }
      } catch (err) {
        // Chỉ xóa phiên khi lỗi là AUTH thật (HTTP 401/403 hoặc token bị từ chối).
        // Lỗi mạng/5xx thoáng qua → GIỮ phiên (timer/interceptor sẽ thử lại).
        const httpStatus = (err as { status?: number } | null)?.status;
        // Mọi 4xx (trừ 429 rate-limit) đều là lỗi auth cần xóa phiên — gồm 404 khi refresh
        // (user bị xóa khỏi memory) để không kẹt vòng lặp 401-refresh.
        const isAuthFailure = (httpStatus !== undefined && httpStatus >= 400 && httpStatus < 500 && httpStatus !== 429)
          || (err instanceof Error && /token|expired|invalid|hết hạn|không còn hiệu lực/i.test(err.message));
        if (isAuthFailure) {
          if (savedUserId || isStatelessMode.value) {
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            localStorage.removeItem(ACCESS_EXPIRES_KEY);
            localStorage.removeItem(STATELESS_USER_ID_KEY);
            accessToken.value = null;
            currentUser.value = null;
            statelessUser.value = null;
            isStatelessMode.value = false;
          } else {
            clearSession(accessToken, currentUser, refreshTimer);
          }
        }
        throw err;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }

  
  const statelessUser = ref<StatelessUserDto | null>(null);
  const isStatelessMode = ref(false);

  function _applyStatelessAuth(response: StatelessAuthResponse): void {
    accessToken.value = response.accessToken;
    statelessUser.value = response.user;
    isStatelessMode.value = true;
    currentUser.value = {
      id: response.user.id,
      email: response.user.email,
      username: response.user.username,
      totalXP: response.user.totalXP,
      currentLevel: response.user.currentLevel,
      streakDays: response.user.streakDays,
      createdAt: response.user.createdAt,
      badges: response.user.badges,
      isPremium: response.user.isPremium,
      role: response.user.role,
      nickname: response.user.nickname,
      bio: response.user.bio,
      university: response.user.university,
    };
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(ACCESS_EXPIRES_KEY, String(Date.now() + response.expiresIn * 1000));
    localStorage.setItem(STATELESS_USER_ID_KEY, response.user.id);

    // Chủ động refresh trước khi hết hạn (trước đây stateless chỉ chờ 401 thụ động).
    _scheduleRefresh(response.expiresIn);
  }

  async function statelessLogin(email: string, password: string): Promise<void> {
    isLoading.value = true; authError.value = null;
    try {
      const response = await statelessAuthApi.login(email, password);
      _applyStatelessAuth(response);
    } catch (err: unknown) {
      authError.value = err instanceof Error ? err.message : 'Đăng nhập thất bại.';
      throw err;
    } finally { isLoading.value = false; }
  }

  async function statelessRegister(email: string, username: string, password: string): Promise<void> {
    isLoading.value = true; authError.value = null;
    try {
      const response = await statelessAuthApi.register(email, username, password);
      _applyStatelessAuth(response);
    } catch (err: unknown) {
      authError.value = err instanceof Error ? err.message : 'Đăng ký thất bại.';
      throw err;
    } finally { isLoading.value = false; }
  }

  async function statelessLogout(): Promise<void> {
    const savedRefresh = getSavedRefreshToken();
    if (savedRefresh) await statelessAuthApi.logout(savedRefresh);
    accessToken.value = null;
    currentUser.value = null;
    statelessUser.value = null;
    isStatelessMode.value = false;
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ACCESS_EXPIRES_KEY);
    localStorage.removeItem(STATELESS_USER_ID_KEY);
  }

  async function statelessInit(): Promise<void> {
    const savedRefresh = getSavedRefreshToken();
    const savedUserId = localStorage.getItem(STATELESS_USER_ID_KEY);
    if (!savedRefresh || !savedUserId) return;

    try {
      const response = await statelessAuthApi.refresh(savedRefresh, savedUserId);
      _applyStatelessAuth(response);
    } catch {
      
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(ACCESS_EXPIRES_KEY);
      localStorage.removeItem(STATELESS_USER_ID_KEY);
    }
  }

  async function loadStatelessProfile(): Promise<void> {
    const userId = statelessUser.value?.id ?? localStorage.getItem(STATELESS_USER_ID_KEY);
    if (!userId) return;
    try {
      statelessUser.value = await statelessAuthApi.getMe();
      if (currentUser.value) {
        currentUser.value.totalXP = statelessUser.value.totalXP;
        currentUser.value.currentLevel = statelessUser.value.currentLevel;
        currentUser.value.streakDays = statelessUser.value.streakDays;
        currentUser.value.nickname = statelessUser.value.nickname;
        currentUser.value.bio = statelessUser.value.bio;
        currentUser.value.university = statelessUser.value.university;
      }
    } catch {  }
  }

  async function updateProfile(username: string, nickname?: string, bio?: string, university?: string): Promise<void> {
    isLoading.value = true; authError.value = null;
    try {
      const updatedUser = await statelessAuthApi.updateProfile(username, nickname, bio, university);
      statelessUser.value = updatedUser;
      if (currentUser.value) {
        currentUser.value.username = updatedUser.username;
        currentUser.value.nickname = updatedUser.nickname;
        currentUser.value.bio = updatedUser.bio;
        currentUser.value.university = updatedUser.university;
      }
    } catch (err: unknown) {
      authError.value = err instanceof Error ? err.message : 'Cập nhật hồ sơ thất bại.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    isLoading.value = true; authError.value = null;
    try {
      await statelessAuthApi.changePassword(currentPassword, newPassword);
    } catch (err: unknown) {
      authError.value = err instanceof Error ? err.message : 'Đổi mật khẩu thất bại.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  const impersonateTrigger = ref(0);
  const isImpersonating = computed(() => {
    const _ = impersonateTrigger.value;
    return localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY) !== null;
  });

  async function startImpersonating(userId: string): Promise<void> {
    const adminToken = accessToken.value;
    if (!adminToken) throw new Error('Không có token Admin.');
    isLoading.value = true; authError.value = null;
    try {
      const response = await statelessAuthApi.impersonateUser(userId, adminToken);
      impersonate(response);
    } catch (err) {
      authError.value = err instanceof Error ? err.message : 'Đóng vai thất bại.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function impersonate(response: StatelessAuthResponse): void {
    
    const currentAccessToken = accessToken.value;
    const currentRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const currentUserId = localStorage.getItem(STATELESS_USER_ID_KEY);
    const currentUserData = JSON.stringify(currentUser.value);

    // Wrap try/catch — QuotaExceededException khi storage đầy không làm hỏng luồng đóng vai.
    try {
      if (currentAccessToken) localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, currentAccessToken);
      if (currentRefreshToken) localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, currentRefreshToken);
      if (currentUserId) localStorage.setItem(ADMIN_USER_ID_KEY, currentUserId);
      if (currentUserData) localStorage.setItem(ADMIN_USER_DATA_KEY, currentUserData);
    } catch {
      // Storage đầy — bỏ qua, admin vẫn đăng nhập bình thường.
    }

    
    _applyStatelessAuth(response);
    impersonateTrigger.value++;
  }

  function stopImpersonating(): void {
    const adminAccessToken = localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
    const adminRefreshToken = localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);
    const adminUserId = localStorage.getItem(ADMIN_USER_ID_KEY);
    const adminUserDataStr = localStorage.getItem(ADMIN_USER_DATA_KEY);

    if (!adminAccessToken || !adminRefreshToken || !adminUserId || !adminUserDataStr) {
      return;
    }

    
    accessToken.value = adminAccessToken;
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, adminRefreshToken);
      localStorage.setItem(STATELESS_USER_ID_KEY, adminUserId);
    } catch {
      // Storage đầy — bỏ qua.
    }
    
    try {
      const adminUser = JSON.parse(adminUserDataStr) as authApi.AuthUserDto;
      currentUser.value = adminUser;
      // statelessUser cần đúng shape StatelessUserDto (badges mảng có kiểu) — map thủ công.
      statelessUser.value = {
        id: adminUser.id,
        email: adminUser.email,
        username: adminUser.username,
        totalXP: adminUser.totalXP,
        currentLevel: adminUser.currentLevel,
        streakDays: adminUser.streakDays,
        createdAt: adminUser.createdAt ?? new Date().toISOString(),
        badges: ((adminUser.badges ?? []) as Record<string, unknown>[]).map(b => ({
          id: String(b?.id ?? ''),
          name: String(b?.name ?? ''),
          description: String(b?.description ?? ''),
          icon: String(b?.icon ?? ''),
          color: String(b?.color ?? ''),
          earnedAt: String(b?.earnedAt ?? new Date().toISOString()),
        })) ?? [],
        isPremium: adminUser.isPremium,
        role: adminUser.role ?? 'Student',
      };
    } catch {
      
    }

    
    localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
    localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_ID_KEY);
    localStorage.removeItem(ADMIN_USER_DATA_KEY);

    isStatelessMode.value = true;
    impersonateTrigger.value++;
  }

  return {
    accessToken, currentUser, isLoading, authError,
    isAuthenticated, userName, userLevel, userXP, isPremium, userRole, isTeacher, isAdmin,
    init, register, logIn, logOut, getAccessToken, refreshAccessToken,
    
    statelessUser, isStatelessMode,
    statelessLogin, statelessRegister, statelessLogout, statelessInit, loadStatelessProfile, updateProfile, changePassword,
    
    isImpersonating, impersonate, startImpersonating, stopImpersonating
  };
});

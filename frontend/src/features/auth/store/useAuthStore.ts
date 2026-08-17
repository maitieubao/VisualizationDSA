import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as authApi from '../services/authApi';
import {
  setSession, clearSession, getSavedRefreshToken,
  REFRESH_TOKEN_KEY, ACCESS_EXPIRES_KEY, STATELESS_USER_ID_KEY,
  ADMIN_ACCESS_TOKEN_KEY, ADMIN_REFRESH_TOKEN_KEY, ADMIN_USER_ID_KEY, ADMIN_USER_DATA_KEY,
  ADMIN_ACCESS_EXPIRES_KEY,
} from './authSessionHelpers';
import { statelessAuthApi, AVATAR_URL_STORAGE_KEY } from '../services/statelessAuthApi';
import type { StatelessUserDto, StatelessAuthResponse } from '../services/statelessAuthApi';

export const useAuthStore = defineStore('auth', () => {
  
  const accessToken  = ref<string | null>(null);      
  const currentUser  = ref<authApi.AuthUserDto | null>(null);
  // Loading tách theo action (AU-050): trước đây dùng chung isLoading làm updateProfile/
  // changePassword đang chạy mà disabled nhầm nút login và ngược lại.
  const loginLoading    = ref<boolean>(false);
  const registerLoading = ref<boolean>(false);
  const profileLoading  = ref<boolean>(false);
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

  
  // Phân biệt lỗi AUTH thật (4xx trừ 429) với lỗi mạng/5xx — dùng chung ở mọi nơi
  // quyết định xóa/giữ phiên (AU-008): lỗi mạng/5xx thoáng qua phải GIỮ session.
  function isAuthFailureError(err: unknown): boolean {
    const httpStatus = (err as { status?: number } | null)?.status;
    return (httpStatus !== undefined && httpStatus >= 400 && httpStatus < 500 && httpStatus !== 429)
      || (err instanceof Error && /token|expired|invalid|hết hạn|không còn hiệu lực/i.test(err.message));
  }

  // Cleanup phiên stateless dùng chung (timer catch + refresh fail + logout) — trước đây timer
  // catch gọi clearSession classic-only → bỏ sót stateless keys, trạng thái nửa vời (AU-040).
  function _clearStatelessSession(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ACCESS_EXPIRES_KEY);
    localStorage.removeItem(STATELESS_USER_ID_KEY);
    // Dọn cả dấu vết impersonate — tránh UI "đang impersonate" khi session đã chết.
    localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
    localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_ID_KEY);
    localStorage.removeItem(ADMIN_USER_DATA_KEY);
    localStorage.removeItem(ADMIN_ACCESS_EXPIRES_KEY);
    if (refreshTimer.value) { clearTimeout(refreshTimer.value); refreshTimer.value = null; }
    accessToken.value = null;
    currentUser.value = null;
    statelessUser.value = null;
    isStatelessMode.value = false;
    impersonateTrigger.value++;
  }

  // Reset các store phụ thuộc (XP/level/sync queue, thông báo...) khi logout/session hết hạn (AU-006/007, NT-004).
  // Import động để tránh vòng lặp module (progress store import auth store).
  async function _resetDependentStores(): Promise<void> {
    try {
      const { useUserProgressStore } = await import('../../user-progress/store/useUserProgressStore');
      useUserProgressStore().resetForLogout();
    } catch {
      // Test/edge: store chưa khả dụng — bỏ qua, không làm hỏng luồng logout.
    }
    // NT-004: reset thông báo khi logout/impersonate/đổi user — user B không thấy badge/list của user A.
    try {
      const { useNotificationStore } = await import('../../notifications/store/useNotificationStore');
      useNotificationStore().reset();
    } catch {
      // Test/edge: store chưa khả dụng — bỏ qua.
    }
  }

  // Session hết hạn: toast rõ ràng + redirect landing (giữ route nguồn qua query) (AU-007).
  async function _notifySessionExpired(): Promise<void> {
    try {
      const { useToastStore } = await import('../../../composables/useToast');
      useToastStore().warning('Phiên đã hết hạn, vui lòng đăng nhập lại.');
    } catch {
      // Pinia chưa active (test edge) — bỏ qua toast.
    }
    try {
      const { default: appRouter } = await import('../../../router');
      const current = appRouter.currentRoute.value;
      const source = current.name && current.name !== 'landing' ? current.fullPath : undefined;
      await appRouter.replace({ name: 'landing', query: source ? { redirect: source } : undefined });
    } catch {
      // Test/edge: router chưa sẵn sàng — bỏ qua redirect.
    }
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
        // refreshAccessToken đã tự xử lý xóa phiên + toast + redirect khi lỗi auth thật (AU-007) —
        // timer chỉ ghi log cho lỗi thoáng qua (mạng/5xx) vì phiên được giữ để thử lại sau.
        if (!isAuthFailureError(err)) {
          console.warn('[Auth] Refresh thất bại thoáng qua — giữ phiên, sẽ thử lại sau.', err);
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
    catch (err) {
      // Chỉ xóa phiên khi lỗi là AUTH thật (4xx trừ 429); lỗi mạng/5xx phải GIỮ session (AU-008).
      if (isAuthFailureError(err)) clearSession(accessToken, currentUser, refreshTimer);
    }
  }

  async function register(email: string, username: string, password: string): Promise<void> {
    registerLoading.value = true; authError.value = null;
    try { setSession(await authApi.register({ email, username, password }), accessToken, currentUser, _scheduleRefresh); }
    catch (err) { authError.value = err instanceof Error ? err.message : 'Đăng ký thất bại.'; throw err; }
    finally { registerLoading.value = false; }
  }

  async function logIn(email: string, password: string): Promise<void> {
    loginLoading.value = true; authError.value = null;
    try { setSession(await authApi.login({ email, password }), accessToken, currentUser, _scheduleRefresh); }
    catch (err) { authError.value = err instanceof Error ? err.message : 'Đăng nhập thất bại.'; throw err; }
    finally { loginLoading.value = false; }
  }

  async function logOut(): Promise<void> {
    const savedRefresh = getSavedRefreshToken();
    if (accessToken.value && savedRefresh) await authApi.logout(accessToken.value, savedRefresh);
    clearSession(accessToken, currentUser, refreshTimer);
    // Reset XP/level + xóa pendingSyncQueue — tránh XP user A bị flush sang user B (AU-006).
    await _resetDependentStores();
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
          // Backend xác định người dùng từ token — không gửi userId trong body refresh (AU-055).
          const response = await statelessAuthApi.refresh(savedRefresh);
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
        if (isAuthFailureError(err)) {
          if (savedUserId || isStatelessMode.value) {
            _clearStatelessSession();
          } else {
            clearSession(accessToken, currentUser, refreshTimer);
          }
          // Session hết hạn: báo toast + redirect landing + reset store phụ thuộc (AU-007).
          await Promise.all([_notifySessionExpired(), _resetDependentStores()]);
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
    loginLoading.value = true; authError.value = null;
    try {
      const response = await statelessAuthApi.login(email, password);
      _applyStatelessAuth(response);
    } catch (err: unknown) {
      authError.value = err instanceof Error ? err.message : 'Đăng nhập thất bại.';
      throw err;
    } finally { loginLoading.value = false; }
  }

  async function statelessRegister(email: string, username: string, password: string, isTeacher = false): Promise<void> {
    registerLoading.value = true; authError.value = null;
    try {
      const response = await statelessAuthApi.register(email, username, password, isTeacher);
      _applyStatelessAuth(response);
    } catch (err: unknown) {
      authError.value = err instanceof Error ? err.message : 'Đăng ký thất bại.';
      throw err;
    } finally { registerLoading.value = false; }
  }

  async function statelessLogout(): Promise<void> {
    const savedRefresh = getSavedRefreshToken();
    if (savedRefresh) await statelessAuthApi.logout(savedRefresh);
    // Dùng chung cleanup: clear refreshTimer + 4 key ADMIN_* (AU-040).
    _clearStatelessSession();
    // Reset XP/level + xóa pendingSyncQueue (AU-006).
    await _resetDependentStores();
  }

  async function statelessInit(): Promise<void> {
    const savedRefresh = getSavedRefreshToken();
    const savedUserId = localStorage.getItem(STATELESS_USER_ID_KEY);
    if (!savedRefresh || !savedUserId) return;

    try {
      const response = await statelessAuthApi.refresh(savedRefresh);
      _applyStatelessAuth(response);
    } catch (err) {
      // Chỉ xóa keys khi lỗi AUTH thật; lỗi mạng/5xx → GIỮ session cho lần khởi động sau (AU-008).
      if (isAuthFailureError(err)) {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(ACCESS_EXPIRES_KEY);
        localStorage.removeItem(STATELESS_USER_ID_KEY);
      }
    }
  }

  async function loadStatelessProfile(): Promise<void> {
    const userId = statelessUser.value?.id ?? localStorage.getItem(STATELESS_USER_ID_KEY);
    if (!userId) return;
    try {
      statelessUser.value = await statelessAuthApi.getMe();
      if (currentUser.value && statelessUser.value) {
        // PR-010: đồng bộ ĐỦ badges/username/isPremium (trước đây bỏ sót → ProgressTab +
        // badge pill stale sau khi nhận badge mới). PR-013: gán OBJECT MỚI thay vì mutate
        // in-place — watcher theo identity của ProfileGeneralTab trigger → form re-sync sau load.
        const updated = {
          ...currentUser.value,
          totalXP: statelessUser.value.totalXP,
          currentLevel: statelessUser.value.currentLevel,
          streakDays: statelessUser.value.streakDays,
          nickname: statelessUser.value.nickname,
          bio: statelessUser.value.bio,
          university: statelessUser.value.university,
          username: statelessUser.value.username,
          isPremium: statelessUser.value.isPremium,
          badges: statelessUser.value.badges,
          avatarUrl: statelessUser.value.avatarUrl,
        };
        // PR-005: backend chưa persist avatarUrl (UpdateProfile chưa nhận tham số) —
        // overlay avatar cục bộ đã upload để UI nhất quán mọi tab.
        const localAvatar = localStorage.getItem(AVATAR_URL_STORAGE_KEY);
        if (!updated.avatarUrl && localAvatar) updated.avatarUrl = localAvatar;
        currentUser.value = updated;
      }
    } catch (err) {
      // PR-027: lỗi AUTH thật (401/403) ném ra cho caller (ProfileView) xử lý — phiên hết hạn
      // phải hiển thị rõ ràng; lỗi mạng/5xx thoáng qua giữ phiên và bỏ qua im lặng (AU-008).
      if (isAuthFailureError(err)) throw err;
    }
  }

  async function updateProfile(username: string, nickname?: string, bio?: string, university?: string): Promise<void> {
    profileLoading.value = true; authError.value = null;
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
      profileLoading.value = false;
    }
  }

  async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    profileLoading.value = true; authError.value = null;
    try {
      await statelessAuthApi.changePassword(currentPassword, newPassword);
    } catch (err: unknown) {
      authError.value = err instanceof Error ? err.message : 'Đổi mật khẩu thất bại.';
      throw err;
    } finally {
      profileLoading.value = false;
    }
  }

  // Xóa authError — LoginModal dùng action này thay vì gán trực tiếp (AU-043).
  function clearError(): void {
    authError.value = null;
  }

  const impersonateTrigger = ref(0);
  const isImpersonating = computed(() => {
    const _ = impersonateTrigger.value;
    return localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY) !== null;
  });

  async function startImpersonating(userId: string): Promise<void> {
    const adminToken = accessToken.value;
    if (!adminToken) throw new Error('Không có token Admin.');
    profileLoading.value = true; authError.value = null;
    try {
      const response = await statelessAuthApi.impersonateUser(userId, adminToken);
      impersonate(response);
    } catch (err) {
      authError.value = err instanceof Error ? err.message : 'Đóng vai thất bại.';
      throw err;
    } finally {
      profileLoading.value = false;
    }
  }

  function impersonate(response: StatelessAuthResponse): void {
    
    const currentAccessToken = accessToken.value;
    const currentRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const currentUserId = localStorage.getItem(STATELESS_USER_ID_KEY);
    const currentUserData = JSON.stringify(currentUser.value);
    // Lưu cả mốc hết hạn admin — để stopImpersonating lên lịch refresh lại đúng hạn (AU-040).
    const currentAccessExpiry = localStorage.getItem(ACCESS_EXPIRES_KEY);

    // Wrap try/catch — QuotaExceededException khi storage đầy không làm hỏng luồng đóng vai.
    try {
      if (currentAccessToken) localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, currentAccessToken);
      if (currentRefreshToken) localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, currentRefreshToken);
      if (currentUserId) localStorage.setItem(ADMIN_USER_ID_KEY, currentUserId);
      if (currentUserData) localStorage.setItem(ADMIN_USER_DATA_KEY, currentUserData);
      if (currentAccessExpiry) localStorage.setItem(ADMIN_ACCESS_EXPIRES_KEY, currentAccessExpiry);
    } catch {
      // Storage đầy — bỏ qua, admin vẫn đăng nhập bình thường.
    }

    
    _applyStatelessAuth(response);
    impersonateTrigger.value++;

    // AD-020: reset store phụ thuộc — XP/level của user bị đóng vai không trôi chéo sang admin.
    // Fire-and-forget: giữ impersonate đồng bộ (caller redirect ngay, không đợi dynamic import).
    void _resetDependentStores();
  }

  async function stopImpersonating(): Promise<void> {
    const adminAccessToken = localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
    const adminRefreshToken = localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);
    const adminUserId = localStorage.getItem(ADMIN_USER_ID_KEY);
    const adminUserDataStr = localStorage.getItem(ADMIN_USER_DATA_KEY);
    const adminAccessExpiry = localStorage.getItem(ADMIN_ACCESS_EXPIRES_KEY);

    if (!adminAccessToken || !adminRefreshToken || !adminUserId || !adminUserDataStr) {
      return;
    }

    
    accessToken.value = adminAccessToken;
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, adminRefreshToken);
      localStorage.setItem(STATELESS_USER_ID_KEY, adminUserId);
      // Khôi phục lại mốc hết hạn của admin (đang bị _applyStatelessAuth ghi đè).
      if (adminAccessExpiry) localStorage.setItem(ACCESS_EXPIRES_KEY, adminAccessExpiry);
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
    localStorage.removeItem(ADMIN_ACCESS_EXPIRES_KEY);

    isStatelessMode.value = true;
    impersonateTrigger.value++;

    // AD-014: token admin còn hạn → lên lịch refresh lại đúng hạn; token đã hết hạn
    // (remainingSeconds <= 0) → refresh NGAY bằng adminRefreshToken (đã khôi phục vào
    // REFRESH_TOKEN_KEY) TRƯỚC khi thao tác tiếp — tránh /admin rơi vào 401 im lặng.
    if (adminAccessExpiry) {
      const remainingSeconds = Math.floor((Number(adminAccessExpiry) - Date.now()) / 1000);
      if (remainingSeconds > 0) {
        _scheduleRefresh(remainingSeconds);
      } else {
        try {
          await refreshAccessToken();
        } catch {
          // refreshAccessToken đã tự xử lý xóa phiên + toast + redirect khi lỗi auth thật (AU-007).
        }
      }
    }

    // AD-020: reset store phụ thuộc — XP/level chéo store của user bị đóng vai không dính admin.
    await _resetDependentStores();
  }

  // Đánh dấu user premium sau khi thanh toán thành công (PM-021) — cập nhật đồng bộ
  // cả currentUser lẫn statelessUser để profile không bị stale (stateless cũ chỉ gán
  // currentUser → statelessUser vẫn false → profile hiển thị sai).
  function markPremium(): void {
    if (currentUser.value) {
      currentUser.value.isPremium = true;
    }
    if (statelessUser.value) {
      statelessUser.value.isPremium = true;
    }
  }

  return {
    accessToken, currentUser, loginLoading, registerLoading, profileLoading, authError,
    isAuthenticated, userName, userLevel, userXP, isPremium, userRole, isTeacher, isAdmin,
    init, register, logIn, logOut, getAccessToken, refreshAccessToken, clearError, markPremium,
    
    statelessUser, isStatelessMode,
    statelessLogin, statelessRegister, statelessLogout, statelessInit, loadStatelessProfile, updateProfile, changePassword,
    
    isImpersonating, impersonate, startImpersonating, stopImpersonating
  };
});











import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as authApi from '@/features/auth/services/authApi';
import { setSession, clearSession, getSavedRefreshToken } from './authSessionHelpers';
import { statelessAuthApi } from '@/features/auth/services/statelessAuthApi';
import type { StatelessUserDto, StatelessAuthResponse } from '@/features/auth/services/statelessAuthApi';
import { useGamificationStore } from '@/features/gamification-engine/store/useGamificationStore';

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
  
  const userHearts      = computed(() => currentUser.value?.hearts ?? 10);
  const userMaxHearts   = computed(() => currentUser.value?.maxHearts ?? 10);
  const userGems        = computed(() => currentUser.value?.gemsCount ?? 0);
  const teacherAppStatus= computed(() => currentUser.value?.teacherAppStatus ?? 'None');

  const recoveryCountdown = ref<number | null>(null);
  let heartTimer: ReturnType<typeof setInterval> | null = null;

  
  function _scheduleRefresh(expiresInSeconds: number): void {
    if (refreshTimer.value) clearTimeout(refreshTimer.value);
    const delay = Math.max(0, (expiresInSeconds - 120) * 1000);
    refreshTimer.value = setTimeout(async () => {
      const saved = getSavedRefreshToken();
      if (!saved) return;
      try { setSession(await authApi.refreshAccessToken(saved), accessToken, currentUser, _scheduleRefresh); }
      catch { clearSession(accessToken, currentUser, refreshTimer); }
    }, delay);
  }

  

  
  async function init(): Promise<void> {
    const savedUserId = localStorage.getItem('vdsa_stateless_user_id');
    if (savedUserId) {
      await statelessInit();
      await loadStatelessProfile();
      await syncGamificationProfile();
      return;
    }
    const saved = getSavedRefreshToken();
    if (!saved) return;
    try { setSession(await authApi.refreshAccessToken(saved), accessToken, currentUser, _scheduleRefresh); }
    catch { clearSession(accessToken, currentUser, refreshTimer); }
    await syncGamificationProfile();
  }

  async function register(email: string, username: string, password: string): Promise<void> {
    isLoading.value = true; authError.value = null;
    try { setSession(await authApi.register({ email, username, password }), accessToken, currentUser, _scheduleRefresh); }
    catch (err) { authError.value = err instanceof Error ? err.message : 'Đăng ký thất bại.'; throw err; }
    finally { isLoading.value = false; }
    await syncGamificationProfile();
  }

  async function logIn(email: string, password: string): Promise<void> {
    isLoading.value = true; authError.value = null;
    try { setSession(await authApi.login({ email, password }), accessToken, currentUser, _scheduleRefresh); }
    catch (err) { authError.value = err instanceof Error ? err.message : 'Đăng nhập thất bại.'; throw err; }
    finally { isLoading.value = false; }
    await syncGamificationProfile();
  }

  async function logOut(): Promise<void> {
    const savedRefresh = getSavedRefreshToken();
    if (accessToken.value && savedRefresh) await authApi.logout(accessToken.value, savedRefresh);
    clearSession(accessToken, currentUser, refreshTimer);
    stopHeartTimer();
  }

  function startHeartTimer(seconds: number) {
    stopHeartTimer();
    recoveryCountdown.value = seconds;
    if (seconds <= 0) return;
    
    heartTimer = setInterval(() => {
      if (recoveryCountdown.value && recoveryCountdown.value > 0) {
        recoveryCountdown.value--;
      } else {
        stopHeartTimer();
        // Optionally fetch new user state to reflect the recovered heart
      }
    }, 1000);
  }

  function stopHeartTimer() {
    if (heartTimer) {
      clearInterval(heartTimer);
      heartTimer = null;
    }
    recoveryCountdown.value = null;
  }

  
  function getAccessToken(): string | null { return accessToken.value; }

  let refreshPromise: Promise<string | null> | null = null;

  async function refreshAccessToken(): Promise<string | null> {
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      const savedRefresh = getSavedRefreshToken();
      const savedUserId = localStorage.getItem('vdsa_stateless_user_id');

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
        
        if (savedUserId || isStatelessMode.value) {
          localStorage.removeItem('vdsa_refresh_token');
          localStorage.removeItem('vdsa_access_expires');
          localStorage.removeItem('vdsa_stateless_user_id');
          accessToken.value = null;
          currentUser.value = null;
          statelessUser.value = null;
          isStatelessMode.value = false;
        } else {
          clearSession(accessToken, currentUser, refreshTimer);
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
      hearts: response.user.hearts,
      maxHearts: response.user.maxHearts,
      gemsCount: response.user.gemsCount,
      teacherAppStatus: response.user.teacherAppStatus,
    };
    localStorage.setItem('vdsa_refresh_token', response.refreshToken);
    localStorage.setItem('vdsa_access_expires', String(Date.now() + response.expiresIn * 1000));
    localStorage.setItem('vdsa_stateless_user_id', response.user.id);
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
    await syncGamificationProfile();
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
    await syncGamificationProfile();
  }

  async function statelessLogout(): Promise<void> {
    const savedRefresh = getSavedRefreshToken();
    if (savedRefresh) await statelessAuthApi.logout(savedRefresh);
    accessToken.value = null;
    currentUser.value = null;
    statelessUser.value = null;
    isStatelessMode.value = false;
    localStorage.removeItem('vdsa_refresh_token');
    localStorage.removeItem('vdsa_access_expires');
    localStorage.removeItem('vdsa_stateless_user_id');
  }

  async function statelessInit(): Promise<void> {
    const savedRefresh = getSavedRefreshToken();
    const savedUserId = localStorage.getItem('vdsa_stateless_user_id');
    if (!savedRefresh || !savedUserId) return;

    try {
      const response = await statelessAuthApi.refresh(savedRefresh, savedUserId);
      _applyStatelessAuth(response);
    } catch {
      
      localStorage.removeItem('vdsa_refresh_token');
      localStorage.removeItem('vdsa_access_expires');
      localStorage.removeItem('vdsa_stateless_user_id');
    }
    await syncGamificationProfile();
  }

  async function loadStatelessProfile(): Promise<void> {
    const userId = statelessUser.value?.id ?? localStorage.getItem('vdsa_stateless_user_id');
    if (!userId) return;
    try {
      statelessUser.value = await statelessAuthApi.getMe(userId);
      if (currentUser.value) {
        currentUser.value.totalXP = statelessUser.value.totalXP;
        currentUser.value.currentLevel = statelessUser.value.currentLevel;
        currentUser.value.streakDays = statelessUser.value.streakDays;
        currentUser.value.nickname = statelessUser.value.nickname;
        currentUser.value.bio = statelessUser.value.bio;
        currentUser.value.university = statelessUser.value.university;
      }
    } catch { /* silent — profile load is optional */ }
    await syncGamificationProfile();
  }
  async function updateProfile(username: string, nickname?: string, bio?: string, university?: string): Promise<void> {
    const userId = currentUser.value?.id;
    if (!userId) return;
    isLoading.value = true; authError.value = null;
    try {
      const updatedUser = await statelessAuthApi.updateProfile(userId, username, nickname, bio, university);
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
    const userId = currentUser.value?.id;
    if (!userId) throw new Error('Yêu cầu đăng nhập để đổi mật khẩu.');
    isLoading.value = true; authError.value = null;
    try {
      await statelessAuthApi.changePassword(userId, currentPassword, newPassword);
    } catch (err: unknown) {
      authError.value = err instanceof Error ? err.message : 'Đổi mật khẩu thất bại.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // ── Gamification Sync ──────────────────────────────────────────

  async function syncGamificationProfile(): Promise<void> {
    const gamificationStore = useGamificationStore();
    try {
      await gamificationStore.syncProgressFromServer();
    } catch {
      // Gamification sync is non-critical for auth flow
    }
  }

  const impersonateTrigger = ref(0);
  const isImpersonating = computed(() => {
    const _ = impersonateTrigger.value;
    return localStorage.getItem('vdsa_admin_access_token') !== null;
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
    const currentRefreshToken = localStorage.getItem('vdsa_refresh_token');
    const currentUserId = localStorage.getItem('vdsa_stateless_user_id');
    const currentUserData = JSON.stringify(currentUser.value);

    if (currentAccessToken) localStorage.setItem('vdsa_admin_access_token', currentAccessToken);
    if (currentRefreshToken) localStorage.setItem('vdsa_admin_refresh_token', currentRefreshToken);
    if (currentUserId) localStorage.setItem('vdsa_admin_user_id', currentUserId);
    if (currentUserData) localStorage.setItem('vdsa_admin_user_data', currentUserData);

    
    _applyStatelessAuth(response);
    impersonateTrigger.value++;
  }

  function stopImpersonating(): void {
    const adminAccessToken = localStorage.getItem('vdsa_admin_access_token');
    const adminRefreshToken = localStorage.getItem('vdsa_admin_refresh_token');
    const adminUserId = localStorage.getItem('vdsa_admin_user_id');
    const adminUserDataStr = localStorage.getItem('vdsa_admin_user_data');

    if (!adminAccessToken || !adminRefreshToken || !adminUserId || !adminUserDataStr) {
      return;
    }

    
    accessToken.value = adminAccessToken;
    localStorage.setItem('vdsa_refresh_token', adminRefreshToken);
    localStorage.setItem('vdsa_stateless_user_id', adminUserId);
    
    try {
      const adminUser = JSON.parse(adminUserDataStr);
      currentUser.value = adminUser;
      statelessUser.value = adminUser;
    } catch {
      
    }

    
    localStorage.removeItem('vdsa_admin_access_token');
    localStorage.removeItem('vdsa_admin_refresh_token');
    localStorage.removeItem('vdsa_admin_user_id');
    localStorage.removeItem('vdsa_admin_user_data');

    isStatelessMode.value = true;
    impersonateTrigger.value++;
  }

  return {
    accessToken, currentUser, isLoading, authError,
    isAuthenticated, userName, userLevel, userXP, isPremium, userRole, isTeacher, isAdmin,
    userHearts, userMaxHearts, userGems, teacherAppStatus,
    init, register, logIn, logOut, getAccessToken,     refreshAccessToken, syncGamificationProfile,
    // Stateless backend
    statelessUser,
    isStatelessMode,
    statelessLogin,
    statelessRegister,
    statelessLogout,
    statelessInit,
    loadStatelessProfile,
    updateProfile,
    changePassword,
    recoveryCountdown,
    startHeartTimer,
    stopHeartTimer,
    // Impersonation
    isImpersonating,
    impersonate,
    startImpersonating,
    stopImpersonating
  };
});

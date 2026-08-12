<template>
  





  <div class="app-shell" :class="{ 'is-embed': isMinimalMode }">
    
    <AppHeader
      v-if="!isMinimalMode"
      @logout="handleLogout"
      @openLogin="handleOpenLogin"
    />

    
    <div class="app-body" style="position: relative; z-index: 1;">
      

      
      <main class="app-main" :class="{ 'app-main--full': isLandingPage }">
        <RouterView v-slot="{ Component }">
          <Transition name="page-fade">
            <component
              v-if="Component"
              :is="Component"
              :key="$route.fullPath"
              class="app-view"
              @openLogin="handleOpenLogin"
            />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>

  
  <div v-if="authStore.isImpersonating" class="impersonate-banner">
    <div class="impersonate-banner__pulse"></div>
    <div class="impersonate-banner__text">
      <span class="impersonate-banner__icon"><BaseIcon name="masks" class="w-4 h-4" /></span>
      <span>Đang đóng vai: <strong>{{ authStore.userName }}</strong></span>
    </div>
    <button class="impersonate-banner__btn" @click="handleStopImpersonating">
      Thoát đóng vai
    </button>
  </div>

  
  <div v-if="progressStore.isSyncError" class="sync-error-banner">
    <div class="sync-error-banner__pulse"></div>
    <div class="sync-error-banner__text">
      <span class="sync-error-banner__icon"><BaseIcon name="warning" class="w-4 h-4" /></span>
      <span>Đồng bộ tiến trình thất bại.</span>
    </div>
    <button class="sync-error-banner__btn" :disabled="isSyncingProgress" @click="handleRetrySync">
      {{ isSyncingProgress ? 'Đang thử...' : 'Thử lại' }}
    </button>
  </div>

  
  <LoginModal :visible="showLoginModal" @close="showLoginModal = false" />

  
  <ToastContainer />

  
  <GuidedTourOverlay />

</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from './features/auth/store/useAuthStore';
import { useGuidedTourStore } from './features/guided-tour/store/useGuidedTourStore';
import { useUserProgressStore } from './features/user-progress/store/useUserProgressStore';
import AppHeader from './components/AppHeader.vue';
import LoginModal from './features/auth/components/LoginModal.vue';
import ToastContainer from './components/ToastContainer.vue';
import GuidedTourOverlay from './features/guided-tour/components/GuidedTourOverlay.vue';
import { useThemeStore } from './shared/store/useThemeStore';
import { useToastStore } from './composables/useToast';

const authStore      = useAuthStore();
const tourStore      = useGuidedTourStore();
const progressStore  = useUserProgressStore();
const themeStore     = useThemeStore();
const toastStore     = useToastStore();
const route          = useRoute();
const router         = useRouter();
const showLoginModal = ref(false);
const isSyncingProgress = ref(false);

const isLandingPage = computed(() => route.name === 'landing');
const isMinimalMode = computed(() => route.path === '/embed' && route.query.algo !== undefined);

async function handleRetrySync(): Promise<void> {
  isSyncingProgress.value = true;
  try {
    await progressStore.loadProgress();
  } finally {
    isSyncingProgress.value = false;
  }
}

async function handleLogout(): Promise<void> {
  if (authStore.isStatelessMode) {
    await authStore.statelessLogout();
  } else {
    await authStore.logOut();
  }
  router.push('/');
}

function handleOpenLogin(): void {
  showLoginModal.value = true;
}

function handleStopImpersonating(): void {
  authStore.stopImpersonating();
  toastStore.success('Đã thoát chế độ đóng vai. Khôi phục tài khoản Admin.', 'Thoát đóng vai');
  router.push('/admin');
}

onMounted(() => {
  themeStore.initTheme();
  // AU-005: KHÔNG gọi statelessInit() ở đây nữa — main.ts đã restore qua authStore.init()
  // (dedupe qua refreshPromise); gọi lần 2 gây 2 refresh song song cùng token → mất phiên.
  tourStore.initTour();
});
</script>

<style>
@import "./App.css";
</style>

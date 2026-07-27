<template>
  <!--
    App Shell — VisualizationDSA
    Phong cách: Terminal / Code Editor aesthetic
    Font: JetBrains Mono (logo/code), Inter (nav/UI)
    Theme: data-theme attribute được set trên <html> trong index.html
  -->
  <div class="app-shell" :class="{ 'is-embed': isMinimalMode }">
    <!-- ══════════════ HEADER ══════════════ -->
    <AppHeader
      v-if="!isMinimalMode"
      @logout="handleLogout"
      @openLogin="handleOpenLogin"
    />

    <!-- ══════════════ BODY ══════════════ -->
    <div class="app-body">
      <!-- LEFT SIDEBAR (REMOVED) -->

      <!-- MAIN CONTENT AREA -->
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

  <!-- Impersonation Banner (Phase C) -->
  <div v-if="authStore.isImpersonating" class="impersonate-banner">
    <div class="impersonate-banner__pulse"></div>
    <div class="impersonate-banner__text">
      <span class="impersonate-banner__icon">🎭</span>
      <span>Đang đóng vai: <strong>{{ authStore.userName }}</strong></span>
    </div>
    <button class="impersonate-banner__btn" @click="handleStopImpersonating">
      Thoát đóng vai
    </button>
  </div>

  <!-- Sync Error Banner -->
  <div v-if="progressStore.isSyncError" class="sync-error-banner">
    <div class="sync-error-banner__pulse"></div>
    <div class="sync-error-banner__text">
      <span class="sync-error-banner__icon">⚠️</span>
      <span>Đồng bộ tiến trình thất bại.</span>
    </div>
    <button class="sync-error-banner__btn" :disabled="isSyncingProgress" @click="handleRetrySync">
      {{ isSyncingProgress ? 'Đang thử...' : 'Thử lại' }}
    </button>
  </div>

  <!-- Login Modal -->
  <LoginModal :visible="showLoginModal" @close="showLoginModal = false" />

  <!-- Global Toast Notifications -->
  <ToastContainer />

  <!-- Interactive Guided Tour Overlay -->
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

const authStore      = useAuthStore();
const tourStore      = useGuidedTourStore();
const progressStore  = useUserProgressStore();
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
  alert('Đã thoát chế độ đóng vai. Khôi phục tài khoản Admin.');
  router.push('/admin');
}

onMounted(() => {
  authStore.statelessInit();
  tourStore.initTour();
});
</script>

<style>
@import "./App.css";
</style>

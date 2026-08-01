import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'
import router from './router'
import './style.css'
import App from './App.vue'
import { useAuthStore } from './features/auth/store/useAuthStore'
import { useUserProgressStore } from './features/gamification/user-progress/store/useUserProgressStore'

import BaseIcon from './shared/components/BaseIcon.vue'

const app  = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(MotionPlugin)
app.component('BaseIcon', BaseIcon)

// ── Global fetch interceptor to handle Bearer token injection and auto-refresh ──
const originalFetch = window.fetch;
window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const authStore = useAuthStore();
  const url = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input.url);

  // Check if it is a VisualizationDSA API request
  const isApiRequest = url.includes('/api/v1/') || url.includes('/api/v1/concepts/');
  const isRefreshRequest = url.includes('/auth/refresh') || url.includes('/concepts/auth/refresh');

  let headers = new Headers(init?.headers);

  // Inject Bearer token if available
  if (isApiRequest && !isRefreshRequest) {
    const token = authStore.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // Clone the request config with the new headers
  const newInit = {
    ...init,
    headers,
  };

  let response = await originalFetch(input, newInit);

  // Handle 401 Unauthorized for API requests by refreshing the token and retrying
  // NOTE: Do NOT attempt refresh on 403 Forbidden — that is a PERMISSION error, not an auth error.
  // Treating 403 as 401 would incorrectly clear the auth state when Admin visits Teacher-only endpoints.
  if (response.status === 401 && isApiRequest && !isRefreshRequest) {
    console.warn(`[Fetch Interceptor] 401 Unauthorized detected for ${url}. Attempting token refresh...`);
    try {
      const newToken = await authStore.refreshAccessToken();
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
        console.log(`[Fetch Interceptor] Token refreshed successfully. Retrying ${url}...`);
        response = await originalFetch(input, {
          ...init,
          headers,
        });
      }
    } catch (refreshErr) {
      console.error('[Fetch Interceptor] Token refresh failed:', refreshErr);
    }
  } else if (response.status === 403 && isApiRequest) {
    console.warn(`[Fetch Interceptor] 403 Forbidden for ${url} — permission denied, NOT clearing auth state.`);
  }

  return response;
};

// ── Khởi động auth & progress TRƯỚC khi mount ──────────────────────────────
// Thứ tự quan trọng: auth trước → progress sau (progress cần access token)
const authStore     = useAuthStore()
const progressStore = useUserProgressStore()

authStore.init().then(() => {
  return progressStore.initFromServer()
}).finally(() => {
  app.use(router)
  router.isReady().then(() => {
    app.mount('#app')
  })
})

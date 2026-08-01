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


const originalFetch = window.fetch;
window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const authStore = useAuthStore();
  const url = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input.url);

  
  const isApiRequest = url.includes('/api/v1/') || url.includes('/api/v1/concepts/');
  const isRefreshRequest = url.includes('/auth/refresh') || url.includes('/concepts/auth/refresh');

  let headers = new Headers(init?.headers);

  
  if (isApiRequest && !isRefreshRequest) {
    const token = authStore.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  
  const newInit = {
    ...init,
    headers,
  };

  let response = await originalFetch(input, newInit);

  
  
  
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

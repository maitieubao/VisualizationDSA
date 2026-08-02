<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- Left Panel: Visual/Artwork -->
      <div class="auth-left">
        <div class="auth-visual-content">
          <div class="brand-badge" data-aos="fade-down" data-aos-delay="100">
            <BaseIcon name="gamification" />
            <span>Nền tảng VisualizationDSA</span>
          </div>
          <h1 class="auth-heading font-display" data-aos="fade-right" data-aos-delay="200">Học thuật toán <br/><span class="text-gradient">không còn nhàm chán</span></h1>
          <p class="auth-subtext text-secondary" data-aos="fade-right" data-aos-delay="300">Hệ thống mô phỏng, chấm bài tự động và theo dõi lộ trình học tập hàng đầu.</p>
          
          <div class="auth-features" data-aos="fade-up" data-aos-delay="400">
            <div class="feature-item">
              <BaseIcon name="sorting" class="text-accent-cyan" />
              <span>Hàng chục thuật toán được trực quan hoá 3D</span>
            </div>
            <div class="feature-item">
              <BaseIcon name="solid" class="text-accent-green" />
              <span>Sân chơi đồ thị (Graph Sandbox) & Codelab tự động</span>
            </div>
            <div class="feature-item">
              <BaseIcon name="patterns" class="text-accent-purple" />
              <span>Hệ thống Gamification: Tích điểm, nâng rank</span>
            </div>
          </div>
        </div>
        
        <!-- Decorative background elements -->
        <div class="bg-glow"></div>
        <div class="bg-glow bg-glow-2"></div>
      </div>

      <!-- Right Panel: Form -->
      <div class="auth-right">
        <div class="auth-form-wrapper" data-aos="fade-left" data-aos-delay="200">
          <div class="auth-header">
            <h2 class="font-display text-2xl mb-2">{{ isRegisterMode ? 'Tạo tài khoản mới' : 'Chào mừng trở lại' }}</h2>
            <p class="text-muted text-sm">{{ isRegisterMode ? 'Vui lòng điền thông tin để bắt đầu hành trình của bạn.' : 'Vui lòng đăng nhập để tiếp tục.' }}</p>
          </div>

          <div v-if="authStore.authError" class="auth-error-banner mb-4">
            <BaseIcon name="warning" class="w-4 h-4 shrink-0" />
            <span>{{ authStore.authError }}</span>
          </div>

          <form @submit.prevent="handleSubmit" class="auth-form">
            <div class="form-group">
              <label class="form-label" for="auth-email">Địa chỉ Email</label>
              <input id="auth-email" v-model="email" type="email" required autocomplete="email"
                class="form-input" placeholder="name@example.com" />
            </div>

            <div v-if="isRegisterMode" class="form-group slide-down">
              <label class="form-label" for="auth-username">Tên hiển thị</label>
              <input id="auth-username" v-model="username" type="text" required minlength="3" maxlength="100"
                class="form-input" placeholder="Tên hiển thị của bạn" />
            </div>

            <div class="form-group">
              <div class="flex justify-between items-center">
                <label class="form-label" for="auth-password">Mật khẩu</label>
                <a v-if="!isRegisterMode" href="#" class="text-xs text-accent-primary hover:underline">Quên mật khẩu?</a>
              </div>
              <input id="auth-password" v-model="password" type="password" required minlength="8"
                class="form-input" placeholder="••••••••" />
            </div>

            <button type="submit" :disabled="authStore.isLoading" class="btn-primary w-full py-3 mt-4 flex justify-center items-center gap-2">
              <span v-if="authStore.isLoading" class="spinner"><BaseIcon name="solid" /></span>
              <span>{{ isRegisterMode ? 'Tạo tài khoản' : 'Đăng nhập' }}</span>
            </button>
          </form>

          <div class="auth-divider">
            <span>hoặc</span>
          </div>

          <button class="btn-google w-full" @click="handleGoogleLogin">
            <svg class="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Tiếp tục với Google
          </button>

          <p class="auth-footer-text mt-8 text-center text-sm text-secondary">
            {{ isRegisterMode ? 'Đã có tài khoản?' : 'Chưa có tài khoản?' }}
            <RouterLink :to="isRegisterMode ? '/login' : '/register'" class="text-accent-primary font-medium hover:underline">
              {{ isRegisterMode ? 'Đăng nhập ngay' : 'Tạo tài khoản' }}
            </RouterLink>
          </p>

          <div class="demo-info text-center mt-6 p-4 border border-border-default rounded-lg bg-bg-elevated/50">
            <span class="text-xs text-muted block mb-1">Tài khoản Demo (dùng thử)</span>
            <code class="text-xs font-mono text-accent-primary-text bg-accent-primary-dim px-2 py-1 rounded">demo@visualizationdsa.dev</code>
            <span class="text-muted mx-1">/</span>
            <code class="text-xs font-mono text-accent-primary-text bg-accent-primary-dim px-2 py-1 rounded">Demo@2024</code>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const username = ref('');
const password = ref('');

// Xử lý mode dựa trên URL (/login hay /register)
const isRegisterMode = computed(() => route.path === '/register');

// Reset error khi đổi trang
watch(isRegisterMode, () => {
  authStore.authError = null;
  password.value = '';
});

async function handleSubmit(): Promise<void> {
  try {
    if (isRegisterMode.value) {
      await authStore.register(email.value, username.value, password.value);
    } else {
      await authStore.logIn(email.value, password.value);
    }
    // Nếu login thành công, chuyển hướng về Dashboard
    router.push('/dashboard');
  } catch {
    // Error đã được lưu trong authStore.authError
  }
}

function handleGoogleLogin() {
  alert('Đang tích hợp Backend API cho Google OAuth. Vui lòng đăng nhập bằng Email tạm thời.');
}

// Nếu đã đăng nhập rồi thì redirect về dashboard
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard');
  }
});
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-base);
  padding: 1rem;
}

.auth-container {
  display: flex;
  width: 100%;
  max-width: 1100px;
  min-height: 650px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-2xl);
}

.auth-left {
  flex: 1;
  display: none;
  background: var(--color-bg-elevated);
  padding: 4rem;
  position: relative;
  border-right: 1px solid var(--color-border-default);
  overflow: hidden;
}

@media (min-width: 900px) {
  .auth-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}

.auth-visual-content {
  position: relative;
  z-index: 10;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--color-bg-active);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 2rem;
  border: 1px solid var(--color-border-strong);
}

.auth-heading {
  font-size: 2.5rem;
  line-height: 1.2;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
}

.auth-subtext {
  font-size: 1.125rem;
  margin-bottom: 3rem;
  max-width: 80%;
}

.auth-features {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1rem;
  color: var(--color-text-secondary);
  background: var(--color-bg-base);
  padding: 1rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-default);
}

.bg-glow {
  position: absolute;
  top: -10%;
  left: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, var(--color-accent-primary-dim) 0%, transparent 70%);
  filter: blur(80px);
  z-index: 0;
  opacity: 0.5;
}

.bg-glow-2 {
  top: auto;
  bottom: -10%;
  left: auto;
  right: -10%;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
}

.auth-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--color-bg-surface);
}

.auth-form-wrapper {
  width: 100%;
  max-width: 400px;
}

.auth-header {
  margin-bottom: 2rem;
}

.auth-error-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-lg);
  color: #ef4444;
  font-size: 0.875rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  color: var(--color-text-primary);
  outline: none;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 3px rgba(66, 85, 255, 0.15);
}

.auth-divider {
  display: flex;
  align-items: center;
  margin: 2rem 0;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.auth-divider::before,
.auth-divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid var(--color-border-default);
}

.auth-divider span {
  padding: 0 1rem;
}

.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border-strong);
  color: var(--color-text-primary);
  border-radius: var(--radius-lg);
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-google:hover {
  background: var(--color-bg-elevated);
  border-color: var(--color-text-secondary);
}

.google-icon {
  width: 20px;
  height: 20px;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

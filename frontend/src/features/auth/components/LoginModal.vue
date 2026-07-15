<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-backdrop" @click.self="$emit('close')">
        <div class="modal-card">
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">{{ isRegisterMode ? 'Đăng ký tài khoản' : 'Đăng nhập' }}</h2>
            <button class="modal-close" @click="$emit('close')" aria-label="Đóng">&times;</button>
          </div>

          <!-- Error -->
          <div v-if="authStore.authError" class="modal-error">
            {{ authStore.authError }}
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="modal-form">
            <div class="form-group">
              <label class="form-label" for="auth-email">Email</label>
              <input id="auth-email" v-model="email" type="email" required autocomplete="email"
                class="form-input" placeholder="demo@visualizationdsa.dev" />
            </div>

            <div v-if="isRegisterMode" class="form-group">
              <label class="form-label" for="auth-username">Username</label>
              <input id="auth-username" v-model="username" type="text" required minlength="3" maxlength="100"
                class="form-input" placeholder="Tên hiển thị" />
            </div>

            <div class="form-group">
              <label class="form-label" for="auth-password">Mật khẩu</label>
              <input id="auth-password" v-model="password" type="password" required minlength="8"
                class="form-input" placeholder="Tối thiểu 8 ký tự" />
            </div>

            <button type="submit" :disabled="authStore.isLoading" class="form-submit">
              <span v-if="authStore.isLoading">Đang xử lý...</span>
              <span v-else>{{ isRegisterMode ? 'Đăng ký' : 'Đăng nhập' }}</span>
            </button>
          </form>

          <!-- Toggle mode -->
          <div class="modal-footer">
            <button class="toggle-link" @click="toggleMode">
              {{ isRegisterMode ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký' }}
            </button>
          </div>

          <!-- Demo credentials -->
          <div class="demo-info">
            <span class="demo-label">Demo:</span>
            <code class="demo-code">demo@visualizationdsa.dev</code> / <code class="demo-code">Demo@2024</code>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../store/useAuthStore';

defineProps<{ visible: boolean }>();
const emit = defineEmits<{ close: [] }>();

const authStore = useAuthStore();

const email = ref('');
const username = ref('');
const password = ref('');
const isRegisterMode = ref(false);

function toggleMode(): void {
  isRegisterMode.value = !isRegisterMode.value;
  authStore.authError = null;
}

async function handleSubmit(): Promise<void> {
  try {
    if (isRegisterMode.value) {
      await authStore.statelessRegister(email.value, username.value, password.value);
    } else {
      await authStore.statelessLogin(email.value, password.value);
    }
    emit('close');
  } catch {
    // Error is already set in authStore.authError
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-card {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(24px) saturate(1.5);
  -webkit-backdrop-filter: blur(24px) saturate(1.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  padding: 24px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5),
              0 0 40px rgba(6, 182, 212, 0.06),
              inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary, #fff);
}

.modal-close {
  background: none;
  border: none;
  color: var(--color-text-secondary, #888);
  font-size: 24px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}
.modal-close:hover { color: var(--color-text-primary, #fff); }

.modal-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 16px;
  font-size: 12px;
  color: #ef4444;
}

.modal-form { display: flex; flex-direction: column; gap: 16px; }

.form-group { display: flex; flex-direction: column; gap: 4px; }

.form-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary, #aaa);
}

.form-input {
  background: var(--color-bg-surface, #0f0f23);
  border: 1px solid var(--color-border-default, #333);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  color: var(--color-text-primary, #fff);
  outline: none;
  transition: border-color 0.2s;
}
.form-input:focus { border-color: var(--color-accent-primary, #00d9ff); }
.form-input::placeholder { color: var(--color-text-disabled, #555); }

.form-submit {
  background: var(--color-accent-primary, #00d9ff);
  color: #000;
  border: none;
  border-radius: 8px;
  padding: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-top: 4px;
}
.form-submit:hover { opacity: 0.9; }
.form-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.modal-footer {
  text-align: center;
  margin-top: 16px;
}

.toggle-link {
  background: none;
  border: none;
  color: var(--color-accent-primary, #00d9ff);
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
}

.demo-info {
  text-align: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border-default, #333);
}

.demo-label {
  font-size: 10px;
  color: var(--color-text-muted, #666);
  margin-right: 4px;
}

.demo-code {
  font-size: 11px;
  font-family: var(--font-mono, monospace);
  color: var(--color-accent-primary, #00d9ff);
  background: rgba(0, 217, 255, 0.1);
  padding: 1px 4px;
  border-radius: 4px;
}

/* Transition */
.modal-fade-enter-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.modal-fade-enter-from {
  opacity: 0;
  transform: scale(0.92) translateY(10px);
}
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(-5px);
}
</style>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-backdrop" @click.self="$emit('close')">
        <div class="modal-card">
          
          <div class="modal-header">
            <h2 class="modal-title">{{ isRegisterMode ? 'Đăng ký tài khoản' : 'Đăng nhập' }}</h2>
            <button class="modal-close" @click="$emit('close')" aria-label="Đóng">&times;</button>
          </div>

          
          <div v-if="authStore.authError" class="modal-error">
            {{ authStore.authError }}
          </div>

          
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

          
          <div class="modal-footer">
            <button class="toggle-link" @click="toggleMode">
              {{ isRegisterMode ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký' }}
            </button>
          </div>

          
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
    
  }
}
</script>

<style scoped>
@import "./LoginModal.css";
</style>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-backdrop" @click.self="handleBackdropClick">
        <div ref="modalCardEl" class="modal-card" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">

          <div class="modal-header">
            <h2 id="auth-modal-title" class="modal-title">{{ isRegisterMode ? 'Đăng ký tài khoản' : 'Đăng nhập' }}</h2>
            <button class="modal-close" @click="closeModal" aria-label="Đóng"><BaseIcon name="close" class="w-4 h-4" /></button>
          </div>

          <!-- AU-047: authError được clear khi mở modal (watch visible) -->
          <div v-if="authStore.authError" class="modal-error" role="alert">
            {{ authStore.authError }}
          </div>

          <form @submit.prevent="handleSubmit" class="modal-form">
            <div class="form-group">
              <label class="form-label" for="auth-email">Email</label>
              <input id="auth-email" ref="emailInputEl" v-model="email" type="email" required autocomplete="email"
                class="form-input" placeholder="demo@visualizationdsa.dev" />
            </div>

            <div v-if="isRegisterMode" class="form-group">
              <label class="form-label" for="auth-username">Username</label>
              <input id="auth-username" v-model="username" type="text" required minlength="3" maxlength="100"
                class="form-input" placeholder="Tên hiển thị" autocomplete="username" />
            </div>

            <!-- AU-048: login → current-password, register → new-password -->
            <div class="form-group">
              <label class="form-label" for="auth-password">Mật khẩu</label>
              <input id="auth-password" v-model="password" type="password" required minlength="8"
                class="form-input" placeholder="Tối thiểu 8 ký tự"
                :autocomplete="isRegisterMode ? 'new-password' : 'current-password'" />
            </div>

            <!-- AU-018: ô xác nhận mật khẩu chỉ hiện ở chế độ đăng ký + so khớp client-side -->
            <div v-if="isRegisterMode" class="form-group">
              <label class="form-label" for="auth-confirm-password">Xác nhận mật khẩu</label>
              <input id="auth-confirm-password" ref="confirmInputEl" v-model="confirmPassword" type="password" required
                class="form-input" placeholder="Nhập lại mật khẩu" autocomplete="new-password"
                :class="{ 'form-input--error': confirmError }" @input="clearConfirmError" />
              <p v-if="confirmError" class="form-field-error" role="alert">{{ confirmError }}</p>
            </div>

            <!-- F3 (FR-1.8): đăng ký giảng viên → chờ Admin duyệt. -->
            <label v-if="isRegisterMode" class="form-checkbox" for="auth-is-teacher">
              <input id="auth-is-teacher" v-model="isTeacher" type="checkbox" class="form-checkbox__input" />
              <span class="form-checkbox__label">Tôi là giảng viên (tài khoản sẽ chờ quản trị viên phê duyệt)</span>
            </label>

            <button type="submit" :disabled="isSubmitting" class="form-submit">
              <span v-if="isSubmitting">Đang xử lý...</span>
              <span v-else>{{ isRegisterMode ? 'Đăng ký' : 'Đăng nhập' }}</span>
            </button>
          </form>

          <div class="modal-footer">
            <button class="toggle-link" @click="toggleMode">
              {{ isRegisterMode ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký' }}
            </button>
          </div>

          <!-- AU-049: demo credentials chỉ hiển thị ở chế độ đăng nhập -->
          <div v-if="!isRegisterMode" class="demo-info">
            <span class="demo-label">Demo:</span>
            <code class="demo-code">{{ DEMO_CREDENTIALS.email }}</code> / <code class="demo-code">{{ DEMO_CREDENTIALS.password }}</code>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue';
import { useAuthStore } from '../store/useAuthStore';

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{ close: [] }>();

const authStore = useAuthStore();

// AU-049: credentials demo khớp với backend seeder (StatelessAuthStrategy).
const DEMO_CREDENTIALS = { email: 'demo@visualizationdsa.dev', password: 'Demo@2024' };

const email = ref('');
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const isRegisterMode = ref(false);
const isTeacher = ref(false);
const confirmError = ref<string | null>(null);

const emailInputEl = ref<HTMLInputElement | null>(null);
const confirmInputEl = ref<HTMLInputElement | null>(null);
const modalCardEl = ref<HTMLElement | null>(null);

// AU-019: lưu phần tử được focus trước khi mở modal để restore khi đóng.
let lastFocusedElement: HTMLElement | null = null;

// Loading theo action riêng (AU-050): dùng đúng cờ của action đang chạy.
const isSubmitting = computed(() =>
  isRegisterMode.value ? authStore.registerLoading : authStore.loginLoading
);

function isFormEmpty(): boolean {
  return !email.value && !username.value && !password.value && !confirmPassword.value;
}

function clearConfirmError(): void {
  confirmError.value = null;
}

function resetForm(): void {
  // AU-046: reset form sau submit thành công và khi modal đóng.
  email.value = '';
  username.value = '';
  password.value = '';
  confirmPassword.value = '';
  confirmError.value = null;
  isTeacher.value = false;
}

function closeModal(): void {
  emit('close');
}

function toggleMode(): void {
  isRegisterMode.value = !isRegisterMode.value;
  // AU-043: clear qua action, không gán trực tiếp.
  authStore.clearError();
  confirmError.value = null;
}

// AU-051: click backdrop chỉ đóng modal khi form rỗng — không làm mất dữ liệu đang nhập.
function handleBackdropClick(): void {
  if (!isFormEmpty()) {
    emailInputEl.value?.focus();
    return;
  }
  closeModal();
}

// AU-019: focus trap — Tab không lọt ra ngoài modal.
function getFocusableElements(): HTMLElement[] {
  const card = modalCardEl.value;
  if (!card) return [];
  const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  return Array.from(card.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true' && el.offsetParent !== null
  );
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeModal();
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = getFocusableElements();
  if (focusable.length === 0) {
    event.preventDefault();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;
  const inside = modalCardEl.value?.contains(active) ?? false;
  if (event.shiftKey && (active === first || !inside)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (active === last || !inside)) {
    event.preventDefault();
    first.focus();
  }
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      // AU-047: clear lỗi cũ mỗi lần MỞ LẠI modal (chuyển false → true).
      authStore.clearError();
      // AU-019: lưu focus gốc + trap Tab + autofocus email.
      lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      window.addEventListener('keydown', onKeydown);
      nextTick(() => emailInputEl.value?.focus());
    } else {
      window.removeEventListener('keydown', onKeydown);
      // AU-019: restore focus về phần tử gốc khi đóng.
      lastFocusedElement?.focus();
      lastFocusedElement = null;
      // AU-046: reset form khi modal đóng.
      resetForm();
    }
  }
);

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
  lastFocusedElement?.focus();
});

// AU-018: so khớp xác nhận mật khẩu trước khi submit — lệch thì chặn + message.
// (Độ dài mật khẩu do thuộc tính minlength + policy backend 400 xử lý.)
function validateConfirmPassword(): boolean {
  if (isRegisterMode.value && password.value !== confirmPassword.value) {
    confirmError.value = 'Xác nhận mật khẩu không khớp với mật khẩu đã nhập.';
    nextTick(() => confirmInputEl.value?.focus());
    return false;
  }
  confirmError.value = null;
  return true;
}

async function handleSubmit(): Promise<void> {
  if (!validateConfirmPassword()) return;
  try {
    if (isRegisterMode.value) {
      await authStore.statelessRegister(email.value, username.value, password.value, isTeacher.value);
    } else {
      await authStore.statelessLogin(email.value, password.value);
    }
    // AU-046: reset form sau submit thành công.
    resetForm();
    emit('close');
  } catch {
    // Lỗi đã được store ghi vào authError để hiển thị ở modal-error.
  }
}
</script>

<style scoped>
@import "./LoginModal.css";
</style>

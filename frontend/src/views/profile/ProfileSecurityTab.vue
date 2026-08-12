<template>
  <section class="panel-section">
    <div class="panel-header">
      <h2 class="panel-title">Security</h2>
      <p class="panel-subtitle">Thay đổi mật khẩu đăng nhập để đảm bảo an toàn cho tài khoản của bạn.</p>
    </div>

    <form @submit.prevent="handleChangePassword" class="pm-form">
      <div class="pm-setting-item">
        <div class="setting-info">
          <label for="currentPassword" class="setting-label">Mật khẩu hiện tại</label>
          <p class="setting-desc">Mật khẩu bạn đang dùng để đăng nhập hệ thống.</p>
        </div>
        <div class="setting-control">
          <!-- AU-048: autocomplete="current-password" -->
          <input id="currentPassword" ref="currentPasswordEl" v-model="passwordForm.currentPassword" type="password" placeholder="••••••••" class="pm-input" :class="{ 'pm-input--error': fieldErrors.currentPassword }" required autocomplete="current-password" @input="fieldErrors.currentPassword = ''" />
          <!-- AU-024: lỗi "mật khẩu hiện tại sai" hiển thị inline theo field -->
          <p v-if="fieldErrors.currentPassword" class="field-error" role="alert">{{ fieldErrors.currentPassword }}</p>
        </div>
      </div>

      <div class="pm-setting-item">
        <div class="setting-info">
          <label for="newPassword" class="setting-label">Mật khẩu mới</label>
          <p class="setting-desc">Mật khẩu mới phải bao gồm ít nhất 8 ký tự.</p>
        </div>
        <div class="setting-control">
          <!-- AU-048: autocomplete="new-password" · PR-028: lỗi độ dài ≥8 hiển thị INLINE theo field -->
          <input id="newPassword" ref="newPasswordEl" v-model="passwordForm.newPassword" type="password" placeholder="Nhập mật khẩu mới..." class="pm-input" :class="{ 'pm-input--error': fieldErrors.newPassword }" :aria-invalid="fieldErrors.newPassword ? 'true' : 'false'" aria-describedby="newPassword-error" required autocomplete="new-password" @input="fieldErrors.newPassword = ''" />
          <p v-if="fieldErrors.newPassword" id="newPassword-error" class="field-error" role="alert">{{ fieldErrors.newPassword }}</p>
        </div>
      </div>

      <div class="pm-setting-item">
        <div class="setting-info">
          <label for="confirmNewPassword" class="setting-label">Xác nhận mật khẩu mới</label>
          <p class="setting-desc">Nhập lại chính xác mật khẩu mới ở trên.</p>
        </div>
        <div class="setting-control">
          <!-- AU-048: autocomplete="new-password" -->
          <input id="confirmNewPassword" v-model="passwordForm.confirmNewPassword" type="password" placeholder="Xác nhận lại mật khẩu..." class="pm-input" required autocomplete="new-password" />
        </div>
      </div>

      <div class="panel-action-bar">
        <button type="submit" class="pm-btn pm-btn--primary" :disabled="isChangingPassword">
          <span v-if="isChangingPassword">Đang cập nhật...</span>
          <span v-else>Cập nhật mật khẩu</span>
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { useToastStore } from '../../composables/useToast';

const authStore = useAuthStore();
const toastStore = useToastStore();
const isChangingPassword = ref(false);

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
});

// AU-024: lỗi inline theo từng field, không chỉ toast.
const fieldErrors = reactive({
  currentPassword: '',
  newPassword: ''
});

const currentPasswordEl = ref<HTMLInputElement | null>(null);
const newPasswordEl = ref<HTMLInputElement | null>(null);

// AU-021: chuẩn hóa lỗi từ `unknown`, map 401 → thông báo phiên hết hạn.
function getErrorMessage(err: unknown): { message: string; isCurrentPasswordError: boolean } {
  const status = (err as { status?: number } | null)?.status;
  const message = err instanceof Error ? err.message : typeof err === 'string' ? err : '';
  if (status === 401) {
    return { message: 'Phiên đã hết hạn, vui lòng đăng nhập lại', isCurrentPasswordError: false };
  }
  if (status === 403) {
    return { message: 'Bạn không có quyền thực hiện thao tác này', isCurrentPasswordError: false };
  }
  const isCurrentPasswordError = /mật khẩu hiện tại không chính xác|incorrect password/i.test(message);
  return {
    message: message || 'Không thể đổi mật khẩu.',
    isCurrentPasswordError,
  };
}

async function handleChangePassword() {
  // PR-028: lỗi inline theo field thay vì chỉ toast — độ dài ≥8 + khớp xác nhận.
  if (!passwordForm.currentPassword) {
    fieldErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.';
    nextTick(() => currentPasswordEl.value?.focus());
    return;
  }
  if (passwordForm.newPassword.length < 8) {
    fieldErrors.newPassword = 'Mật khẩu mới phải từ 8 ký tự trở lên.';
    nextTick(() => newPasswordEl.value?.focus());
    return;
  }
  if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
    fieldErrors.newPassword = 'Xác nhận mật khẩu mới không khớp.';
    nextTick(() => newPasswordEl.value?.focus());
    return;
  }

  isChangingPassword.value = true;
  fieldErrors.currentPassword = '';
  fieldErrors.newPassword = '';
  try {
    await authStore.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    toastStore.success('Đổi mật khẩu thành công!');
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmNewPassword = '';
  } catch (err: unknown) {
    // AU-024: lỗi "mật khẩu hiện tại sai" → inline theo field + focus vào ô sai.
    const { message, isCurrentPasswordError } = getErrorMessage(err);
    if (isCurrentPasswordError) {
      fieldErrors.currentPassword = 'Mật khẩu hiện tại không chính xác.';
      // Focus vào ô sai sau khi Vue render lại class lỗi (AU-024).
      nextTick(() => currentPasswordEl.value?.focus());
    } else {
      toastStore.error(message);
    }
  } finally {
    isChangingPassword.value = false;
  }
}
</script>

<style scoped>
.field-error {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--color-accent-red, #ef4444);
}

.pm-input--error {
  border-color: var(--color-accent-red, #ef4444);
}
.pm-input--error:focus {
  border-color: var(--color-accent-red, #ef4444);
  box-shadow: 0 0 0 1px var(--color-accent-red, #ef4444);
}
</style>

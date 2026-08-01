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
          <input id="currentPassword" v-model="passwordForm.currentPassword" type="password" placeholder="••••••••" class="pm-input" required />
        </div>
      </div>

      <div class="pm-setting-item">
        <div class="setting-info">
          <label for="newPassword" class="setting-label">Mật khẩu mới</label>
          <p class="setting-desc">Mật khẩu mới phải bao gồm ít nhất 8 ký tự.</p>
        </div>
        <div class="setting-control">
          <input id="newPassword" v-model="passwordForm.newPassword" type="password" placeholder="Nhập mật khẩu mới..." class="pm-input" required />
        </div>
      </div>

      <div class="pm-setting-item">
        <div class="setting-info">
          <label for="confirmNewPassword" class="setting-label">Xác nhận mật khẩu mới</label>
          <p class="setting-desc">Nhập lại chính xác mật khẩu mới ở trên.</p>
        </div>
        <div class="setting-control">
          <input id="confirmNewPassword" v-model="passwordForm.confirmNewPassword" type="password" placeholder="Xác nhận lại mật khẩu..." class="pm-input" required />
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
import { ref, reactive } from 'vue';
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

async function handleChangePassword() {
  if (!passwordForm.currentPassword) { toastStore.error('Vui lòng nhập mật khẩu hiện tại.'); return; }
  if (passwordForm.newPassword.length < 8) { toastStore.error('Mật khẩu mới phải từ 8 ký tự trở lên.'); return; }
  if (passwordForm.newPassword !== passwordForm.confirmNewPassword) { toastStore.error('Xác nhận mật khẩu mới không khớp.'); return; }

  isChangingPassword.value = true;
  try {
    await authStore.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    toastStore.success('Đổi mật khẩu thành công!');
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmNewPassword = '';
  } catch (err: any) {
    toastStore.error(err.message || 'Không thể đổi mật khẩu.');
  } finally {
    isChangingPassword.value = false;
  }
}
</script>

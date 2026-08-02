<template>
  <section class="panel-section">
    <div class="panel-header">
      <h2 class="panel-title">General</h2>
      <p class="panel-subtitle">Quản lý danh tính cá nhân và thông tin hiển thị trên nền tảng VisualizationDSA.</p>
    </div>

    
    <div class="summary-hero-card">
      <div class="summary-avatar" :class="{ 'summary-avatar--pro': authStore.isPremium }">
        {{ initials }}
      </div>
      <div class="summary-info">
        <div class="summary-name-row">
          <h3>{{ currentNickname || authStore.userName }}</h3>
          <span class="role-chip" :class="`role-chip--${authStore.userRole.toLowerCase()}`">
            {{ roleLabel }}
          </span>
        </div>
        <p class="summary-email">{{ authStore.currentUser?.email }}</p>
        <div class="summary-stats-bar">
          <span class="stat-pill">Cấp độ {{ authStore.userLevel }}</span>
          <span class="stat-pill stat-pill--xp">{{ authStore.userXP }} XP</span>
          <span class="stat-pill stat-pill--fire"><BaseIcon name="fire" class="w-3.5 h-3.5 inline-block mr-1 align-text-bottom" />{{ authStore.currentUser?.streakDays || 0 }} ngày streak</span>
        </div>
      </div>
    </div>

    <form @submit.prevent="handleSave" class="pm-form">
      <div class="pm-setting-item">
        <div class="setting-info">
          <label for="username" class="setting-label">Tên người dùng (Username)</label>
          <p class="setting-desc">Mã định danh duy nhất của bạn trên hệ thống.</p>
        </div>
        <div class="setting-control">
          <input id="username" v-model="form.username" type="text" class="pm-input" required />
        </div>
      </div>

      <div class="pm-setting-item">
        <div class="setting-info">
          <label for="nickname" class="setting-label">Biệt danh hiển thị (Display Name)</label>
          <p class="setting-desc">Tên xuất hiện trên Bảng xếp hạng học tập và thảo luận.</p>
        </div>
        <div class="setting-control">
          <input id="nickname" v-model="form.nickname" type="text" placeholder="Nhập biệt danh tùy chỉnh..." class="pm-input" />
        </div>
      </div>

      <div class="pm-setting-item">
        <div class="setting-info">
          <label for="university" class="setting-label">Trường đại học / Học viện</label>
          <p class="setting-desc">Đơn vị đào tạo hoặc cơ quan công tác của bạn.</p>
        </div>
        <div class="setting-control">
          <input id="university" v-model="form.university" type="text" placeholder="Ví dụ: Đại học Bách Khoa, Đại học CNTT..." class="pm-input" />
        </div>
      </div>

      <div class="pm-setting-item pm-setting-item--top">
        <div class="setting-info">
          <label for="bio" class="setting-label">Giới thiệu ngắn (Bio)</label>
          <p class="setting-desc">Mô tả ngắn gọn mục tiêu học tập hoặc đam mê giải thuật.</p>
        </div>
        <div class="setting-control">
          <textarea id="bio" v-model="form.bio" placeholder="Chia sẻ về đam mê lập trình của bạn..." class="pm-input pm-textarea" rows="3"></textarea>
        </div>
      </div>

      <div class="pm-setting-item pm-setting-item--top">
        <div class="setting-info">
          <label class="setting-label">Tùy chỉnh Diện mạo</label>
          <p class="setting-desc">Trang bị Avatar và Khung viền (Frame) từ kho đồ của bạn để làm nổi bật hồ sơ.</p>
        </div>
        <div class="setting-control flex items-start gap-5">
          <div class="relative w-16 h-16 rounded-full border-2 border-dashed border-border-accent/50 flex items-center justify-center bg-bg-secondary/50 text-accent cursor-pointer hover:bg-bg-hover transition-colors" @click="toastStore.info('Tính năng Kho đồ & Avatar sẽ có mặt trong bản cập nhật tới!')">
            <span class="text-2xl font-bold">{{ initials }}</span>
            <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center border-2 border-border-default">
              <svg width="12" height="12" fill="white" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            </div>
          </div>
          <div class="flex flex-col gap-2 pt-1">
            <button type="button" class="px-4 py-1.5 rounded border border-border-accent text-xs font-semibold text-accent hover:bg-accent/10 transition-colors text-left w-fit" @click="toastStore.info('Đang mở Kho đồ...')">
              Tủ đồ (Inventory)
            </button>
            <span class="text-xs text-text-muted">Mua thêm Avatar & Khung viền tại Cửa hàng Gems.</span>
          </div>
        </div>
      </div>

      <div class="pm-setting-item">
        <div class="setting-info">
          <label class="setting-label">Địa chỉ Email</label>
          <p class="setting-desc">Email liên kết cố định để đăng nhập và bảo mật.</p>
        </div>
        <div class="setting-control">
          <input :value="authStore.currentUser?.email" type="email" class="pm-input pm-input--readonly" readonly />
        </div>
      </div>

      <div class="panel-action-bar">
        <button type="submit" class="pm-btn pm-btn--primary" :disabled="isSaving">
          <span v-if="isSaving">Đang lưu...</span>
          <span v-else>Lưu thay đổi</span>
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { useToastStore } from '../../composables/useToast';

const authStore = useAuthStore();
const toastStore = useToastStore();
const isSaving = ref(false);

const form = reactive({
  username: '',
  nickname: '',
  university: '',
  bio: ''
});

watch(() => authStore.currentUser, (user) => {
  if (user) {
    form.username = user.username || '';
    form.nickname = user.nickname || '';
    form.university = user.university || '';
    form.bio = user.bio || '';
  }
}, { immediate: true });

const initials = computed(() => {
  const name = authStore.currentUser?.nickname || authStore.userName;
  if (!name) return 'U';
  return name.charAt(0).toUpperCase();
});

const currentNickname = computed(() => authStore.currentUser?.nickname);

const roleLabel = computed(() => {
  switch (authStore.userRole) {
    case 'Admin': return 'Quản trị viên';
    case 'Teacher': return 'Giảng viên';
    default: return 'Học viên';
  }
});

async function handleSave() {
  if (!form.username.trim()) {
    toastStore.error('Tên người dùng không được để trống.');
    return;
  }
  isSaving.value = true;
  try {
    await authStore.updateProfile(form.username, form.nickname, form.bio, form.university);
    toastStore.success('Cập nhật hồ sơ cá nhân thành công!');
  } catch (err: any) {
    toastStore.error(err.message || 'Không thể cập nhật hồ sơ.');
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <section class="panel-section">
    <div class="panel-header">
      <h2 class="panel-title">General</h2>
      <p class="panel-subtitle">Quản lý danh tính cá nhân và thông tin hiển thị trên nền tảng VisualizationDSA.</p>
    </div>

    <!-- Summary Hero Banner -->
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
          <span class="stat-pill stat-pill--fire">🔥 {{ authStore.currentUser?.streakDays || 0 }} ngày streak</span>
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

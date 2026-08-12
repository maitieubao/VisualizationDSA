<template>
  <section class="panel-section">
    <div class="panel-header">
      <h2 class="panel-title">General</h2>
      <p class="panel-subtitle">Quản lý danh tính cá nhân và thông tin hiển thị trên nền tảng VisualizationDSA.</p>
    </div>

    <div class="summary-hero-card">
      <div class="summary-avatar" :class="{ 'summary-avatar--pro': authStore.isPremium }">
        <img v-if="avatarUrl" :src="avatarUrl" alt="Ảnh đại diện của bạn" class="summary-avatar-img" />
        <template v-else>{{ initials }}</template>
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
          <span class="stat-pill stat-pill--fire"><BaseIcon name="fire" class="w-3.5 h-3.5 inline mr-1 align-middle" />{{ authStore.currentUser?.streakDays || 0 }} ngày streak</span>
        </div>
      </div>
    </div>

    <!-- PR-005: upload avatar — input file ẩn + nút chọn + preview ảnh đã chọn -->
    <div class="pm-setting-item avatar-upload-item">
      <div class="setting-info">
        <label class="setting-label">Ảnh đại diện</label>
        <p class="setting-desc">Ảnh JPG/PNG/WebP, tối đa 5MB. Định dạng tròn hiển thị ở mọi nơi trên hệ thống.</p>
      </div>
      <div class="setting-control avatar-upload-control">
        <button
          type="button"
          class="pm-btn pm-btn--ghost"
          :disabled="isUploadingAvatar"
          @click="avatarInputEl?.click()"
        >
          <BaseIcon name="upload" class="w-3.5 h-3.5 inline mr-1 align-middle" />
          <span>{{ isUploadingAvatar ? 'Đang tải ảnh...' : (avatarUrl ? 'Đổi ảnh đại diện' : 'Chọn ảnh đại diện') }}</span>
        </button>
        <input
          ref="avatarInputEl"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          class="avatar-file-input"
          aria-label="Chọn file ảnh đại diện"
          @change="handleAvatarSelected"
        />
        <p v-if="avatarUrl" class="avatar-preview-note">Đã lưu ảnh đại diện mới — xem trước bên trên.</p>
      </div>
    </div>

    <form @submit.prevent="handleSave" class="pm-form">
      <div class="pm-setting-item">
        <div class="setting-info">
          <label for="username" class="setting-label">Tên người dùng (Username)</label>
          <p class="setting-desc">Mã định danh duy nhất của bạn trên hệ thống.</p>
        </div>
        <div class="setting-control">
          <input
            id="username"
            v-model="form.username"
            type="text"
            class="pm-input"
            :class="{ 'pm-input--error': fieldErrors.username }"
            :aria-invalid="fieldErrors.username ? 'true' : 'false'"
            aria-describedby="username-error"
            required
            @input="fieldErrors.username = ''"
          />
          <!-- PR-017: lỗi username inline theo field + role=alert cho SR -->
          <p v-if="fieldErrors.username" id="username-error" class="field-error" role="alert">{{ fieldErrors.username }}</p>
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
          <!-- PR-029: label gắn for với input readonly -->
          <label for="email" class="setting-label">Địa chỉ Email</label>
          <p class="setting-desc">Email liên kết cố định để đăng nhập và bảo mật.</p>
        </div>
        <div class="setting-control">
          <input id="email" :value="authStore.currentUser?.email" type="email" class="pm-input pm-input--readonly" readonly />
        </div>
      </div>

      <div class="panel-action-bar">
        <button type="submit" class="pm-btn pm-btn--primary" :disabled="isSaving || !formDirty">
          <span v-if="isSaving">Đang lưu...</span>
          <span v-else>Lưu thay đổi</span>
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onUnmounted } from 'vue';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { useToastStore } from '../../composables/useToast';
import { AVATAR_URL_STORAGE_KEY } from '../../features/auth/services/statelessAuthApi';

const authStore = useAuthStore();
const toastStore = useToastStore();
const isSaving = ref(false);

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

const form = reactive({
  username: '',
  nickname: '',
  university: '',
  bio: ''
});

// PR-017: lỗi inline theo từng field (không chỉ toast).
const fieldErrors = reactive({
  username: ''
});

// PR-013: bản sao giá trị gốc để tính dirty (PR-033) — cập nhật mỗi khi profile đổi identity.
const original = reactive({
  username: '',
  nickname: '',
  university: '',
  bio: ''
});

// PR-013: watch theo identity — store loadStatelessProfile giờ gán OBJECT MỚI
// (useAuthStore.loadStatelessProfile) nên watcher này luôn trigger sau load/đổi thiết bị.
watch(() => authStore.currentUser, (user) => {
  if (user) {
    form.username = user.username || '';
    form.nickname = user.nickname || '';
    form.university = user.university || '';
    form.bio = user.bio || '';
    Object.assign(original, { username: form.username, nickname: form.nickname, university: form.university, bio: form.bio });
  }
}, { immediate: true });

// PR-033: nút "Lưu" chỉ enabled khi form khác dữ liệu gốc.
const formDirty = computed(() => (
  form.username !== original.username
  || form.nickname !== original.nickname
  || form.university !== original.university
  || form.bio !== original.bio
));

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

const avatarInputEl = ref<HTMLInputElement | null>(null);
const isUploadingAvatar = ref(false);
// PR-005: preview tức thì bằng objectURL — hiển thị ngay khi chọn file, trước khi upload xong.
const previewObjectUrl = ref('');

const avatarUrl = computed(() => authStore.currentUser?.avatarUrl || previewObjectUrl.value || null);

// PR-005: chọn ảnh → validate → preview → upload FormData (KHÔNG set Content-Type —
// pattern TC-010: trình duyệt tự thêm multipart boundary).
async function handleAvatarSelected(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    toastStore.error('Chỉ chấp nhận file ảnh.');
    return;
  }
  if (file.size > MAX_AVATAR_BYTES) {
    toastStore.error('File ảnh không được vượt quá 5MB.');
    return;
  }
  if (previewObjectUrl.value) URL.revokeObjectURL(previewObjectUrl.value);
  previewObjectUrl.value = URL.createObjectURL(file);
  isUploadingAvatar.value = true;
  try {
    const url = await uploadAvatarFile(file);
    localStorage.setItem(AVATAR_URL_STORAGE_KEY, url);
    // PR-010: loadStatelessProfile overlay avatar cục bộ + đồng bộ badges/username mới nhất.
    await authStore.loadStatelessProfile();
    toastStore.success('Đã cập nhật ảnh đại diện!');
  } catch (err: unknown) {
    toastStore.error(err instanceof Error ? err.message : 'Không thể tải ảnh đại diện.');
  } finally {
    isUploadingAvatar.value = false;
  }
}

async function uploadAvatarFile(file: File): Promise<string> {
  const token = authStore.getAccessToken();
  const formData = new FormData();
  formData.append('file', file);
  // TC-010: chỉ gắn Authorization, KHÔNG set Content-Type (trình duyệt tự thêm boundary).
  const res = await fetch(`${API_BASE}/api/v1/upload/image`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
    body: formData,
  });
  const body: { url?: string; message?: string } | null = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.message ?? `HTTP ${res.status}`);
  }
  if (!body?.url) throw new Error('Máy chủ không trả về đường dẫn ảnh.');
  return body.url;
}

onUnmounted(() => {
  // Dọn objectURL preview nếu có — tránh rò rỉ bộ nhớ blob.
  if (previewObjectUrl.value) URL.revokeObjectURL(previewObjectUrl.value);
});

// PR-017/027: lỗi username inline; phân biệt lỗi auth thật (401) với lỗi trả về từ server.
async function handleSave(): Promise<void> {
  const username = form.username.trim();
  if (!username) {
    fieldErrors.username = 'Tên người dùng không được để trống.';
    return;
  }
  if (username.length < 3) {
    fieldErrors.username = 'Tên người dùng phải có ít nhất 3 ký tự.';
    return;
  }
  isSaving.value = true;
  try {
    await authStore.updateProfile(username, form.nickname, form.bio, form.university);
    toastStore.success('Cập nhật hồ sơ cá nhân thành công!');
    // PR-033: sau khi lưu thành công, form khớp với dữ liệu gốc → nút Lưu trở về disabled.
    Object.assign(original, { username: form.username, nickname: form.nickname, university: form.university, bio: form.bio });
  } catch (err: unknown) {
    // PR-027: không còn catch (err:any) — chuẩn hóa từ unknown.
    const status = (err as { status?: number } | null)?.status;
    const message = err instanceof Error ? err.message : '';
    if (status === 401) {
      toastStore.error('Phiên đã hết hạn, vui lòng đăng nhập lại.');
    } else if (/username|tên người dùng|đã tồn tại|trùng/i.test(message)) {
      fieldErrors.username = message || 'Tên người dùng không hợp lệ.';
    } else {
      toastStore.error(message || 'Không thể cập nhật hồ sơ.');
    }
  } finally {
    isSaving.value = false;
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

.avatar-file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.avatar-upload-item {
  background-color: var(--color-bg-surface, #18181b);
  border: 1px solid var(--color-border-subtle, #27272a);
  border-radius: 6px;
  padding: 0.75rem 1rem;
}

.pm-btn--ghost {
  background: transparent;
  border: 1px solid var(--color-border-subtle, #3f3f46);
  color: var(--color-text-secondary, #a1a1aa);
}
.pm-btn--ghost:hover:not(:disabled) {
  border-color: var(--color-accent-primary, #6366f1);
  color: var(--color-text-heading, #f4f4f5);
}

.avatar-preview-note {
  margin: 6px 0 0;
  font-size: 0.7rem;
  color: var(--color-text-muted, #71717a);
}
</style>

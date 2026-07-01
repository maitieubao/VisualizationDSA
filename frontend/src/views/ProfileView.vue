<template>
  <div class="profile-view">
    <!-- Back to Dashboard -->
    <div class="profile-view__header">
      <button class="btn btn-secondary back-btn" @click="router.push('/dashboard')">
        ← Quay lại Bảng điều khiển
      </button>
      <h1 class="profile-view__title">Hồ Sơ Cá Nhân</h1>
    </div>

    <div class="profile-view__content">
      <!-- Left side: User Summary card & Badges -->
      <div class="profile-view__left">
        <div class="dash-card profile-card">
          <div class="profile-card__avatar-wrapper">
            <div class="profile-card__avatar" :class="{ 'profile-card__avatar--premium': authStore.isPremium }">
              {{ initials }}
            </div>
            <span v-if="authStore.isPremium" class="profile-card__premium-badge">
              <BaseIcon name="diamond" class="w-3.5 h-3.5 inline-block mr-1 text-inherit" />
              PRO
            </span>
          </div>

          <div class="profile-card__details">
            <h2 class="profile-card__name">{{ currentNickname || authStore.userName }}</h2>
            <p class="profile-card__username">@{{ authStore.userName }}</p>
            <p class="profile-card__email">{{ authStore.currentUser?.email }}</p>
            <div class="profile-card__role">
              <span class="role-tag" :class="`role-tag--${authStore.userRole.toLowerCase()}`">
                {{ roleLabel }}
              </span>
            </div>
          </div>

          <!-- XP & Progress Bar -->
          <div class="profile-card__progress">
            <div class="progress-info">
              <span class="progress-info__lvl">Cấp độ {{ authStore.userLevel }}</span>
              <span class="progress-info__xp">{{ authStore.userXP }} XP</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>
            <p class="progress-hint" v-if="xpToNext > 0">
              Cần thêm {{ xpToNext }} XP để đạt Cấp độ {{ authStore.userLevel + 1 }}
            </p>
            <p class="progress-hint" v-else>Bạn đã đạt cấp độ tối đa!</p>
          </div>

          <!-- Quick Statistics -->
          <div class="profile-stats">
            <div class="profile-stat-item">
              <BaseIcon name="fire" class="profile-stat-item__icon" />
              <div class="profile-stat-item__content">
                <span class="profile-stat-item__val">{{ authStore.currentUser?.streakDays || 0 }} ngày</span>
                <span class="profile-stat-item__lbl">Chuỗi học</span>
              </div>
            </div>
            <div class="profile-stat-item">
              <BaseIcon name="badge" class="profile-stat-item__icon" />
              <div class="profile-stat-item__content">
                <span class="profile-stat-item__val">{{ badgesList.length }}</span>
                <span class="profile-stat-item__lbl">Huy hiệu</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Badges section -->
        <div class="dash-card badges-card">
          <h3 class="dash-card__title">
            <BaseIcon name="medal" class="w-4 h-4 text-accent inline-block mr-1 align-text-bottom" />
            Huy hiệu đã nhận ({{ badgesList.length }})
          </h3>
          <div v-if="badgesList.length > 0" class="badges-grid-full">
            <div 
              v-for="badge in badgesList" 
              :key="badge.id" 
              class="badge-item-detail"
              :style="{ '--badge-color': badge.color }"
            >
              <div class="badge-item-detail__icon" :style="{ backgroundColor: badge.color + '22', color: badge.color }">
                <BaseIcon :name="getBadgeIconName(badge.icon)" class="w-6 h-6" />
              </div>
              <div class="badge-item-detail__content">
                <h4 class="badge-item-detail__name">{{ badge.name }}</h4>
                <p class="badge-item-detail__desc">{{ badge.description }}</p>
                <span class="badge-item-detail__date">Đạt được ngày: {{ formatDate(badge.earnedAt) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="badges-empty-state">
            <p>Chưa nhận được huy hiệu nào.</p>
            <router-link to="/quiz" class="btn btn-primary btn-sm">
              Làm trắc nghiệm để nhận
            </router-link>
          </div>
        </div>
      </div>

      <!-- Right side: Profile Form -->
      <div class="profile-view__right">
        <div class="dash-card form-card">
          <h3 class="dash-card__title">
            <BaseIcon name="admin" class="w-4 h-4 text-accent inline-block mr-1 align-text-bottom" />
            Thiết lập tài khoản
          </h3>

          <form @submit.prevent="handleSave" class="profile-form">
            <div class="form-group">
              <label for="username">Tên người dùng (Username)</label>
              <input 
                id="username"
                v-model="form.username" 
                type="text" 
                placeholder="Nhập username mới..."
                class="form-control"
                required
              />
            </div>

            <div class="form-group">
              <label for="nickname">Biệt danh hiển thị</label>
              <input 
                id="nickname"
                v-model="form.nickname" 
                type="text" 
                placeholder="Nhập biệt danh..."
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="university">Trường đại học</label>
              <input 
                id="university"
                v-model="form.university" 
                type="text" 
                placeholder="Nhập tên trường học..."
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="bio">Giới thiệu bản thân (Bio)</label>
              <textarea 
                id="bio"
                v-model="form.bio" 
                placeholder="Hãy giới thiệu ngắn gọn về bản thân..."
                class="form-control form-textarea"
                rows="4"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Địa chỉ Email (Không thể thay đổi)</label>
              <input 
                :value="authStore.currentUser?.email" 
                type="email" 
                class="form-control form-control--readonly" 
                readonly 
              />
            </div>

            <div class="form-actions">
              <button 
                type="submit" 
                class="btn btn-primary submit-btn"
                :disabled="isSaving"
              >
                <span v-if="isSaving">Đang lưu...</span>
                <span v-else>Lưu thay đổi</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import { useToastStore } from '../composables/useToast';

const router = useRouter();
const authStore = useAuthStore();
const toastStore = useToastStore();

const isSaving = ref(false);

const form = reactive({
  username: '',
  nickname: '',
  university: '',
  bio: ''
});

// Load profile info on mount
onMounted(async () => {
  await authStore.loadStatelessProfile();
  
  if (authStore.currentUser) {
    form.username = authStore.currentUser.username || '';
    form.nickname = authStore.currentUser.nickname || '';
    form.university = authStore.currentUser.university || '';
    form.bio = authStore.currentUser.bio || '';
  }
});

const initials = computed(() => {
  const name = authStore.currentUser?.nickname || authStore.userName;
  if (!name) return 'U';
  return name.charAt(0).toUpperCase();
});

const currentNickname = computed(() => {
  return authStore.currentUser?.nickname;
});

const roleLabel = computed(() => {
  switch (authStore.userRole) {
    case 'Admin': return 'Quản trị viên';
    case 'Teacher': return 'Giảng viên';
    default: return 'Học viên';
  }
});

const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000];

const xpToNext = computed(() => {
  const lvl = authStore.userLevel;
  if (lvl >= levelThresholds.length) return 0;
  return levelThresholds[lvl] - authStore.userXP;
});

const progressPercent = computed(() => {
  const lvl = authStore.userLevel;
  if (lvl <= 0 || lvl >= levelThresholds.length) return 100;
  const prev = levelThresholds[lvl - 1];
  const next = levelThresholds[lvl];
  const range = next - prev;
  if (range <= 0) return 100;
  return Math.min(100, ((authStore.userXP - prev) / range) * 100);
});

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: string;
}

function getBadgeIconName(emojiIcon: string): string {
  const map: Record<string, string> = {
    '🏆': 'dsa-champion',
    '📊': 'sorting-wizard',
    '🧬': 'oop-guru',
    '🏗️': 'solid-master',
    '🎨': 'pattern-hunter',
    '💉': 'system-architect',
    '📝': 'first-steps',
    '🏅': 'badge'
  };
  return map[emojiIcon] || 'badge';
}

const badgesList = computed<Badge[]>(() => {
  const badges = authStore.currentUser?.badges || [];
  return badges.map(b => {
    const raw = b as Record<string, unknown>;
    return {
      id: String(raw.id || ''),
      name: String(raw.name || ''),
      description: String(raw.description || ''),
      icon: String(raw.icon || '🏅'),
      color: String(raw.color || '#6366f1'),
      earnedAt: String(raw.earnedAt || new Date().toISOString())
    };
  });
});

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

async function handleSave() {
  if (!form.username.trim()) {
    toastStore.error('Tên người dùng không được để trống.');
    return;
  }
  isSaving.value = ref(true).value;
  try {
    await authStore.updateProfile(form.username, form.nickname, form.bio, form.university);
    toastStore.success('Cập nhật hồ sơ cá nhân thành công!');
  } catch (err: any) {
    const errorMsg = err.message || 'Không thể cập nhật hồ sơ.';
    toastStore.error(errorMsg);
  } finally {
    isSaving.value = false;
  }
}
</script>

<style scoped>
.profile-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100%;
  overflow-y: auto;
}

.profile-view__header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
}

.profile-view__title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #fff 30%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.profile-view__content {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 900px) {
  .profile-view__content {
    grid-template-columns: 1fr;
  }
}

/* Profile Card Left */
.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2.5rem 2rem;
  position: relative;
  background: rgba(30, 30, 45, 0.45);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  margin-bottom: 2rem;
}

.profile-card__avatar-wrapper {
  position: relative;
  margin-bottom: 1.5rem;
}

.profile-card__avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
  border: 3px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
}

.profile-card__avatar--premium {
  border-color: #f59e0b;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
}

.profile-card__premium-badge {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  background: #f59e0b;
  color: #1e1b4b;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 12px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
}

.profile-card__name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.profile-card__username {
  font-size: 0.9rem;
  color: var(--text-tertiary);
  margin: 0.25rem 0 0.5rem 0;
}

.profile-card__email {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.profile-card__role {
  margin-bottom: 1.5rem;
}

/* XP Progress Bar */
.profile-card__progress {
  width: 100%;
  margin-bottom: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.5rem;
}

.progress-info__xp {
  color: #a855f7;
}

.progress-bar-container {
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #a855f7 100%);
  border-radius: 4px;
  transition: width 0.6s ease;
}

.progress-hint {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 0.5rem;
}

/* Stats */
.profile-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.profile-stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  text-align: left;
}

.profile-stat-item__icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--color-accent-primary);
}

.profile-stat-item__content {
  display: flex;
  flex-direction: column;
}

.profile-stat-item__val {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
}

.profile-stat-item__lbl {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

/* Badges section */
.badges-card {
  padding: 1.5rem;
  background: rgba(30, 30, 45, 0.45);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
}

.badges-grid-full {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.badge-item-detail {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--badge-color, #6366f1);
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.badge-item-detail:hover {
  transform: translateX(4px);
  background: rgba(255, 255, 255, 0.06);
}

.badge-item-detail__icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.badge-item-detail__content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: left;
}

.badge-item-detail__name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.badge-item-detail__desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0;
}

.badge-item-detail__date {
  font-size: 0.7rem;
  color: var(--text-tertiary);
}

.badges-empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

/* Right side edit Form */
.form-card {
  padding: 2rem;
  background: rgba(30, 30, 45, 0.45);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.form-control {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  color: #fff;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #a855f7;
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.15);
}

.form-control--readonly {
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-secondary);
  cursor: not-allowed;
  border-color: rgba(255, 255, 255, 0.05);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.submit-btn {
  padding: 0.75rem 2rem;
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: #fff;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.submit-btn:hover {
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Left Column: Identity & Badges -->
    <div class="space-y-8">
      <!-- Profile Card -->
      <div class="bg-surface-dark/80 backdrop-blur-xl border border-border-default rounded-3xl p-6 text-center shadow-xl relative overflow-hidden group">
        <div class="absolute inset-0 bg-gradient-to-b from-accent-purple/10 to-transparent pointer-events-none"></div>
        
        <div class="relative w-32 h-32 mx-auto mb-4 group cursor-pointer" @click="triggerAvatarUpload">
          <AvatarDisplay 
            :avatar-url="avatarUrl" 
            :initials="initials" 
            :frame-type="authStore.currentUser?.avatarFrameType" 
            size="w-32 h-32" 
          >
            <template #overlay>
              <div class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full z-30">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </template>
          </AvatarDisplay>
          
          <input type="file" ref="avatarInput" class="hidden" accept="image/*" @change="handleAvatarUpload" />
          <div v-if="authStore.isPremium" class="absolute -bottom-2 -right-2 bg-gradient-to-r from-accent-warm to-accent-warm text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-border-strong z-40">
            PRO
          </div>
        </div>

        <h2 class="text-2xl font-bold">{{ currentNickname || authStore.userName }}</h2>
        <p class="text-text-muted">@{{ authStore.userName }}</p>
        <div class="mt-2 inline-block px-3 py-1 rounded-full text-sm font-semibold bg-bg-surface text-accent">
          {{ roleLabel }}
        </div>

        <!-- Level Progress -->
        <div class="mt-6 text-left">
          <div class="flex justify-between text-sm font-bold mb-2">
            <span class="text-accent-purple">Cấp độ {{ authStore.userLevel }}</span>
            <span class="text-pink-300">{{ authStore.userXP }} XP</span>
          </div>
          <div class="h-2 w-full bg-bg-surface rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-accent to-accent-purple" :style="{ width: progressPercent + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Badges -->
      <div class="bg-surface-dark/80 backdrop-blur-xl border border-border-default rounded-3xl p-6 shadow-xl">
        <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
          <BaseIcon name="medal" class="w-5 h-5 text-accent-warm" /> Huy hiệu của bạn
        </h3>
        <div class="grid grid-cols-4 gap-3" v-if="badgesList.length > 0">
          <div v-for="badge in badgesList" :key="badge.id" class="aspect-square rounded-2xl bg-bg-surface flex flex-col items-center justify-center p-2 hover:bg-bg-surface transition-colors group relative cursor-help">
            <span class="text-2xl group-hover:scale-110 transition-transform">{{ badge.icon }}</span>
            <div class="absolute bottom-full mb-2 bg-black/90 p-2 rounded text-xs w-32 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div class="font-bold">{{ badge.name }}</div>
              <div class="text-text-secondary">{{ badge.description }}</div>
            </div>
          </div>
        </div>
        <div v-else class="text-center text-text-muted text-sm py-4">
          Chưa có huy hiệu.
        </div>
      </div>
    </div>

    <!-- Right Column: Settings -->
    <div class="lg:col-span-2 space-y-8">
      <!-- Settings Form -->
      <div class="bg-surface-dark/80 backdrop-blur-xl border border-border-default rounded-3xl p-6 shadow-xl">
        <h3 class="text-lg font-bold mb-6 flex items-center gap-2">
          <BaseIcon name="cog" class="w-5 h-5 text-accent" /> Cài đặt chung
        </h3>
        <form @submit.prevent="handleSaveProfile" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="space-y-1">
              <label class="text-sm font-medium text-text-muted">Tên người dùng</label>
              <input v-model="form.username" type="text" class="w-full bg-black/40 border border-border-default rounded-xl px-4 py-2.5 focus:border-border-accent focus:ring-1 focus:ring-accent outline-none transition-all" />
            </div>
            <div class="space-y-1">
              <label class="text-sm font-medium text-text-muted">Biệt danh hiển thị</label>
              <input v-model="form.nickname" type="text" class="w-full bg-black/40 border border-border-default rounded-xl px-4 py-2.5 focus:border-border-accent focus:ring-1 focus:ring-accent outline-none transition-all" />
            </div>
          </div>
          <div class="space-y-1">
            <label class="text-sm font-medium text-text-muted">Tiểu sử (Bio)</label>
            <textarea v-model="form.bio" rows="3" class="w-full bg-black/40 border border-border-default rounded-xl px-4 py-2.5 focus:border-border-accent focus:ring-1 focus:ring-accent outline-none transition-all resize-none" placeholder="Chia sẻ đôi điều về bạn..."></textarea>
          </div>
          <div class="flex justify-end pt-4">
            <button type="submit" :disabled="isSaving" class="bg-gradient-to-r from-accent to-accent-purple hover:from-accent hover:to-accent-purple text-text-primary font-bold py-2.5 px-6 rounded-xl transition-all">
              {{ isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';
import AvatarDisplay from '@/shared/components/AvatarDisplay.vue';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useToastStore } from '@/composables/useToast';
import { api } from '@/services/apiClient';

const authStore = useAuthStore();
const toastStore = useToastStore();

const avatarInput = ref<HTMLInputElement | null>(null);
const uploadingAvatar = ref(false);
const avatarUrl = ref('');
const isSaving = ref(false);

const form = reactive({
  username: '',
  nickname: '',
  bio: ''
});

onMounted(async () => {
  await authStore.loadStatelessProfile();
  if (authStore.currentUser) {
    form.username = authStore.currentUser.username || '';
    form.nickname = authStore.currentUser.nickname || '';
    form.bio = authStore.currentUser.bio || '';
    if ((authStore.currentUser as any).avatarUrl) {
      avatarUrl.value = (authStore.currentUser as any).avatarUrl;
    }
  }
});

const initials = computed(() => {
  const name = authStore.currentUser?.nickname || authStore.userName;
  if (!name) return 'U';
  return name.charAt(0).toUpperCase();
});

const currentNickname = computed(() => authStore.currentUser?.nickname);
const roleLabel = computed(() => {
  switch (authStore.userRole) {
    case 'Admin': return 'Admin';
    case 'Teacher': return 'Teacher';
    default: return 'Student';
  }
});

const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000];
const progressPercent = computed(() => {
  const lvl = authStore.userLevel;
  if (lvl <= 0 || lvl >= levelThresholds.length) return 100;
  return Math.min(100, ((authStore.userXP - levelThresholds[lvl - 1]) / (levelThresholds[lvl] - levelThresholds[lvl - 1])) * 100);
});

const badgesList = computed(() => {
  return (authStore.currentUser?.badges || []).map(b => {
    const raw = b as Record<string, unknown>;
    return {
      id: String(raw.id || ''),
      name: String(raw.name || ''),
      description: String(raw.description || ''),
      icon: String(raw.icon || '🏅'),
    };
  });
});

const triggerAvatarUpload = () => avatarInput.value?.click();

const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files?.length) return;
  const file = target.files[0];
  if (file.size > 2 * 1024 * 1024) return toastStore.error("File quá lớn (tối đa 2MB)");
  
  uploadingAvatar.value = true;
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await api.post<any>('/users/profile/avatar', formData);
    if (res.avatarUrl) avatarUrl.value = res.avatarUrl;
    toastStore.success("Cập nhật avatar thành công!");
  } catch (err: any) {
    toastStore.error(err.message || "Lỗi upload avatar");
  } finally {
    uploadingAvatar.value = false;
  }
};

const handleSaveProfile = async () => {
  if (!form.username.trim()) return toastStore.error("Username không được trống");
  isSaving.value = true;
  try {
    await authStore.updateProfile(form.username, form.nickname, form.bio, '');
    toastStore.success('Đã lưu thông tin');
  } catch (err: any) {
    toastStore.error(err.message || 'Lỗi lưu thông tin');
  } finally {
    isSaving.value = false;
  }
};
</script>

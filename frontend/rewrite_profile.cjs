const fs = require('fs');

const fileContent = `<template>
  <div class="profile-view p-4 md:p-8 max-w-6xl mx-auto min-h-screen text-white">
    <!-- Header -->
    <header class="flex items-center gap-4 mb-8">
      <button @click="router.push('/dashboard')" class="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
      <h1 class="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
        Hồ Sơ Của Tôi
      </h1>
    </header>

    <!-- Tabs -->
    <div class="flex border-b border-white/10 mb-8 overflow-x-auto scrollbar-none">
      <button 
        @click="activeTab = 'profile'"
        class="px-6 py-3 font-semibold whitespace-nowrap transition-colors border-b-2"
        :class="activeTab === 'profile' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-white'"
      >
        Thông tin cá nhân
      </button>
      <button 
        v-if="!authStore.isTeacher && !authStore.isAdmin"
        @click="activeTab = 'teacher-app'"
        class="px-6 py-3 font-semibold whitespace-nowrap transition-colors border-b-2"
        :class="activeTab === 'teacher-app' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'"
      >
        Đăng ký Giảng Viên
      </button>
    </div>

    <!-- TAB 1: PROFILE -->
    <div v-if="activeTab === 'profile'" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column: Identity & Badges -->
      <div class="space-y-8">
        <!-- Profile Card -->
        <div class="bg-surface-dark/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center shadow-xl relative overflow-hidden group">
          <div class="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none"></div>
          
          <div class="relative w-32 h-32 mx-auto mb-4 group cursor-pointer" @click="triggerAvatarUpload">
            <div class="w-full h-full rounded-full p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500" :class="{'animate-spin-slow': uploadingAvatar}">
              <div class="w-full h-full bg-surface-dark rounded-full overflow-hidden flex items-center justify-center relative">
                <img v-if="avatarUrl" :src="avatarUrl" class="w-full h-full object-cover" />
                <span v-else class="text-4xl font-bold">{{ initials }}</span>
                
                <div class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <input type="file" ref="avatarInput" class="hidden" accept="image/*" @change="handleAvatarUpload" />
            <div v-if="authStore.isPremium" class="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-surface-dark">
              PRO
            </div>
          </div>

          <h2 class="text-2xl font-bold">{{ currentNickname || authStore.userName }}</h2>
          <p class="text-text-muted">@{{ authStore.userName }}</p>
          <div class="mt-2 inline-block px-3 py-1 rounded-full text-sm font-semibold bg-white/10 text-indigo-300">
            {{ roleLabel }}
          </div>

          <!-- Level Progress -->
          <div class="mt-6 text-left">
            <div class="flex justify-between text-sm font-bold mb-2">
              <span class="text-purple-300">Cấp độ {{ authStore.userLevel }}</span>
              <span class="text-pink-300">{{ authStore.userXP }} XP</span>
            </div>
            <div class="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-indigo-500 to-pink-500" :style="{ width: progressPercent + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- Badges -->
        <div class="bg-surface-dark/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
          <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
            <span>🏅</span> Huy hiệu của bạn
          </h3>
          <div class="grid grid-cols-4 gap-3" v-if="badgesList.length > 0">
            <div v-for="badge in badgesList" :key="badge.id" class="aspect-square rounded-2xl bg-white/5 flex flex-col items-center justify-center p-2 hover:bg-white/10 transition-colors group relative cursor-help">
              <span class="text-2xl group-hover:scale-110 transition-transform">{{ badge.icon }}</span>
              <div class="absolute bottom-full mb-2 bg-black/90 p-2 rounded text-xs w-32 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div class="font-bold">{{ badge.name }}</div>
                <div class="text-gray-400">{{ badge.description }}</div>
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
        <div class="bg-surface-dark/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
          <h3 class="text-lg font-bold mb-6 flex items-center gap-2">
            <span>⚙️</span> Cài đặt chung
          </h3>
          <form @submit.prevent="handleSaveProfile" class="space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="space-y-1">
                <label class="text-sm font-medium text-text-muted">Tên người dùng</label>
                <input v-model="form.username" type="text" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div class="space-y-1">
                <label class="text-sm font-medium text-text-muted">Biệt danh hiển thị</label>
                <input v-model="form.nickname" type="text" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
              </div>
            </div>
            <div class="space-y-1">
              <label class="text-sm font-medium text-text-muted">Tiểu sử (Bio)</label>
              <textarea v-model="form.bio" rows="3" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none" placeholder="Chia sẻ đôi điều về bạn..."></textarea>
            </div>
            <div class="flex justify-end pt-4">
              <button type="submit" :disabled="isSaving" class="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all">
                {{ isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- TAB 2: TEACHER APPLICATION -->
    <div v-else-if="activeTab === 'teacher-app'" class="max-w-3xl mx-auto">
      <div class="bg-surface-dark/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl">
        <h3 class="text-2xl font-bold mb-2 flex items-center gap-2">
          <span>🎓</span> Trở thành Giảng viên
        </h3>
        <p class="text-gray-400 mb-8">Chia sẻ kiến thức của bạn và nhận được những đặc quyền riêng biệt (Vô hạn Tim, 50 Token AI/ngày).</p>

        <form @submit.prevent="submitApplication" class="space-y-6">
          
          <div class="space-y-2">
            <label class="font-medium text-gray-300">Kinh nghiệm giảng dạy</label>
            <textarea 
              v-model="appForm.experience" 
              required
              rows="3" 
              class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all resize-none"
              placeholder="Vd: 3 năm giảng dạy tại trung tâm XYZ..."
            ></textarea>
          </div>

          <div class="space-y-2">
            <label class="font-medium text-gray-300">Lý do muốn tham gia</label>
            <textarea 
              v-model="appForm.reason" 
              required
              rows="3" 
              class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all resize-none"
              placeholder="Tại sao bạn muốn trở thành giảng viên trên hệ thống của chúng tôi?"
            ></textarea>
          </div>

          <div class="space-y-2">
            <label class="font-medium text-gray-300">Tải lên CV (PDF/Image)</label>
            
            <div 
              class="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer"
              @click="$refs.cvInput.click()"
              @dragover.prevent="dragover = true"
              @dragleave.prevent="dragover = false"
              @drop.prevent="handleCvDrop"
              :class="{'border-purple-500 bg-purple-500/10': dragover}"
            >
              <div v-if="!appForm.cvFile" class="flex flex-col items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div class="text-sm text-gray-400">
                  <span class="text-purple-400 font-semibold">Nhấn để tải lên</span> hoặc Kéo thả file vào đây
                </div>
                <div class="text-xs text-gray-500">Hỗ trợ PDF, JPG, PNG (Max: 5MB)</div>
              </div>
              <div v-else class="flex flex-col items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <div class="text-sm font-medium text-white">{{ appForm.cvFile.name }}</div>
                <div class="text-xs text-gray-400">{{ (appForm.cvFile.size / 1024 / 1024).toFixed(2) }} MB</div>
                <button @click.stop="appForm.cvFile = null" class="mt-2 text-xs text-red-400 hover:text-red-300">Xóa file</button>
              </div>
              <input type="file" ref="cvInput" class="hidden" accept=".pdf,image/*" @change="handleCvUpload" />
            </div>
          </div>

          <div class="pt-6 border-t border-white/10 flex justify-end">
            <button 
              type="submit" 
              :disabled="isSubmittingApp" 
              class="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2"
            >
              {{ isSubmittingApp ? 'Đang gửi...' : 'Gửi Yêu Cầu' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useToastStore } from '@/composables/useToast';
import { api } from '@/services/apiClient';

const router = useRouter();
const authStore = useAuthStore();
const toastStore = useToastStore();

const activeTab = ref('profile');

// PROFILE TAB
const avatarInput = ref<HTMLInputElement | null>(null);
const uploadingAvatar = ref(false);
const avatarUrl = ref('');
const isSaving = ref(false);

const form = reactive({
  username: '',
  nickname: '',
  bio: ''
});

// TEACHER APP TAB
const dragover = ref(false);
const isSubmittingApp = ref(false);
const appForm = reactive({
  experience: '',
  reason: '',
  cvFile: null as File | null
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

const handleCvUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files?.length) return;
  const file = target.files[0];
  if (file.size > 5 * 1024 * 1024) return toastStore.error("File quá lớn (tối đa 5MB)");
  appForm.cvFile = file;
};

const handleCvDrop = (event: DragEvent) => {
  dragover.value = false;
  if (!event.dataTransfer?.files.length) return;
  const file = event.dataTransfer.files[0];
  if (file.size > 5 * 1024 * 1024) return toastStore.error("File quá lớn (tối đa 5MB)");
  appForm.cvFile = file;
};

const submitApplication = async () => {
  if (!appForm.cvFile) {
    return toastStore.error("Vui lòng tải lên CV của bạn");
  }
  
  isSubmittingApp.value = true;
  try {
    const formData = new FormData();
    formData.append('experience', appForm.experience);
    formData.append('reason', appForm.reason);
    formData.append('cvFile', appForm.cvFile);

    await api.post('/teacher-applications', formData);
    toastStore.success('Đã gửi yêu cầu thành công! Chúng tôi sẽ xem xét sớm nhất.');
    
    // Clear form
    appForm.experience = '';
    appForm.reason = '';
    appForm.cvFile = null;
  } catch (err: any) {
    toastStore.error(err.response?.data?.message || 'Lỗi khi gửi yêu cầu');
  } finally {
    isSubmittingApp.value = false;
  }
};
</script>
`;

fs.writeFileSync('d:/FPT/og/VisualizationDSA/frontend/src/views/ProfileView.vue', fileContent);
console.log('ProfileView updated successfully!');

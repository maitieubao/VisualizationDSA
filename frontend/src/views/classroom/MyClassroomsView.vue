<template>
  <div class="my-classrooms-view min-h-screen p-6 lg:p-10">
    <header class="mb-8">
      <h1 class="text-3xl font-black text-text-primary mb-2 flex items-center gap-3">
        <BaseIcon name="users" class="w-8 h-8 text-accent" />
        Lớp học của tôi
      </h1>
      <p class="text-text-secondary text-sm">
        Danh sách các lớp học bạn đang tham gia với tư cách học viên.
      </p>
    </header>

    <div v-if="loading" class="loading-state py-16 flex flex-col items-center justify-center gap-3">
      <div class="spinner inline-block w-8 h-8 border-4 border-accent/20 border-t-indigo-500 rounded-full animate-spin"></div>
      <span class="text-text-secondary text-sm">Đang tải danh sách lớp học...</span>
    </div>

    <div v-else-if="classrooms.length === 0" class="empty-state py-16 text-center bg-bg-secondary/40 border border-border-subtle border-dashed rounded-3xl">
      <div class="text-6xl mb-4">🎓</div>
      <h2 class="text-xl font-bold text-text-primary mb-2">Bạn chưa tham gia lớp học nào</h2>
      <p class="text-text-secondary text-sm mb-6 max-w-md mx-auto">
        Hãy nhập mã mời từ giảng viên để tham gia lớp học. Bạn cũng có thể khám phá các khóa học công khai.
      </p>
      <div class="flex gap-3 justify-center flex-wrap">
        <button
          type="button"
          class="px-5 py-2.5 rounded-lg bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-colors font-bold text-sm"
          @click="showJoinModal = true"
        >
          <BaseIcon name="plus" class="w-4 h-4 inline mr-1 align-middle" />
          Tham gia bằng mã mời
        </button>
        <router-link
          to="/courses"
          class="px-5 py-2.5 rounded-lg bg-bg-tertiary/40 text-text-secondary border border-border-subtle hover:text-text-primary hover:border-accent/30 transition-colors font-bold text-sm"
        >
          Khám phá khóa học
        </router-link>
      </div>
    </div>

    <div v-else class="classroom-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <router-link
        v-for="c in classrooms"
        :key="c.id"
        :to="`/classrooms/${c.id}`"
        class="classroom-card group block p-6 rounded-2xl bg-bg-secondary/60 border border-border-subtle hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10 transition-all duration-200"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
            <BaseIcon name="users" class="w-6 h-6" />
          </div>
          <span v-if="c.role" class="px-2 py-1 rounded-md bg-bg-tertiary/40 text-text-secondary text-[10px] font-bold uppercase tracking-wider">
            {{ formatRole(c.role) }}
          </span>
        </div>
        <h3 class="text-lg font-bold text-text-primary mb-1 group-hover:text-accent transition-colors line-clamp-2">
          {{ c.name }}
        </h3>
        <p v-if="c.description" class="text-text-secondary text-sm line-clamp-2 mb-3">
          {{ c.description }}
        </p>
        <div class="flex items-center justify-between text-xs text-text-disabled mt-4">
          <span v-if="c.studentCount !== undefined">
            <BaseIcon name="user" class="w-3 h-3 inline mr-1 align-middle" />
            {{ c.studentCount }} học viên
          </span>
          <span class="text-accent font-bold group-hover:translate-x-1 transition-transform">
            Mở lớp →
          </span>
        </div>
      </router-link>
    </div>

    
    <Transition name="modal">
      <div
        v-if="showJoinModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="showJoinModal = false"
      >
        <div class="bg-bg-secondary rounded-xl border border-border-subtle shadow-2xl max-w-md w-full p-6">
          <h2 class="text-xl font-bold text-text-primary mb-2">Tham gia lớp học</h2>
          <p class="text-text-secondary text-sm mb-4">Nhập mã mời 6 ký tự từ giảng viên của bạn.</p>
          <input
            v-model="joinCode"
            type="text"
            maxlength="6"
            placeholder="ABC123"
            class="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border-subtle text-text-primary text-center font-mono text-xl tracking-widest uppercase focus:outline-none focus:border-accent"
            @keyup.enter="joinClassroom"
          />
          <div v-if="joinError" class="mt-3 text-accent-red text-sm">{{ joinError }}</div>
          <div class="flex justify-end gap-2 mt-6">
            <button
              type="button"
              class="px-4 py-2 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
              @click="showJoinModal = false"
            >
              Hủy
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-lg bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-colors font-bold"
              :disabled="joining"
              @click="joinClassroom"
            >
              {{ joining ? 'Đang tham gia...' : 'Tham gia' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import BaseIcon from '@/shared/components/BaseIcon.vue';

const router = useRouter();
const authStore = useAuthStore();

interface ClassroomSummary {
  id: string;
  name: string;
  description?: string;
  studentCount?: number;
  role?: string;
}

const loading = ref(false);
const classrooms = ref<ClassroomSummary[]>([]);
const showJoinModal = ref(false);
const joinCode = ref('');
const joining = ref(false);
const joinError = ref<string | null>(null);

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

function getAuthHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authStore.getAccessToken() || ''}`,
  };
}

function formatRole(role: string): string {
  const map: Record<string, string> = {
    Teacher: 'Giảng viên',
    Student: 'Học viên',
    Admin: 'Quản trị',
  };
  return map[role] || role;
}

async function loadClassrooms() {
  loading.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/Classroom/mine`, { headers: getAuthHeaders() });
    if (res.ok) {
      classrooms.value = await res.json();
    } else if (res.status === 401) {
      router.push('/');
    }
  } catch (err) {
    console.error('Failed to load classrooms:', err);
  } finally {
    loading.value = false;
  }
}

async function joinClassroom() {
  if (!joinCode.value || joinCode.value.length < 4) {
    joinError.value = 'Mã mời phải có ít nhất 4 ký tự.';
    return;
  }
  joinError.value = null;
  joining.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/Classroom/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ inviteCode: joinCode.value.toUpperCase() }),
    });
    if (res.ok) {
      const newClassroom = await res.json();
      showJoinModal.value = false;
      joinCode.value = '';
      await loadClassrooms();
      
      if (newClassroom?.id) {
        router.push(`/classrooms/${newClassroom.id}`);
      }
    } else {
      const err = await res.json().catch(() => ({}));
      joinError.value = err.message || `Mã mời không hợp lệ (${res.status}).`;
    }
  } catch (err) {
    joinError.value = 'Không thể kết nối máy chủ. Vui lòng thử lại.';
    console.error('Join classroom failed:', err);
  } finally {
    joining.value = false;
  }
}

onMounted(() => {
  loadClassrooms();
});
</script>

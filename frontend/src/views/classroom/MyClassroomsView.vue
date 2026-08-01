<template>
  <div class="my-classrooms-view min-h-screen p-6 lg:p-10">
    <header class="mb-8">
      <h1 class="text-3xl font-black text-text-primary mb-2 flex items-center gap-3">
        <BaseIcon name="users" class="w-8 h-8 text-indigo-400" />
        Lá»›p há»c cá»§a tÃ´i
      </h1>
      <p class="text-text-secondary text-sm">
        Danh sÃ¡ch cÃ¡c lá»›p há»c báº¡n Ä‘ang tham gia vá»›i tÆ° cÃ¡ch há»c viÃªn.
      </p>
    </header>

    <div v-if="loading" class="loading-state py-16 flex flex-col items-center justify-center gap-3">
      <div class="spinner inline-block w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      <span class="text-text-secondary text-sm">Äang táº£i danh sÃ¡ch lá»›p há»c...</span>
    </div>

    <div v-else-if="classrooms.length === 0" class="empty-state py-16 text-center bg-bg-secondary/40 border border-border-subtle border-dashed rounded-3xl">
      <div class="text-6xl mb-4">ðŸŽ“</div>
      <h2 class="text-xl font-bold text-text-primary mb-2">Báº¡n chÆ°a tham gia lá»›p há»c nÃ o</h2>
      <p class="text-text-secondary text-sm mb-6 max-w-md mx-auto">
        HÃ£y nháº­p mÃ£ má»i tá»« giáº£ng viÃªn Ä‘á»ƒ tham gia lá»›p há»c. Báº¡n cÅ©ng cÃ³ thá»ƒ khÃ¡m phÃ¡ cÃ¡c khÃ³a há»c cÃ´ng khai.
      </p>
      <div class="flex gap-3 justify-center flex-wrap">
        <button
          type="button"
          class="px-5 py-2.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors font-bold text-sm"
          @click="showJoinModal = true"
        >
          <BaseIcon name="plus" class="w-4 h-4 inline mr-1 align-middle" />
          Tham gia báº±ng mÃ£ má»i
        </button>
        <router-link
          to="/courses"
          class="px-5 py-2.5 rounded-lg bg-bg-tertiary/40 text-text-secondary border border-border-subtle hover:text-text-primary hover:border-indigo-500/30 transition-colors font-bold text-sm"
        >
          KhÃ¡m phÃ¡ khÃ³a há»c
        </router-link>
      </div>
    </div>

    <div v-else class="classroom-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <router-link
        v-for="c in classrooms"
        :key="c.id"
        :to="`/classrooms/${c.id}`"
        class="classroom-card group block p-6 rounded-2xl bg-bg-secondary/60 border border-border-subtle hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-200"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
            <BaseIcon name="users" class="w-6 h-6" />
          </div>
          <span v-if="c.role" class="px-2 py-1 rounded-md bg-bg-tertiary/40 text-text-secondary text-[10px] font-bold uppercase tracking-wider">
            {{ formatRole(c.role) }}
          </span>
        </div>
        <h3 class="text-lg font-bold text-text-primary mb-1 group-hover:text-indigo-300 transition-colors line-clamp-2">
          {{ c.name }}
        </h3>
        <p v-if="c.description" class="text-text-secondary text-sm line-clamp-2 mb-3">
          {{ c.description }}
        </p>
        <div class="flex items-center justify-between text-xs text-text-disabled mt-4">
          <span v-if="c.studentCount !== undefined">
            <BaseIcon name="user" class="w-3 h-3 inline mr-1 align-middle" />
            {{ c.studentCount }} há»c viÃªn
          </span>
          <span class="text-indigo-400 font-bold group-hover:translate-x-1 transition-transform">
            Má»Ÿ lá»›p â†’
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
          <h2 class="text-xl font-bold text-text-primary mb-2">Tham gia lá»›p há»c</h2>
          <p class="text-text-secondary text-sm mb-4">Nháº­p mÃ£ má»i 6 kÃ½ tá»± tá»« giáº£ng viÃªn cá»§a báº¡n.</p>
          <input
            v-model="joinCode"
            type="text"
            maxlength="6"
            placeholder="ABC123"
            class="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border-subtle text-text-primary text-center font-mono text-xl tracking-widest uppercase focus:outline-none focus:border-indigo-500"
            @keyup.enter="joinClassroom"
          />
          <div v-if="joinError" class="mt-3 text-rose-400 text-sm">{{ joinError }}</div>
          <div class="flex justify-end gap-2 mt-6">
            <button
              type="button"
              class="px-4 py-2 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
              @click="showJoinModal = false"
            >
              Há»§y
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors font-bold"
              :disabled="joining"
              @click="joinClassroom"
            >
              {{ joining ? 'Äang tham gia...' : 'Tham gia' }}
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
    Teacher: 'Giáº£ng viÃªn',
    Student: 'Há»c viÃªn',
    Admin: 'Quáº£n trá»‹',
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
    joinError.value = 'MÃ£ má»i pháº£i cÃ³ Ã­t nháº¥t 4 kÃ½ tá»±.';
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
      joinError.value = err.message || `MÃ£ má»i khÃ´ng há»£p lá»‡ (${res.status}).`;
    }
  } catch (err) {
    joinError.value = 'KhÃ´ng thá»ƒ káº¿t ná»‘i mÃ¡y chá»§. Vui lÃ²ng thá»­ láº¡i.';
    console.error('Join classroom failed:', err);
  } finally {
    joining.value = false;
  }
}

onMounted(() => {
  loadClassrooms();
});
</script>

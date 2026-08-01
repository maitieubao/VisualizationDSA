<template>
  <div class="student-classroom-view min-h-screen bg-slate-950">
    
    <div v-if="loading" class="flex items-center justify-center h-screen">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-slate-400">Äang táº£i lá»›p há»c...</p>
      </div>
    </div>

    
    <div v-else class="flex h-screen">
      
      <aside class="w-80 shrink-0 p-4 overflow-y-auto border-r border-white/10">
        <StudentCurriculumSidebar
          :classroom-id="classroomId"
          :curriculum="curriculum"
          :current-item-id="currentItemId"
          @navigate="onNavigateToItem"
        />
      </aside>

      
      <main class="flex-1 p-6 overflow-y-auto">
        
        <div v-if="!currentItem" class="flex flex-col items-center justify-center h-full text-center">
          <BaseIcon name="book-open" class="w-16 h-16 text-slate-600 mb-4" />
          <h2 class="text-2xl font-bold text-white mb-2">ChÃ o má»«ng Ä‘áº¿n vá»›i lá»›p há»c!</h2>
          <p class="text-slate-400 max-w-md">
            Chá»n má»™t bÃ i há»c tá»« sidebar Ä‘á»ƒ báº¯t Ä‘áº§u. Tiáº¿n Ä‘á»™ cá»§a báº¡n sáº½ Ä‘Æ°á»£c tá»± Ä‘á»™ng lÆ°u láº¡i.
          </p>
        </div>

        
        <ClassroomItemPlayer
          v-else
          :item="currentItem"
          :classroom-id="classroomId"
          @complete="onPlayerComplete"
        />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import BaseIcon from '@/shared/components/BaseIcon.vue';
import StudentCurriculumSidebar from './components/StudentCurriculumSidebar.vue';
import ClassroomItemPlayer from './components/ClassroomItemPlayer.vue';

const route = useRoute();
const router = useRouter();
const classroomId = computed(() => route.params.id as string);

const authStore = useAuthStore();
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

const classroom = ref<any>(null);
const curriculum = ref<any>(null);
const loading = ref(true);
const currentItemId = ref<string | null>(null);
const currentItem = ref<any>(null);
const progressSummary = ref<any>(null);

const currentUser = computed(() => authStore.currentUser);

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

function findItemById(curriculum: any, itemId: string): any {
  if (!curriculum?.modules) return null;
  for (const module of curriculum.modules) {
    for (const item of module.items) {
      if (item.id === itemId) return item;
    }
  }
  return null;
}

function findNextItem(curriculum: any, currentId: string | null): any {
  if (!curriculum?.modules || !currentId) return null;
  let found = false;
  for (const module of curriculum.modules) {
    for (const item of module.items) {
      if (found) return item;
      if (item.id === currentId) found = true;
    }
  }
  return null;
}

async function loadClassroom() {
  try {
    const headers = getAuthHeaders();
    const [classroomRes, curriculumRes, progressRes] = await Promise.all([
      fetch(`${BASE_URL}/api/v1/classrooms/${classroomId.value}`, { headers }),
      fetch(`${BASE_URL}/api/v1/classrooms/${classroomId.value}/curriculum/student`, { headers }),
      fetch(`${BASE_URL}/api/v1/classrooms/${classroomId.value}/my-progress`, { headers })
    ]);

    if (classroomRes.ok) classroom.value = await classroomRes.json();
    if (curriculumRes.ok) curriculum.value = await curriculumRes.json();
    if (progressRes.ok) progressSummary.value = await progressRes.json();
  } catch (err) {
    console.error('Failed to load classroom:', err);
  } finally {
    loading.value = false;
  }
}

async function loadProgressSummary() {
  try {
    const headers = getAuthHeaders();
    const res = await fetch(`${BASE_URL}/api/v1/classrooms/${classroomId.value}/my-progress`, { headers });
    if (res.ok) {
      progressSummary.value = await res.json();
    }
  } catch (err) {
    console.error('Failed to load progress:', err);
  }
}

async function loadCurriculum() {
  try {
    const headers = getAuthHeaders();
    const res = await fetch(`${BASE_URL}/api/v1/classrooms/${classroomId.value}/curriculum/student`, { headers });
    if (res.ok) {
      curriculum.value = await res.json();
    }
  } catch (err) {
    console.error('Failed to load curriculum:', err);
  }
}

function onNavigateToItem(itemId: string) {
  currentItemId.value = itemId;
  const item = findItemById(curriculum.value, itemId);
  if (item) {
    currentItem.value = item;
    router.push({ query: { itemId } });
    trackItemStart(itemId);
  }
}

function navigateToNext() {
  const nextItem = findNextItem(curriculum.value, currentItemId.value);
  if (nextItem) {
    onNavigateToItem(nextItem.id);
  }
}

async function trackItemStart(itemId: string) {
  try {
    const headers = getAuthHeaders();
    await fetch(`${BASE_URL}/api/v1/classrooms/module-items/${itemId}/start`, {
      method: 'POST',
      headers
    });
  } catch (err) {
    console.error('Failed to start item:', err);
  }
}

async function trackItemProgress(itemId: string, activeFrame: number, scrollPercent: number) {
  try {
    const headers = getAuthHeaders();
    await fetch(`${BASE_URL}/api/v1/classrooms/module-items/${itemId}/progress`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ activeFrame, scrollPercent })
    });
  } catch (err) {
    console.error('Failed to update progress:', err);
  }
}

async function trackItemComplete(itemId: string, score?: number) {
  try {
    const headers = getAuthHeaders();
    const res = await fetch(`${BASE_URL}/api/v1/classrooms/module-items/${itemId}/complete`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ score })
    });
    if (res.ok) {
      const result = await res.json();
      await loadProgressSummary();
      if (result.newlyUnlockedItemIds?.length) {
        await loadCurriculum();
      }
    }
  } catch (err) {
    console.error('Failed to complete item:', err);
  }
}

async function onPlayerComplete() {
  if (currentItemId.value) {
    await trackItemComplete(currentItemId.value);
  }
  navigateToNext();
}

onMounted(() => {
  loadClassroom();
  if (route.query.itemId) {
    currentItemId.value = route.query.itemId as string;
  }
});

watch(() => route.query.itemId, (newId) => {
  if (newId && newId !== currentItemId.value) {
    onNavigateToItem(newId as string);
  }
});
</script>

<style scoped>
.student-classroom-view {
  background: #020617;
}
</style>
</script>
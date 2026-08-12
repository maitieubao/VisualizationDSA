<template>
  <div class="student-classroom-view min-h-screen bg-bg-secondary">
    
    <div v-if="loading" class="flex items-center justify-center h-screen">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-text-muted">Đang tải lớp học...</p>
      </div>
    </div>

    <!-- CR-008: error state tải classroom — không hiện "Chào mừng..." + sidebar rỗng giả. -->
    <div v-else-if="classroomError" class="flex flex-col items-center justify-center h-screen text-center gap-4 px-6">
      <BaseIcon name="alert-circle" class="w-14 h-14 text-accent-red" />
      <h2 class="text-xl font-bold text-text-primary">{{ classroomError }}</h2>
      <p class="text-text-muted text-sm max-w-md">
        Bạn có thể thử tải lại hoặc kiểm tra lại đường dẫn lớp học.
      </p>
      <button type="button" class="btn-primary px-5 py-2.5" @click="loadClassroom">Thử lại</button>
    </div>

    
    <div v-else class="flex h-screen relative">
      <!-- LS-029: nút toggle sidebar (mobile). CR-050: ẩn khi curriculum rỗng + aria-expanded/controls. -->
      <button
        v-if="isMobile && curriculumHasItems"
        type="button"
        class="fixed bottom-20 left-4 z-30 lg:hidden p-3 rounded-full bg-accent text-white shadow-lg shadow-accent/30 cursor-pointer"
        :aria-expanded="sidebarOpen"
        aria-controls="student-classroom-sidebar"
        aria-label="Mở danh sách bài học"
        @click="sidebarOpen = true"
      >
        <BaseIcon name="list" class="w-5 h-5" />
      </button>

      <!-- Overlay mobile -->
      <Transition name="fade">
        <div
          v-if="isMobile && sidebarOpen"
          class="fixed inset-0 bg-black/50 z-40 lg:hidden"
          @click="sidebarOpen = false"
        />
      </Transition>

      <!-- Sidebar: desktop cố định — mobile là drawer trượt từ trái (CR-027: 1 scroll container duy nhất). -->
      <Transition name="slide-left">
        <aside
          v-if="!isMobile || sidebarOpen"
          id="student-classroom-sidebar"
          class="shrink-0 p-4 overflow-y-auto border-r border-border-subtle"
          :class="isMobile ? 'fixed inset-y-0 left-0 z-50 w-80 bg-bg-secondary' : 'w-80'"
        >
          <div v-if="isMobile" class="flex justify-end mb-2">
            <button
              type="button"
              class="p-1 rounded-md hover:bg-bg-hover text-text-muted cursor-pointer"
              aria-label="Đóng danh sách bài học"
              @click="sidebarOpen = false"
            >
              <BaseIcon name="x" class="w-4 h-4" />
            </button>
          </div>
          <StudentCurriculumSidebar
            :classroom-id="classroomId"
            :curriculum="curriculum"
            :current-item-id="currentItemId"
            @navigate="onNavigateToItem"
          />
        </aside>
      </Transition>

      
      <main ref="mainRef" class="flex-1 p-6 overflow-y-auto" @scroll.passive="onMainScroll">
        <!-- CR-022: progressSummary hiển thị tối thiểu ở header (thay vì fetch 2 lần không render). -->
        <div v-if="progressSummary" class="mb-6 p-4 bg-bg-secondary/60 border border-border-subtle rounded-xl flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-4 flex-wrap">
            <div class="flex items-center gap-2">
              <BaseIcon name="chart-bar" class="w-5 h-5 text-accent" />
              <span class="text-sm font-bold text-text-primary">{{ progressSummary.overallProgressPercent ?? 0 }}% hoàn thành</span>
            </div>
            <span class="text-xs text-text-muted">
              {{ progressSummary.completedItems ?? 0 }}/{{ progressSummary.totalItems ?? 0 }} bài đã hoàn thành
            </span>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-40 h-2 bg-bg-surface rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-accent to-accent-purple transition-all duration-500"
                :style="{ width: (progressSummary.overallProgressPercent ?? 0) + '%' }"
              ></div>
            </div>
            <!-- CR-026: nút Rời lớp — POST /api/v1/classrooms/{id}/leave (backend đang bổ sung). -->
            <button
              type="button"
              class="text-xs px-3 py-1.5 rounded-lg border border-border-subtle text-text-muted hover:text-accent-red hover:border-accent-red/40 transition-colors"
              @click="leaveClassroom"
            >
              Rời lớp
            </button>
          </div>
        </div>

        
        <div v-if="!currentItem" class="flex flex-col items-center justify-center h-full text-center">
          <BaseIcon name="book-open" class="w-16 h-16 text-text-disabled mb-4" />
          <h2 class="text-2xl font-bold text-text-primary mb-2">Chào mừng đến với lớp học!</h2>
          <p class="text-text-muted max-w-md">
            Chọn một bài học từ sidebar để bắt đầu. Tiến độ của bạn sẽ được tự động lưu lại.
          </p>
        </div>

        
        <ClassroomItemPlayer
          v-else
          :item="currentItem"
          :classroom-id="classroomId"
          :curriculum="curriculum"
          @complete="onPlayerComplete"
          @next="navigateToNext"
          @back="onPlayerBack"
        />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useToastStore } from '@/composables/useToast';
import BaseIcon from '@/shared/components/BaseIcon.vue';
import StudentCurriculumSidebar from './components/StudentCurriculumSidebar.vue';
import ClassroomItemPlayer from './components/ClassroomItemPlayer.vue';

const route = useRoute();
const router = useRouter();
const classroomId = computed(() => route.params.id as string);

const authStore = useAuthStore();
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

// Toast store khởi tạo lười (chỉ khi hành động thật) — view không phụ thuộc Pinia ở setup,
// tránh vỡ mount trong môi trường test chưa cài đặt Pinia.
let toastStoreInstance: ReturnType<typeof useToastStore> | null = null;
function getToast() {
  toastStoreInstance ??= useToastStore();
  return toastStoreInstance;
}

const classroom = ref<any>(null);
const curriculum = ref<any>(null);
const loading = ref(true);
// CR-008: lỗi tải classroom (403/404/network) tách khỏi trạng thái tải.
const classroomError = ref<string | null>(null);
const currentItemId = ref<string | null>(null);
const currentItem = ref<any>(null);

interface ProgressSummary {
  classroomId?: string;
  studentId?: string;
  totalItems?: number;
  completedItems?: number;
  inProgressItems?: number;
  lockedItems?: number;
  overallProgressPercent?: number;
}

const progressSummary = ref<ProgressSummary | null>(null);

// LS-029: drawer sidebar mobile.
const isMobile = ref(window.innerWidth < 1024);
const sidebarOpen = ref(false);

// CR-050: FAB chỉ hiện khi curriculum có bài thật.
const curriculumHasItems = computed(() =>
  (curriculum.value?.modules ?? []).some((m: any) => (m.items ?? []).length > 0)
);

// CR-021: trackItemProgress trong vòng đời player — scroll debounce + heartbeat.
const mainRef = ref<HTMLElement | null>(null);
let scrollDebounceTimer: number | null = null;
let heartbeatTimer: number | null = null;

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

// CR-005: back → item liền trước; không có thì về màn chào (danh sách).
function findPrevItem(curriculum: any, currentId: string | null): any {
  if (!curriculum?.modules || !currentId) return null;
  let prev: any = null;
  for (const module of curriculum.modules) {
    for (const item of module.items) {
      if (item.id === currentId) return prev;
      prev = item;
    }
  }
  return null;
}

async function loadClassroom() {
  loading.value = true;
  classroomError.value = null;
  try {
    const headers = getAuthHeaders();
    const [classroomRes, curriculumRes, progressRes] = await Promise.all([
      fetch(`${BASE_URL}/api/v1/classrooms/${classroomId.value}`, { headers }),
      fetch(`${BASE_URL}/api/v1/classrooms/${classroomId.value}/curriculum/student`, { headers }),
      fetch(`${BASE_URL}/api/v1/classrooms/${classroomId.value}/my-progress`, { headers })
    ]);

    if (classroomRes.status === 401) {
      router.push('/');
      return;
    }
    if (classroomRes.status === 403) {
      classroomError.value = 'Bạn không trong lớp này.';
      return;
    }
    if (classroomRes.status === 404) {
      classroomError.value = 'Lớp không tồn tại.';
      return;
    }
    if (!classroomRes.ok) {
      classroomError.value = `Không thể tải lớp học (${classroomRes.status}).`;
      return;
    }

    classroom.value = await classroomRes.json();
    if (curriculumRes.ok) {
      curriculum.value = await curriculumRes.json();
      // Deep-link: route.query.itemId → mở thẳng bài đó sau khi curriculum tải xong.
      const pendingItemId = currentItemId.value
        ?? (typeof route.query.itemId === 'string' ? route.query.itemId : null);
      if (pendingItemId) {
        const item = findItemById(curriculum.value, pendingItemId);
        if (item) {
          currentItemId.value = pendingItemId;
          currentItem.value = item;
          // CR-037: deep-link phải trackItemStart — bài mở thẳng cũng tính "đang học".
          void trackItemStart(pendingItemId);
        }
      }
    }
    if (progressRes.ok) progressSummary.value = await progressRes.json();
  } catch (err) {
    console.error('Failed to load classroom:', err);
    classroomError.value = 'Không thể kết nối máy chủ. Vui lòng thử lại.';
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
  // CR-021: flush tiến độ bài cũ TRƯỚC khi chuyển bài.
  flushProgressSync();
  currentItemId.value = itemId;
  const item = findItemById(curriculum.value, itemId);
  if (item) {
    currentItem.value = item;
    router.push({ query: { itemId } });
    trackItemStart(itemId);
    // Mobile: đóng drawer sau khi chọn bài.
    if (isMobile.value) sidebarOpen.value = false;
  }
}

function navigateToNext() {
  const nextItem = findNextItem(curriculum.value, currentItemId.value);
  if (nextItem) {
    onNavigateToItem(nextItem.id);
  }
}

// CR-005: back — item trước hoặc về màn danh sách (hết dead nút).
function onPlayerBack() {
  const prev = findPrevItem(curriculum.value, currentItemId.value);
  if (prev) {
    onNavigateToItem(prev.id);
  } else {
    currentItem.value = null;
    currentItemId.value = null;
    router.push({ query: {} });
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

// CR-021: đọc % cuộn từ container nội dung chính (clamp 0..100).
function readScrollPercent(): number {
  const el = mainRef.value;
  if (!el) return 0;
  const maxScroll = el.scrollHeight - el.clientHeight;
  if (maxScroll <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((el.scrollTop / maxScroll) * 100)));
}

function flushProgressSync(): void {
  const id = currentItemId.value;
  const item = currentItem.value;
  if (!id || item?.status === 'Completed') return;
  void trackItemProgress(id, 0, readScrollPercent());
}

// Scroll debounce 800ms — không spam PUT /progress mỗi sự kiện scroll.
function onMainScroll(): void {
  if (scrollDebounceTimer !== null) return;
  scrollDebounceTimer = window.setTimeout(() => {
    scrollDebounceTimer = null;
    flushProgressSync();
  }, 800);
}

function stopProgressTimers(): void {
  if (scrollDebounceTimer !== null) {
    window.clearTimeout(scrollDebounceTimer);
    scrollDebounceTimer = null;
  }
  if (heartbeatTimer !== null) {
    window.clearInterval(heartbeatTimer);
    heartbeatTimer = null;
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
      const result = await res.json().catch(() => ({}));
      // CR-007: loadCurriculum LUÔN (không chỉ khi newlyUnlocked) → sidebar cập nhật status.
      await loadCurriculum();
      // CR-007: refresh currentItem từ curriculum mới — không giữ tham chiếu cũ (status cũ).
      const freshItem = currentItemId.value ? findItemById(curriculum.value, currentItemId.value) : null;
      if (freshItem) currentItem.value = freshItem;
      await loadProgressSummary();
      if (result?.newlyUnlockedItemIds?.length) {
        // Module/item mới mở khóa — sidebar đã render lại nhờ curriculum mới.
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

// CR-026: rời lớp — POST /api/v1/classrooms/{id}/leave (backend đang bổ sung endpoint).
async function leaveClassroom() {
  const name = curriculum.value?.classroomName ?? classroom.value?.name ?? 'lớp học';
  if (!confirm(`Bạn có chắc chắn muốn rời lớp "${name}"? Bạn sẽ mất quyền truy cập cho đến khi được mời lại.`)) return;
  try {
    const headers = getAuthHeaders();
    const res = await fetch(`${BASE_URL}/api/v1/classrooms/${classroomId.value}/leave`, {
      method: 'POST',
      headers
    });
    if (res.ok) {
      getToast().success(`Bạn đã rời lớp "${name}".`);
      router.push('/classrooms');
    } else {
      const err = await res.json().catch(() => ({}));
      const msg = (err as Record<string, unknown>)?.Message ?? (err as Record<string, unknown>)?.message;
      getToast().error(typeof msg === 'string' && msg ? msg : `Không thể rời lớp (${res.status}).`);
    }
  } catch (err) {
    console.error('Leave classroom failed:', err);
    getToast().error('Không thể kết nối máy chủ. Vui lòng thử lại.');
  }
}

// CR-021: heartbeat — cứ 5s ghi tiến độ 1 lần trong lúc đang học bài.
watch(currentItemId, (newId, oldId) => {
  if (newId === oldId) return;
  stopProgressTimers();
  flushProgressSync();
  if (newId && currentItem.value?.status !== 'Completed') {
    heartbeatTimer = window.setInterval(() => flushProgressSync(), 5000);
  }
});

// CR-038: đổi user → reload classroom (hết stale dữ liệu người cũ); logout → về trang chủ.
watch(() => authStore.currentUser?.id, (newId, oldId) => {
  if (newId === oldId) return;
  if (!newId) {
    router.push('/');
    return;
  }
  stopProgressTimers();
  loadClassroom();
});

onMounted(() => {
  loadClassroom();
  if (route.query.itemId) {
    currentItemId.value = route.query.itemId as string;
  }
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  stopProgressTimers();
  flushProgressSync();
});

function handleResize() {
  const mobile = window.innerWidth < 1024;
  if (!mobile) sidebarOpen.value = false;
  isMobile.value = mobile;
}

watch(() => route.query.itemId, (newId) => {
  if (newId && newId !== currentItemId.value) {
    onNavigateToItem(newId as string);
  }
});
</script>

<style scoped>
.student-classroom-view {
  background: var(--color-bg-primary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>

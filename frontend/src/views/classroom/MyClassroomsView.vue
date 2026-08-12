<template>
  <div class="my-classrooms-view min-h-screen p-6 lg:p-10">
    <header class="mb-8">
      <h1 class="text-3xl font-black text-text-primary mb-2 flex items-center gap-3">
        <BaseIcon name="users" class="w-8 h-8 text-accent" />
        Lớp học của tôi
      </h1>
      <p class="text-text-secondary text-sm">
        Danh sách các lớp học bạn đang tham gia.
      </p>
    </header>

    <div v-if="loading" class="loading-state py-16 flex flex-col items-center justify-center gap-3">
      <div class="spinner inline-block w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
      <span class="text-text-secondary text-sm">Đang tải danh sách lớp học...</span>
    </div>

    <!-- CR-025: banner lỗi tách khỏi empty state — lỗi mạng/server không hiện "chưa tham gia lớp nào" giả. -->
    <div v-else-if="loadError" class="error-state py-16 flex flex-col items-center justify-center gap-4 bg-bg-secondary/40 border border-accent-red/30 rounded-3xl">
      <BaseIcon name="alert-circle" class="w-14 h-14 text-accent-red" />
      <p class="text-text-secondary text-sm text-center max-w-md">{{ loadError }}</p>
      <button type="button" class="px-5 py-2.5 rounded-lg bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-colors font-bold text-sm" @click="loadClassrooms">
        Thử lại
      </button>
    </div>

    <div v-else-if="classrooms.length === 0" class="empty-state py-16 text-center bg-bg-secondary/40 border border-border-subtle border-dashed rounded-3xl">
      <div class="text-6xl mb-4"><BaseIcon name="academic" class="w-16 h-16" /></div>
      <h2 class="text-xl font-bold text-text-primary mb-2">Bạn chưa tham gia lớp học nào</h2>
      <p class="text-text-secondary text-sm mb-6 max-w-md mx-auto">
        Hãy nhập mã mời từ giảng viên để tham gia lớp học. Bạn cũng có thể khám phá các khóa học công khai.
      </p>
      <div class="flex gap-3 justify-center flex-wrap">
        <button
          type="button"
          class="px-5 py-2.5 rounded-lg bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-colors font-bold text-sm"
          @click="openJoinModal"
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
      <div
        v-for="c in classrooms"
        :key="c.id"
        class="classroom-card group relative p-6 rounded-2xl bg-bg-secondary/60 border border-border-subtle hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10 transition-all duration-200"
      >
        <router-link :to="`/classrooms/${c.id}`" class="block">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
              <BaseIcon name="users" class="w-6 h-6" />
            </div>
            <span class="text-accent font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Mở lớp <BaseIcon name="arrow-right" class="w-3.5 h-3.5" />
            </span>
          </div>
          <h3 class="text-lg font-bold text-text-primary mb-1 group-hover:text-accent transition-colors line-clamp-2 flex items-center gap-2">
            <span class="min-w-0 line-clamp-2">{{ c.name }}</span>
            <!-- CR-042: badge role render theo field Role (backend sẽ trả về) — không có thì không hiện. -->
            <span v-if="c.role" class="shrink-0 px-2 py-1 rounded-md bg-bg-tertiary/40 text-text-secondary text-[10px] font-bold uppercase tracking-wider">
              {{ formatRole(c.role) }}
            </span>
          </h3>
          <p v-if="c.description" class="text-text-secondary text-sm line-clamp-2 mb-3">
            {{ c.description }}
          </p>
          <div class="flex items-center justify-between text-xs text-text-disabled mt-4">
            <span v-if="c.studentCount !== undefined">
              <BaseIcon name="user" class="w-3 h-3 inline mr-1 align-middle" />
              {{ c.studentCount }} học viên
            </span>
          </div>
        </router-link>

        <!-- CR-026: nút Rời lớp (học viên mới có; giảng viên/owner ẩn). -->
        <button
          v-if="!isTeacher && c.role !== 'Teacher' && c.role !== 'Admin'"
          type="button"
          class="absolute bottom-3 right-3 text-xs px-2.5 py-1.5 rounded-lg border border-border-subtle text-text-muted hover:text-accent-red hover:border-accent-red/40 transition-colors"
          :disabled="leavingId === c.id"
          @click="leaveClassroom(c)"
        >
          {{ leavingId === c.id ? 'Đang rời...' : 'Rời lớp' }}
        </button>
      </div>
    </div>

    
    <Transition name="modal">
      <div
        v-if="showJoinModal"
        ref="joinModalEl"
        role="dialog"
        aria-modal="true"
        aria-label="Tham gia lớp học"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="showJoinModal = false"
      >
        <div class="bg-bg-secondary rounded-xl border border-border-subtle shadow-2xl max-w-md w-full p-6">
          <h2 class="text-xl font-bold text-text-primary mb-2">Tham gia lớp học</h2>
          <p class="text-text-secondary text-sm mb-4">Nhập mã mời 6 ký tự từ giảng viên của bạn.</p>
          <input
            ref="joinInputEl"
            v-model="joinCode"
            type="text"
            maxlength="6"
            autocomplete="off"
            placeholder="ABC123"
            aria-label="Mã mời 6 ký tự"
            class="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border-subtle text-text-primary text-center font-mono text-xl tracking-widest uppercase focus:outline-none focus:border-accent"
            @keyup.enter="joinClassroom"
          />
          <div v-if="joinError" role="alert" class="mt-3 text-accent-red text-sm">{{ joinError }}</div>
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
import { ref, computed, toRef, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useModalA11y } from '@/composables/useModalA11y';
import { useToastStore } from '@/composables/useToast';
import BaseIcon from '@/shared/components/BaseIcon.vue';

const router = useRouter();
const authStore = useAuthStore();

// Toast store khởi tạo lười (chỉ khi hành động thật) — view không phụ thuộc Pinia ở setup.
let toastStoreInstance: ReturnType<typeof useToastStore> | null = null;
function getToast() {
  toastStoreInstance ??= useToastStore();
  return toastStoreInstance;
}

interface ClassroomSummary {
  id: string;
  name: string;
  description?: string;
  studentCount?: number;
  role?: string;
}

const loading = ref(false);
// CR-025: lỗi tải danh sách tách khỏi empty state.
const loadError = ref<string | null>(null);
const classrooms = ref<ClassroomSummary[]>([]);
const showJoinModal = ref(false);
const joinCode = ref('');
const joining = ref(false);
const joinError = ref<string | null>(null);
// CR-026: trạng thái rời lớp đang chờ cho từng thẻ.
const leavingId = ref<string | null>(null);

// CR-044: focus trap + Esc đóng modal join (composable dùng chung).
const joinInputEl = ref<HTMLInputElement | null>(null);
const { overlayEl: joinModalEl } = useModalA11y(toRef(showJoinModal), joinInputEl);

const isTeacher = computed(() => authStore.isTeacher);

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

function extractErrorMessage(errBody: unknown, fallback: string): string {
  if (errBody && typeof errBody === 'object') {
    const record = errBody as Record<string, unknown>;
    const msg = record.Message ?? record.message;
    if (typeof msg === 'string' && msg.length > 0) return msg;
  }
  return fallback;
}

async function loadClassrooms() {
  loading.value = true;
  loadError.value = null;
  try {
    // CR-002: endpoint chuẩn /api/v1/classrooms/mine.
    const res = await fetch(`${BASE_URL}/api/v1/classrooms/mine`, { headers: getAuthHeaders() });
    if (res.ok) {
      classrooms.value = await res.json();
    } else if (res.status === 401) {
      router.push('/');
    } else {
      loadError.value = `Không thể tải danh sách lớp học (${res.status}). Vui lòng thử lại.`;
    }
  } catch (err) {
    console.error('Failed to load classrooms:', err);
    loadError.value = 'Không thể kết nối máy chủ. Vui lòng thử lại.';
  } finally {
    loading.value = false;
  }
}

function openJoinModal() {
  joinError.value = null;
  joinCode.value = '';
  showJoinModal.value = true;
}

async function joinClassroom() {
  // CR-024: validate đúng 6 ký tự (khớp label) + trim trước khi gửi.
  const code = joinCode.value.trim();
  if (!/^[A-Za-z0-9]{6}$/.test(code)) {
    joinError.value = 'Mã mời phải gồm đúng 6 ký tự chữ hoặc số.';
    return;
  }
  joinError.value = null;
  joining.value = true;
  try {
    // CR-002: endpoint chuẩn /api/v1/classrooms/join.
    const res = await fetch(`${BASE_URL}/api/v1/classrooms/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ inviteCode: code.toUpperCase() }),
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
      // CR-032 (client): backend trả { Message } (hoa M) — đọc cả 2 dạng.
      const err = await res.json().catch(() => ({}));
      joinError.value = extractErrorMessage(err, `Mã mời không hợp lệ (${res.status}).`);
    }
  } catch (err) {
    joinError.value = 'Không thể kết nối máy chủ. Vui lòng thử lại.';
    console.error('Join classroom failed:', err);
  } finally {
    joining.value = false;
  }
}

// CR-026: rời lớp — POST /api/v1/classrooms/{id}/leave (backend đang bổ sung endpoint).
async function leaveClassroom(c: ClassroomSummary) {
  if (leavingId.value) return;
  if (!confirm(`Bạn có chắc chắn muốn rời lớp "${c.name}"? Bạn sẽ mất quyền truy cập cho đến khi được mời lại.`)) return;
  leavingId.value = c.id;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/classrooms/${c.id}/leave`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      getToast().success(`Bạn đã rời lớp "${c.name}".`);
      await loadClassrooms();
    } else {
      const err = await res.json().catch(() => ({}));
      getToast().error(extractErrorMessage(err, `Không thể rời lớp (${res.status}).`));
    }
  } catch (err) {
    console.error('Leave classroom failed:', err);
    getToast().error('Không thể kết nối máy chủ. Vui lòng thử lại.');
  } finally {
    leavingId.value = null;
  }
}

onMounted(() => {
  loadClassrooms();
});
</script>

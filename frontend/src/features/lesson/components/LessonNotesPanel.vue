<template>
  <div class="lesson-notes-panel rounded-xl border border-border-subtle bg-bg-secondary p-3">
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs font-bold text-text-primary flex items-center gap-1.5">
        <BaseIcon name="edit" class="w-3.5 h-3.5 text-accent" />
        Ghi chú bài học
      </span>
      <span class="text-[10px] text-text-muted" aria-live="polite">
        <template v-if="status === 'saving'">Đang lưu…</template>
        <template v-else-if="status === 'saved'">Đã lưu</template>
        <template v-else-if="status === 'error'">Lưu thất bại</template>
        <template v-else>Chưa lưu</template>
      </span>
    </div>

    <textarea
      v-model="contentHtml"
      rows="6"
      placeholder="Viết ghi chú riêng cho bài học này…"
      aria-label="Nội dung ghi chú bài học"
      class="w-full resize-y rounded-lg border border-border-subtle bg-bg-primary px-3 py-2 text-xs text-text-primary outline-none focus:border-accent"
      @input="scheduleSave"
    ></textarea>

    <div class="mt-2 flex items-center justify-between">
      <p class="text-[10px] text-text-muted">Tự động lưu sau 1 giây ngừng gõ.</p>
      <button
        class="text-[11px] text-accent-red hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isDeleting"
        @click="removeNote"
      >
        {{ isDeleting ? 'Đang xóa…' : 'Xóa ghi chú' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { lessonNoteApi, type LessonNoteDto } from '../../../services/lessonNoteApi';

const props = defineProps<{
  lessonId: string;
}>();

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const contentHtml = ref<string>('');
const status = ref<SaveStatus>('idle');
const isDeleting = ref<boolean>(false);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let currentRequestId = 0;

function clearDebounce(): void {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

function scheduleSave(): void {
  clearDebounce();
  status.value = 'saving';
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void saveNote();
  }, 1000);
}

async function saveNote(): Promise<void> {
  const requestId = ++currentRequestId;
  try {
    await lessonNoteApi.upsertNote(props.lessonId, contentHtml.value);
    if (requestId === currentRequestId) status.value = 'saved';
  } catch {
    if (requestId === currentRequestId) status.value = 'error';
  }
}

async function removeNote(): Promise<void> {
  if (isDeleting.value) return;
  isDeleting.value = true;
  try {
    await lessonNoteApi.deleteNote(props.lessonId);
    contentHtml.value = '';
    status.value = 'saved';
  } catch {
    status.value = 'error';
  } finally {
    isDeleting.value = false;
  }
}

async function loadNote(): Promise<void> {
  const requestId = ++currentRequestId;
  try {
    const { note } = await lessonNoteApi.getNote(props.lessonId);
    if (requestId !== currentRequestId) return;
    contentHtml.value = note?.contentHtml ?? '';
    status.value = 'idle';
  } catch {
    if (requestId === currentRequestId) status.value = 'error';
  }
}

onMounted(() => {
  void loadNote();
});

onUnmounted(() => {
  clearDebounce();
  currentRequestId++;
});

// Khi đổi bài học → tải lại ghi chú tương ứng.
watch(() => props.lessonId, () => {
  clearDebounce();
  void loadNote();
});
</script>

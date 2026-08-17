<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="hearts-empty-overlay fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hearts-empty-title"
        @click.self="close"
      >
        <div class="hearts-empty-modal w-full max-w-sm bg-bg-surface border border-border-default rounded-2xl shadow-2xl p-6 text-center text-text-primary">
          <BaseIcon name="heart" class="w-10 h-10 text-accent-red mx-auto" />
          <h2 id="hearts-empty-title" class="text-base font-bold mt-3">Bạn đã hết Tim!</h2>
          <p class="text-xs text-text-secondary mt-2 leading-relaxed">
            Mỗi Tim hồi phục sau 30 phút. Hãy nghỉ ngơi một chút và quay lại học tiếp nhé.
          </p>

          <div class="mt-4 rounded-xl bg-bg-secondary border border-border-subtle p-3">
            <p class="text-[11px] text-text-muted">Tim hiện tại</p>
            <p class="text-lg font-black text-text-primary tabular-nums">{{ hearts }}/{{ heartsMax }}</p>
            <p v-if="nextHeartAt" class="text-[11px] text-accent mt-1">
              Tim kế tiếp hồi lúc {{ formatTime(nextHeartAt) }}
            </p>
          </div>

          <button
            class="mt-5 w-full py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-white text-sm font-bold cursor-pointer"
            @click="close"
          >
            Tôi sẽ quay lại sau
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useLearningPathStore } from '../store/useLearningPathStore';

const props = withDefaults(defineProps<{
  modelValue: boolean;
}>(), {
  modelValue: false,
});

void props;

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const store = useLearningPathStore();
const { hearts, heartsMax, nextHeartAt } = storeToRefs(store);

function close(): void {
  emit('update:modelValue', false);
  store.dismissHeartsEmpty();
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>

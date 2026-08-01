<template>
  <Transition name="modal">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="close"
    >
      <div class="bg-bg-secondary rounded-xl border border-border-subtle shadow-2xl max-w-md w-full p-6">
        <h2 class="text-xl font-bold text-text-primary mb-2">🚧 {{ title }}</h2>
        <p class="text-text-secondary text-sm mb-4">{{ message }}</p>
        <div class="flex justify-end gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
            @click="close"
          >
            Đóng
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
            @click="onSaveStub"
          >
            Lưu (Stub)
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">








interface Props {
  show: boolean;
  editingHint: any | null;
  parentCodelab: any | null;
  title?: string;
  message?: string;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'save', data: any): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Modal Hint đang được tái cấu trúc',
  message:
    'Chức năng thêm/sửa hint (tiered hoặc thường) hiện chưa khả dụng. Khi hoàn tất tái cấu trúc, bạn có thể cấu hình hint kèm XP cost tại đây. Bấm "Lưu (Stub)" sẽ gửi lại dữ liệu hiện tại để flow không bị gãy.',
});

const emit = defineEmits<Emits>();

function close() {
  emit('update:show', false);
}

function onSaveStub() {
  emit('save', props.editingHint ?? {});
  close();
}
</script>

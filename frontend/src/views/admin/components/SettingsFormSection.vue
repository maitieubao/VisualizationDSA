<template>
  <section class="settings-form-section rounded-xl border border-border-subtle bg-bg-secondary p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-bold text-text-primary flex items-center gap-2">
        <BaseIcon name="tool" class="w-4 h-4 text-accent" />
        Cài đặt hệ thống
      </h3>
      <span class="text-[10px] text-text-muted" aria-live="polite">
        <template v-if="isSaving">Đang lưu…</template>
        <template v-else-if="message">{{ message }}</template>
        <template v-else-if="error">{{ error }}</template>
      </span>
    </div>

    <div v-if="isLoading" class="py-6 text-center text-xs text-text-muted">Đang tải cấu hình…</div>

    <div v-else class="space-y-3">
      <div
        v-for="setting in settings"
        :key="setting.key"
        class="setting-row"
      >
        <label class="flex flex-col gap-1" :for="'setting-' + setting.key">
          <span class="text-xs font-semibold text-text-primary">{{ setting.key }}</span>
          <input
            :id="'setting-' + setting.key"
            v-model="setting.value"
            type="text"
            class="mt-1 rounded-lg border border-border-subtle bg-bg-primary px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
          />
        </label>
      </div>

      <button
        class="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isSaving || settings.length === 0"
        @click="save"
      >
        <BaseIcon v-if="isSaving" name="spinner" class="animate-spin w-3.5 h-3.5" />
        <BaseIcon v-else name="save" class="w-3.5 h-3.5" />
        {{ isSaving ? 'Đang lưu…' : 'Lưu cấu hình' }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { settingsApi, type SystemSettingDto } from '../../../services/settingsApi';

const settings = ref<SystemSettingDto[]>([]);
const isLoading = ref<boolean>(false);
const isSaving = ref<boolean>(false);
const message = ref<string>('');
const error = ref<string>('');

async function load(): Promise<void> {
  isLoading.value = true;
  error.value = '';
  try {
    const data = await settingsApi.getSettings();
    settings.value = data.map((s) => ({ key: s.key, value: s.value }));
  } catch {
    error.value = 'Không tải được cấu hình hệ thống.';
  } finally {
    isLoading.value = false;
  }
}

async function save(): Promise<void> {
  if (isSaving.value) return;
  isSaving.value = true;
  message.value = '';
  error.value = '';
  try {
    await settingsApi.updateSettings(settings.value.map((s) => ({ key: s.key, value: s.value })));
    message.value = 'Đã lưu cấu hình thành công.';
  } catch {
    error.value = 'Lưu cấu hình thất bại.';
  } finally {
    isSaving.value = false;
  }
}

onMounted(() => {
  void load();
});
</script>

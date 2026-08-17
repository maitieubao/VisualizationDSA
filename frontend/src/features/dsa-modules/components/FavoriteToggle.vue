<template>
  <button
    type="button"
    class="favorite-toggle inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold transition-colors"
    :class="isFavorite
      ? 'border-accent-yellow/40 bg-accent-yellow/15 text-accent-yellow'
      : 'border-border-subtle bg-bg-surface text-text-muted hover:text-text-primary'"
    :aria-pressed="isFavorite"
    :aria-label="isFavorite ? 'Bỏ yêu thích mô phỏng' : 'Yêu thích mô phỏng'"
    @click="toggle"
  >
    <BaseIcon name="star" class="w-3.5 h-3.5" />
    <span>{{ isFavorite ? 'Đã yêu thích' : 'Yêu thích' }}</span>
  </button>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { favoriteApi } from '../../../services/favoriteApi';

const props = defineProps<{
  simulationKey: string;
  inputJson?: string | null;
}>();

const isFavorite = ref<boolean>(false);

async function toggle(): Promise<void> {
  try {
    if (isFavorite.value) {
      await favoriteApi.removeFavorite(props.simulationKey);
      isFavorite.value = false;
    } else {
      await favoriteApi.addFavorite(props.simulationKey, props.inputJson ?? undefined);
      isFavorite.value = true;
    }
  } catch {
    // Giữ nguyên trạng thái hiện tại khi gọi API thất bại.
  }
}

async function refresh(): Promise<void> {
  try {
    const favorites = await favoriteApi.getFavorites();
    isFavorite.value = favorites.some((f) => f.simulationKey === props.simulationKey);
  } catch {
    isFavorite.value = false;
  }
}

onMounted(() => {
  void refresh();
});

// Khi đổi simulation → kiểm tra lại trạng thái yêu thích.
watch(() => props.simulationKey, () => {
  void refresh();
});
</script>

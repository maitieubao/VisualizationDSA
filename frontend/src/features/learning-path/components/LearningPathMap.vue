<template>
  <div class="learning-path-map p-4 bg-bg-secondary border border-border-subtle rounded-xl space-y-4 text-text-primary">
    <div v-if="isLoadingMap" class="text-xs text-text-muted">Đang tải lộ trình học...</div>
    <div v-else-if="error && !currentPath" class="text-xs text-accent-red">{{ error }}</div>

    <template v-else-if="currentPath">
      <div class="flex items-center justify-between gap-2">
        <div>
          <h3 class="text-sm font-bold">{{ currentPath.title }}</h3>
          <p v-if="currentPath.description" class="text-[11px] text-text-secondary mt-0.5">
            {{ currentPath.description }}
          </p>
        </div>
        <button
          class="text-[11px] text-text-muted hover:text-text-primary cursor-pointer flex items-center gap-1"
          @click="reload"
        >
          <BaseIcon name="refresh" class="w-3 h-3" />
          Tải lại
        </button>
      </div>

      <!-- Bản đồ node tuần tự -->
      <ol class="space-y-3">
        <li
          v-for="node in nodes"
          :key="node.id"
          class="rounded-lg border p-3 flex flex-col gap-2 transition-colors"
          :class="nodeCardClass(node)"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <span
                class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                :class="nodeNumberClass(node)"
              >
                {{ node.orderIndex }}
              </span>
              <span class="text-xs font-bold truncate">{{ node.title }}</span>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" :class="badgeClass(node)">
              {{ badgeLabel(node) }}
            </span>
          </div>

          <div v-if="node.stars > 0" class="flex items-center gap-0.5 text-accent-yellow">
            <BaseIcon
              v-for="i in node.stars"
              :key="i"
              name="star"
              class="w-3.5 h-3.5"
            />
          </div>

          <p v-if="node.session?.isActive" class="text-[10px] text-accent-green">
            Phiên học còn hiệu lực tới {{ formatTime(node.session.expiresAt) }}
          </p>

          <button
            v-if="canEnter(node)"
            :disabled="isEntering"
            class="mt-auto px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-dark text-white text-[11px] font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            @click="enterNode(node)"
          >
            {{ isEntering ? 'Đang vào...' : node.status === 2 ? 'Ôn tập lại' : 'Vào học' }}
          </button>
          <span v-else-if="node.status === 0" class="text-[10px] text-text-muted">
            Hoàn thành node trước để mở khóa.
          </span>
        </li>
      </ol>

      <p v-if="error" class="text-[11px] text-accent-red">{{ error }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useLearningPathStore } from '../store/useLearningPathStore';
import type { LearningPathNodeDto } from '../../../services/learningPathApi';

const props = withDefaults(defineProps<{
  pathId: string;
}>(), {});

const router = useRouter();
const store = useLearningPathStore();

const {
  currentPath,
  nodes,
  isLoadingMap,
  isEntering,
  error,
} = storeToRefs(store);

onMounted(() => {
  void store.loadMap(props.pathId);
});

const orderedNodes = computed(() =>
  [...nodes.value].sort((a, b) => a.orderIndex - b.orderIndex),
);

function reload(): void {
  void store.loadMap(props.pathId);
}

function canEnter(node: LearningPathNodeDto): boolean {
  return node.status === 1 || node.status === 2;
}

function nodeCardClass(node: LearningPathNodeDto): string {
  if (node.status === 2) return 'border-accent-green/40 bg-accent-green/5';
  if (node.status === 0) return 'border-border-subtle bg-bg-surface opacity-60';
  return 'border-accent/30 bg-bg-surface';
}

function nodeNumberClass(node: LearningPathNodeDto): string {
  if (node.status === 2) return 'bg-accent-green/20 text-accent-green';
  if (node.status === 0) return 'bg-bg-hover text-text-muted';
  return 'bg-accent/20 text-accent';
}

function badgeClass(node: LearningPathNodeDto): string {
  if (node.status === 2) return 'bg-accent-green/20 text-accent-green';
  if (node.status === 0) return 'bg-bg-hover text-text-muted';
  return 'bg-accent/20 text-accent';
}

function badgeLabel(node: LearningPathNodeDto): string {
  if (node.status === 2) return 'Đã pass';
  if (node.status === 0) return 'Khóa';
  return 'Mở';
}

async function enterNode(node: LearningPathNodeDto): Promise<void> {
  const ok = await store.enterNode(props.pathId, node.id);
  if (ok && node.lessonId) {
    void router.push(`/lessons/${node.lessonId}`);
  }
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

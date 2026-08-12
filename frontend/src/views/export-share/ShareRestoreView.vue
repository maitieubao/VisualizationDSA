<template>
  <section class="flex-1 min-h-0 share-restore-root">
    <div v-if="errorMessage" class="share-restore-card share-restore-error" role="alert">
      <h2 class="share-restore-title">KHÔNG THỂ KHÔI PHỤC PHÒNG LAB</h2>
      <p class="share-restore-desc">{{ errorMessage }}</p>
      <button type="button" class="share-restore-btn" @click="goToWorkspace">
        QUAY VỀ TRANG EXPORT / SHARE
      </button>
    </div>

    <div v-else-if="restoredState" class="share-restore-card">
      <h2 class="share-restore-title">PHÒNG LAB ĐƯỢC CHIA SẺ</h2>
      <p class="share-restore-desc">
        Thuật toán:
        <code class="share-restore-code">{{ restoredState.algorithmId }}</code>
        · {{ restoredState.layoutNodes.length }} node · bước
        {{ restoredState.currentStepIndex }}
      </p>

      <div class="share-restore-preview">
        <svg
          viewBox="0 0 800 500"
          class="share-restore-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="800" height="500" fill="none" />
          <g v-for="node in restoredState.layoutNodes" :key="node.id">
            <rect
              :x="node.x - 60"
              :y="node.y - 20"
              width="120"
              height="40"
              rx="10"
              fill="color-mix(in srgb, var(--color-bg-primary) 80%, transparent)"
              stroke="var(--color-accent-cyan)"
              stroke-width="1.5"
            />
            <text
              :x="node.x"
              :y="node.y + 5"
              text-anchor="middle"
              font-family="JetBrains Mono, monospace"
              font-size="12"
              fill="var(--color-text-primary)"
            >
              {{ node.id }}
            </text>
          </g>
        </svg>
      </div>

      <button type="button" class="share-restore-btn" @click="openInWorkspace">
        MỞ TRONG PHÒNG LAB
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { WorkspaceStateCompressor } from '../../features/export-share';
import type { WorkspaceState } from '../../features/export-share/types/export-share.types';

// EX-002: route /s/ nhận ?state= (payload lz-string URI-safe) → deserialize →
// khôi phục workspace phòng lab → hiển thị lại; state hỏng/thiếu → error state rõ ràng.
const route = useRoute();
const router = useRouter();

const restoredState = ref<WorkspaceState | null>(null);
const errorMessage = ref('');

function readStateParam(value: unknown): string {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : '';
  }
  return typeof value === 'string' ? value : '';
}

function isValidWorkspaceState(state: WorkspaceState | null): state is WorkspaceState {
  if (!state) return false;
  if (typeof state.algorithmId !== 'string' || state.algorithmId.length === 0) return false;
  if (!Array.isArray(state.layoutNodes)) return false;
  for (const node of state.layoutNodes) {
    if (typeof node?.id !== 'string' || node.id.length === 0) return false;
    if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return false;
  }
  return Number.isFinite(state.currentStepIndex);
}

function loadState(): void {
  const raw = readStateParam(route.query.state);

  if (!raw) {
    errorMessage.value =
      'Liên kết không chứa dữ liệu trạng thái (thiếu tham số ?state=). Hãy tạo lại liên kết từ trang Export / Share.';
    restoredState.value = null;
    return;
  }

  const state = WorkspaceStateCompressor.deserializeState(raw);
  if (!isValidWorkspaceState(state)) {
    errorMessage.value =
      'Dữ liệu trạng thái trong liên kết bị hỏng hoặc không hợp lệ. Vui lòng tạo lại liên kết chia sẻ.';
    restoredState.value = null;
    return;
  }

  errorMessage.value = '';
  restoredState.value = state;
}

watch(() => route.query.state, () => loadState(), { immediate: true });

// Serialize lại qua đúng compressor URI-safe để query không bị URLSearchParams
// làm hỏng payload (EX-013) — roundtrip export → restore an toàn.
function openInWorkspace(): void {
  const state = restoredState.value;
  if (!state) return;
  const payload = WorkspaceStateCompressor.serializeState(state);
  void router.push({ path: '/export-share', query: { state: payload } });
}

function goToWorkspace(): void {
  void router.push({ path: '/export-share' });
}
</script>

<style scoped>
.share-restore-root {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  background: var(--color-bg-primary);
}

.share-restore-card {
  width: min(560px, 100vw);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 28px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.7);
}

.share-restore-card.share-restore-error {
  border-color: color-mix(in srgb, var(--color-accent-red) 40%, transparent);
}

.share-restore-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-accent-cyan);
  text-shadow: 0 0 10px color-mix(in srgb, var(--color-accent-cyan) 20%, transparent);
  text-align: center;
}

.share-restore-card.share-restore-error .share-restore-title {
  color: var(--color-accent-red);
  text-shadow: 0 0 10px color-mix(in srgb, var(--color-accent-red) 20%, transparent);
}

.share-restore-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  text-align: center;
  line-height: 1.6;
}

.share-restore-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--color-accent-primary);
  word-break: break-all;
}

.share-restore-preview {
  padding: 12px;
  background: color-mix(in srgb, var(--color-bg-primary) 50%, transparent);
  border: 1px solid var(--color-border-default);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-restore-svg {
  width: 100%;
  max-width: 720px;
  height: auto;
}

.share-restore-btn {
  padding: 12px 24px;
  border-radius: 12px;
  border: 1px solid var(--color-accent-cyan);
  background: color-mix(in srgb, var(--color-accent-cyan) 10%, transparent);
  color: var(--color-accent-cyan);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.share-restore-btn:hover {
  background: color-mix(in srgb, var(--color-accent-cyan) 20%, transparent);
  box-shadow: 0 0 15px color-mix(in srgb, var(--color-accent-cyan) 20%, transparent);
}
</style>

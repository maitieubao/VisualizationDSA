<template>
  <Transition name="vcr-banner-fade" mode="out-in">
    <div v-if="actionType && explanation" :key="frameKey" class="vcr-banner vcr-frame-enter">
      <span class="vcr-banner__action">{{ actionType }}</span>
      <span class="vcr-banner__text" v-html="parseEmojiToSvg(explanation)"></span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { parseEmojiToSvg } from '../utils/emojiParser';

defineProps<{
  actionType: string;
  explanation: string;
  frameKey: number;
}>();
</script>

<style scoped>
.vcr-banner {
  background: var(--vcr-accent-bg);
  border: 1px solid var(--vcr-accent-dim);
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.vcr-banner__action {
  font-size: 11px;
  font-weight: 700;
  color: var(--vcr-accent);
  background: var(--vcr-accent-badge);
  padding: 3px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.vcr-banner__text {
  font-size: 13px;
  color: #cbd5e1;
}
</style>

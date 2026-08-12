<template>
  <!-- CU-029: với tên icon TRÙNG BaseIcon → alias render qua BaseIcon (1 nguồn path data);
       kích thước + màu được giữ nguyên bằng wrapper span định cỡ. -->
  <span
    v-if="isBaseIconName"
    class="svg-icon svg-icon-alias"
    :class="iconClass"
    :style="aliasStyle"
  >
    <BaseIcon :name="name" :class="iconClass" />
  </span>
  <!-- SvgIcon-specific name (target, book...) → render từ SVG_PATHS (emojiParser). -->
  <svg
    v-else
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :stroke="color"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="svg-icon"
    :class="iconClass"
    v-html="pathData"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseIcon from '../../shared/components/BaseIcon.vue';
import { SVG_PATHS } from '../../utils/emojiParser';

// CU-029: tập tên icon mà CẢ BaseIcon template LẪN SVG_PATHS đang định nghĩa —
// các tên này render qua BaseIcon để không còn 2 nguồn path data trùng lặp.
// (Phải đồng bộ thủ công khi thêm icon vào BaseIcon.)
const BASE_ICON_NAMES: ReadonlySet<string> = new Set([
  'academic', 'arrow-down', 'arrow-left', 'arrow-right', 'arrow-up',
  'arrows-horizontal', 'atom', 'bell', 'book-open', 'calendar',
  'chart-bar', 'check', 'check-circle', 'clipboard-list', 'cog',
  'construction', 'corner-up-left', 'crown', 'database', 'dice',
  'download', 'eye', 'flag', 'flask', 'folder', 'heart', 'help-circle',
  'hourglass', 'info', 'key', 'link', 'lock', 'masks', 'medal',
  'message-circle', 'minus', 'monitor', 'palette', 'party-popper',
  'pause', 'play', 'puzzle', 'refresh-ccw', 'refresh-cw', 'rocket',
  'scales', 'search', 'shield', 'skip-forward', 'snowflake',
  'step-backward', 'step-forward', 'timer', 'trash', 'tree', 'trophy',
  'upload', 'user', 'users', 'warning', 'x-circle', 'zap',
]);

const props = withDefaults(defineProps<{
  name: string;
  size?: number | string;
  color?: string;
}>(), {
  size: 16,
  color: 'currentColor',
});

const iconClass = computed(() => `icon-${props.name}`);
const isBaseIconName = computed(() => BASE_ICON_NAMES.has(props.name));

const icons: Record<string, string> = SVG_PATHS;

const pathData = computed(() => icons[props.name] ?? icons['x-circle']);

// CU-029: wrapper định cỡ + truyền màu — BaseIcon stroke currentColor nên kế thừa color span.
const aliasStyle = computed(() => ({
  display: 'inline-flex',
  width: typeof props.size === 'number' ? `${props.size}px` : props.size,
  height: typeof props.size === 'number' ? `${props.size}px` : props.size,
  color: props.color,
}));
</script>

<style scoped>
.svg-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}

/* CU-029: svg BaseIcon bên trong wrapper lấp đầy kích thước đã định cỡ. */
.svg-icon-alias :deep(svg.base-icon) {
  width: 100%;
  height: 100%;
}
</style>

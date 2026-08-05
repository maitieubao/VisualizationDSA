<template>
  <svg
    :viewBox="VIEW_BOX"
    class="course-cover-svg w-full h-full block"
    preserveAspectRatio="xMidYMid slice"
    role="img"
    :aria-label="`Ảnh bìa khóa học ${course.title}`"
  >
    <defs>
      <linearGradient :id="gradId" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" :stop-color="theme.from" />
        <stop offset="1" :stop-color="theme.to" />
      </linearGradient>
    </defs>

    <rect :fill="`url(#${gradId})`" width="100%" height="100%" />
    <circle cx="88%" cy="12%" r="34%" fill="rgba(255,255,255,0.09)" />
    <circle cx="6%" cy="96%" r="28%" fill="rgba(0,0,0,0.14)" />
    <circle cx="60%" cy="-8%" r="18%" fill="rgba(255,255,255,0.06)" />

    <g fill="rgba(255,255,255,0.88)" transform="translate(150 82)">

      <g v-if="iconKey === 'sorting'" transform="translate(-62 -28)">
        <rect x="0" y="34" width="22" height="22" rx="4" />
        <rect x="28" y="12" width="22" height="44" rx="4" />
        <rect x="56" y="46" width="22" height="10" rx="4" />
        <rect x="84" y="0" width="22" height="56" rx="4" />
        <rect x="112" y="24" width="22" height="32" rx="4" />
      </g>

      <g v-else-if="iconKey === 'searching'" transform="translate(-40 -34)" stroke="rgba(255,255,255,0.88)" fill="none" stroke-width="9">
        <circle cx="34" cy="34" r="26" />
        <line x1="53" y1="53" x2="78" y2="78" stroke-linecap="round" />
      </g>

      <g v-else-if="iconKey === 'tree'" transform="translate(-55 -38)" fill="none" stroke="rgba(255,255,255,0.88)" stroke-width="6">
        <line x1="55" y1="28" x2="28" y2="56" stroke-linecap="round" />
        <line x1="55" y1="28" x2="82" y2="56" stroke-linecap="round" />
        <line x1="28" y1="56" x2="16" y2="78" stroke-linecap="round" />
        <line x1="28" y1="56" x2="40" y2="78" stroke-linecap="round" />
        <line x1="82" y1="56" x2="70" y2="78" stroke-linecap="round" />
        <line x1="82" y1="56" x2="94" y2="78" stroke-linecap="round" />
        <circle cx="55" cy="28" r="12" fill="rgba(255,255,255,0.88)" stroke="none" />
        <circle cx="28" cy="56" r="9" fill="rgba(255,255,255,0.88)" stroke="none" />
        <circle cx="82" cy="56" r="9" fill="rgba(255,255,255,0.88)" stroke="none" />
        <circle cx="16" cy="78" r="7" fill="rgba(255,255,255,0.7)" stroke="none" />
        <circle cx="40" cy="78" r="7" fill="rgba(255,255,255,0.7)" stroke="none" />
        <circle cx="70" cy="78" r="7" fill="rgba(255,255,255,0.7)" stroke="none" />
        <circle cx="94" cy="78" r="7" fill="rgba(255,255,255,0.7)" stroke="none" />
      </g>

      <g v-else-if="iconKey === 'oop'" transform="translate(-58 -30)">
        <rect x="0" y="0" width="26" height="60" rx="5" opacity="0.95" />
        <rect x="30" y="14" width="26" height="46" rx="5" opacity="0.75" />
        <rect x="60" y="8" width="26" height="52" rx="5" opacity="0.85" />
        <rect x="90" y="20" width="26" height="40" rx="5" opacity="0.65" />
      </g>

      <g v-else-if="iconKey === 'solid'" transform="translate(-62 -30)">
        <rect x="0" y="14" width="24" height="46" rx="4" />
        <rect x="26" y="0" width="24" height="60" rx="4" opacity="0.85" />
        <rect x="52" y="20" width="24" height="40" rx="4" opacity="0.7" />
        <rect x="78" y="8" width="24" height="52" rx="4" opacity="0.8" />
        <rect x="104" y="28" width="24" height="32" rx="4" opacity="0.6" />
      </g>

      <g v-else-if="iconKey === 'patterns'" transform="translate(-60 -32)">
        <rect x="0" y="0" width="30" height="30" rx="6" />
        <rect x="34" y="0" width="30" height="30" rx="6" opacity="0.8" />
        <rect x="68" y="0" width="30" height="30" rx="6" opacity="0.6" />
        <rect x="0" y="34" width="30" height="30" rx="6" opacity="0.6" />
        <rect x="34" y="34" width="30" height="30" rx="6" opacity="0.9" />
        <rect x="68" y="34" width="30" height="30" rx="6" opacity="0.7" />
      </g>

      <g v-else-if="iconKey === 'system'" transform="translate(-58 -30)">
        <rect x="0" y="0" width="116" height="26" rx="6" />
        <circle cx="14" cy="13" r="3.5" fill="rgba(0,0,0,0.35)" />
        <circle cx="30" cy="13" r="3.5" fill="rgba(0,0,0,0.35)" />
        <rect x="0" y="34" width="116" height="26" rx="6" opacity="0.75" />
        <circle cx="14" cy="47" r="3.5" fill="rgba(0,0,0,0.35)" />
        <circle cx="30" cy="47" r="3.5" fill="rgba(0,0,0,0.35)" />
      </g>

      <g v-else-if="iconKey === 'di'" transform="translate(-60 -30)">
        <circle cx="14" cy="30" r="12" fill="rgba(255,255,255,0.9)" />
        <circle cx="100" cy="30" r="12" fill="rgba(255,255,255,0.9)" />
        <circle cx="57" cy="6" r="10" fill="rgba(255,255,255,0.75)" />
        <circle cx="57" cy="54" r="10" fill="rgba(255,255,255,0.75)" />
        <g stroke="rgba(255,255,255,0.9)" stroke-width="6" fill="none">
          <line x1="25" y1="26" x2="48" y2="10" stroke-linecap="round" />
          <line x1="25" y1="34" x2="48" y2="50" stroke-linecap="round" />
          <line x1="67" y1="10" x2="89" y2="26" stroke-linecap="round" />
          <line x1="67" y1="50" x2="89" y2="34" stroke-linecap="round" />
        </g>
      </g>

      <g v-else transform="translate(-48 -30)" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="8" stroke-linecap="round">
        <path d="M14 14 L38 30 L14 46" />
        <path d="M48 14 L24 30 L48 46" transform="translate(52 0)" />
        <line x1="88" y1="8" x2="96" y2="52" opacity="0.7" />
      </g>

    </g>

    <text
      x="12"
      y="150"
      font-family="'JetBrains Mono', Consolas, monospace"
      font-size="13"
      font-weight="700"
      fill="rgba(255,255,255,0.5)"
      letter-spacing="1.5"
    >
      {{ badgeLabel }}
    </text>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const VIEW_BOX = '0 0 300 160';

/** Kiểu dữ liệu tối thiểu — chấp nhận cả Course (frontend) và DTO course detail (backend). */
export interface CoverCourse {
  id: string;
  title: string;
  category?: string;
}

const props = defineProps<{
  course: CoverCourse;
}>();

interface CoverTheme {
  from: string;
  to: string;
}

const THEMES: Record<string, CoverTheme> = {
  'Sorting': { from: '#6366f1', to: '#8b5cf6' },
  'Searching': { from: '#06b6d4', to: '#3b82f6' },
  'DataStructure': { from: '#0ea5e9', to: '#6366f1' },
  'Algorithm': { from: '#f59e0b', to: '#ef4444' },
  'Tree/Graph': { from: '#10b981', to: '#06b6d4' },
  'Graph': { from: '#10b981', to: '#06b6d4' },
  'OOP': { from: '#8b5cf6', to: '#d946ef' },
  'SOLID': { from: '#f59e0b', to: '#f97316' },
  'Patterns': { from: '#ec4899', to: '#8b5cf6' },
  'Design Patterns': { from: '#ec4899', to: '#8b5cf6' },
  'DI/IoC': { from: '#14b8a6', to: '#0ea5e9' },
  'SystemDesign': { from: '#64748b', to: '#334155' },
  'System Design': { from: '#64748b', to: '#334155' },
};

const DEFAULT_THEME: CoverTheme = { from: '#334155', to: '#1e293b' };

const category = computed(() => props.course.category ?? '');

const theme = computed<CoverTheme>(() => THEMES[category.value] ?? DEFAULT_THEME);

const iconKey = computed(() => {
  const c = category.value;
  if (c.includes('Sort')) return 'sorting';
  if (c.includes('Search')) return 'searching';
  if (c.includes('Tree') || c.includes('Graph')) return 'tree';
  if (c.includes('OOP')) return 'oop';
  if (c.includes('SOLID')) return 'solid';
  if (c.includes('Pattern')) return 'patterns';
  if (c.includes('System') || c.includes('Concurrency')) return 'system';
  if (c.includes('DI') || c.includes('IoC')) return 'di';
  return 'code';
});

const badgeLabel = computed(() => {
  const c = category.value;
  if (!c) return 'DSA';
  return c.toUpperCase().slice(0, 14);
});

// Gradient id phải duy nhất theo course để tránh xung đột khi nhiều SVG cùng trang.
const gradId = computed(() => `cover-grad-${props.course.id.replace(/[^a-zA-Z0-9_-]/g, '') || 'default'}`);
</script>

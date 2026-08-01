<template>
  <div
    class="theory-panel"
    :class="{
      open: isOpen,
      'is-desktop-push': isDesktopWide,
      'is-expanded-width': isExpandedWidth
    }"
  >
    <!-- Toggle tab button (shows when collapsed) -->
    <button
      v-if="!isOpen"
      class="theory-toggle-tab"
      @click="toggleOpen"
      title="Mở Lý thuyết & Tài liệu"
    >
      <SvgIcon name="book" :size="15" color="currentColor" class="tab-icon-svg mb-1" />
      <span class="tab-text">Lý thuyết & Tài liệu</span>
    </button>

    <!-- Main Drawer Content -->
    <div class="theory-drawer-content" v-if="isOpen">
      <!-- Header -->
      <div class="drawer-header">
        <div class="flex items-center justify-between w-full">
          <h3 class="drawer-title flex items-center gap-2">
            <SvgIcon name="book" :size="15" color="var(--color-accent-primary)" />
            <span>{{ document?.title || 'Tài liệu Lý thuyết' }}</span>
          </h3>
          <div class="flex items-center gap-3">
            <!-- Expand/Collapse width toggle button -->
            <button
              class="expand-toggle-btn"
              @click="toggleExpandWidth"
              :title="isExpandedWidth ? 'Thu hẹp bảng' : 'Mở rộng bảng'"
            >
              <svg v-if="isExpandedWidth" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" />
              </svg>
              <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
              </svg>
            </button>

            <!-- Close panel button -->
            <button class="close-btn" @click="closePanel" title="Thu gọn (Đóng)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Body Container -->
      <div class="drawer-body" ref="bodyRef">
        <!-- 1. Simplified Core Concept Summary view -->
        <TheorySummaryView
          v-if="!showFullDocs && document"
          :document="document"
          @tagClick="$emit('tagClick', $event)"
          @readMore="showFullDocs = true"
        />

        <!-- 2. Accordion Document Sections list -->
        <div v-else-if="showFullDocs && document" class="accordion-container">
          <TheoryAccordionItem
            v-for="(sec, idx) in document.sections"
            :key="sec.id"
            :sec="sec"
            :idx="idx"
            :active-section-id="activeSectionId"
            :expanded-section-id="expandedSectionId"
            :flashed-section-id="flashedSectionId"
            :is-last="isLastSection(sec.id)"
            :next-pillar-name="nextPillarName"
            @toggle="toggleSection(sec.id)"
            @nextPillar="triggerNextPillar"
          />

          <!-- Bottom Back To Summary toggle -->
          <button class="back-to-summary-footer-btn mt-4" @click="showFullDocs = false">
            ◀ Quay lại Tóm tắt Khái niệm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import type { TheoryDocument } from '@/shared/types/theory.types';
import TheorySummaryView from './TheorySummaryView.vue';
import TheoryAccordionItem from './TheoryAccordionItem.vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';

const props = defineProps<{
  isOpen: boolean;
  document: TheoryDocument | null;
  activeSectionId?: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void;
  (e: 'sectionActivated', sectionId: string): void;
  (e: 'tagClick', tag: string): void;
}>();

const isDesktopWide = ref(false);
const isExpandedWidth = ref(false);
const showFullDocs = ref(false);
const bodyRef = ref<HTMLElement | null>(null);

const expandedSectionId = ref<string | null>(null);
const flashedSectionId = ref<string | null>(null);

function toggleSection(id: string) {
  if (expandedSectionId.value === id) {
    expandedSectionId.value = null; // collapse
  } else {
    expandedSectionId.value = id; // expand
    emit('sectionActivated', id);
  }
}

// Next pillar names map
const PILLAR_NAMES: Record<string, string> = {
  encapsulation: 'Tính Kế Thừa',
  inheritance: 'Tính Đa Hình',
  polymorphism: 'Tính Trừu Tượng',
  abstraction: 'Interface',
  interface: 'Tính Đóng Gói (Xem lại)'
};

const nextPillarName = computed(() => {
  if (!props.document?.id) return 'Trụ cột mới';
  const curr = props.document.id.replace('theory-', '');
  return PILLAR_NAMES[curr] || 'Trụ cột tiếp theo';
});

function isLastSection(id: string): boolean {
  if (!props.document) return false;
  const len = props.document.sections.length;
  return len > 0 && props.document.sections[len - 1].id === id;
}

function triggerNextPillar() {
  const event = new CustomEvent('advance-oop-pillar');
  window.dispatchEvent(event);
}

// Toggle panel state
function toggleOpen() {
  emit('update:isOpen', !props.isOpen);
  triggerResizeAfterAnimation();
}

function closePanel() {
  emit('update:isOpen', false);
  triggerResizeAfterAnimation();
}

function toggleExpandWidth() {
  isExpandedWidth.value = !isExpandedWidth.value;
  triggerResizeAfterAnimation();
}

function triggerResizeAfterAnimation() {
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 320);
}

const checkWidth = () => {
  isDesktopWide.value = window.innerWidth >= 1700;
};

onMounted(() => {
  checkWidth();
  window.addEventListener('resize', checkWidth);
  if (props.document?.sections.length) {
    expandedSectionId.value = props.document.sections[0].id;
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', checkWidth);
});

// Switch documents: reset view to summary
watch(() => props.document, (newDoc) => {
  showFullDocs.value = false;
  if (newDoc?.sections.length) {
    expandedSectionId.value = newDoc.sections[0].id;
  } else {
    expandedSectionId.value = null;
  }
});

// Auto-expand showFullDocs when active section is synced from scenario player steps
watch(() => props.activeSectionId, (newId) => {
  if (newId) {
    const isIntro = ['encap-concept', 'inherit-concept', 'poly-concept', 'abstract-concept', 'interface-concept'].includes(newId);
    if (!isIntro) {
      showFullDocs.value = true;
    }
    expandedSectionId.value = newId;
    scrollToSection(newId);
  }
});

function scrollToSection(id: string) {
  nextTick(() => {
    const el = document.getElementById(`sec-pane-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      flashedSectionId.value = id;
      setTimeout(() => {
        if (flashedSectionId.value === id) {
          flashedSectionId.value = null;
        }
      }, 2000);
    }
  });
}
</script>

<style scoped>
/* ==================== PANEL SIDEBAR CONTAINER ==================== */
.theory-panel {
  position: fixed;
  right: 0;
  top: 56px;
  height: calc(100vh - 56px);
  width: 420px;
  min-width: 380px;
  max-width: 550px;
  z-index: 99;
  background: color-mix(in srgb, var(--color-bg-secondary) 96%, transparent);
  border-left: 1px solid var(--color-border-subtle);
  transform: translateX(100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-2xl);
  backdrop-filter: blur(20px);
  min-height: 0;
  max-height: 100%;
}

.theory-panel.open {
  transform: translateX(0);
}

.theory-panel.is-expanded-width {
  width: 50vw !important;
  max-width: 800px !important;
}

/* Wide Desktop Push configuration */
@media (min-width: 1700px) {
  .theory-panel.is-desktop-push.open {
    position: relative;
    top: 0;
    height: 100%;
    transform: none;
    flex-shrink: 0;
    box-shadow: none;
    border-radius: var(--radius-2xl);
  }
  .theory-panel.is-desktop-push:not(.open) {
    display: none;
  }
}

/* ==================== TOGGLE TAB BUTTON ==================== */
.theory-toggle-tab {
  position: absolute;
  left: -40px;
  top: 140px;
  width: 40px;
  padding: 16px 8px;
  background: var(--color-accent-primary);
  border: 1px solid var(--color-border-subtle);
  border-right: none;
  border-radius: var(--radius-lg) 0 0 var(--radius-lg);
  color: white;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-shadow: -4px 0 16px var(--color-accent-primary-glow);
  z-index: 10;
  transition: all 0.2s ease;
}

.theory-toggle-tab:hover {
  background: var(--color-accent-primary-light);
  left: -42px;
}

.tab-icon {
  font-size: 14px;
}

.tab-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 10px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
}

/* ==================== DRAWER BODY & CONTENT ==================== */
.theory-drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  min-height: 0;
}

.drawer-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-subtle);
  background: color-mix(in srgb, var(--color-bg-surface) 40%, transparent);
  flex-shrink: 0;
}

.drawer-title {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.expand-toggle-btn, .close-btn {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.expand-toggle-btn:hover {
  color: var(--color-accent-cyan);
}

.close-btn:hover {
  color: var(--color-accent-red-light);
}

/* ==================== DRAWER SCROLLABLE BODY ==================== */
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  background: color-mix(in srgb, var(--color-bg-secondary) 30%, transparent);
  min-height: 0;
}

.accordion-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.back-to-summary-footer-btn {
  background: transparent;
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text-muted);
  font-size: 10.5px;
  font-weight: 700;
  padding: 8px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: center;
}

.back-to-summary-footer-btn:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-secondary);
}
</style>

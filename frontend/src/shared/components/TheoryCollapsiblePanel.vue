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
import type { TheoryDocument } from '../types/theory.types';
import TheorySummaryView from './TheorySummaryView.vue';
import TheoryAccordionItem from './TheoryAccordionItem.vue';
import SvgIcon from '../../components/icons/SvgIcon.vue';

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
@import "./TheoryCollapsiblePanel.css";
</style>

<template>
  <div ref="sidebarRef" class="curriculum-sidebar bg-bg-secondary border border-border-subtle rounded-2xl p-4 h-full max-h-[calc(100vh-120px)] overflow-y-auto sticky top-24">
    
    <div class="mb-6 p-4 bg-bg-secondary border border-border-subtle rounded-xl">
      <h3 class="text-sm font-bold text-text-primary mb-3">Tiến độ tổng thể</h3>
      <div class="w-full h-2 bg-bg-surface rounded-full overflow-hidden mb-2">
        <div 
          class="h-full bg-gradient-to-r from-accent to-accent-purple transition-all duration-500" 
          :style="{ width: overallProgress + '%' }"
        ></div>
      </div>
      <div class="flex justify-between text-xs text-text-muted">
        <span>{{ completedItems }}/{{ totalItems }} bài học đã hoàn thành</span>
        <span>{{ overallProgress }}%</span>
      </div>
    </div>

    
    <div class="space-y-3">
      <div 
        v-for="module in visibleModules" 
        :key="module.id"
        class="module-accordion"
        :class="{ 'module-locked': isModuleLocked(module) }"
      >
        
        <button
          type="button"
          class="module-header w-full flex items-center justify-between p-3 rounded-xl transition-colors"
          :class="[
            isModuleExpanded(module.id) ? 'bg-bg-hover' : 'hover:bg-bg-hover',
            isModuleLocked(module) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          ]"
          @click="toggleModule(module.id)"
          :disabled="isModuleLocked(module)"
        >
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <div class="flex items-center justify-center w-8 h-8 rounded-lg" :class="getModuleStatusClass(module)">
              <span v-if="isModuleCompleted(module)" class="text-accent-green text-lg"><BaseIcon name="check" class="w-4 h-4" /></span>
              <span v-else-if="isModuleLocked(module)" class="text-text-muted"><BaseIcon name="lock" class="w-3.5 h-3.5" /></span>
              <span v-else class="text-accent font-bold text-sm">{{ getModuleIndex(module.id) + 1 }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-text-primary truncate">{{ module.title }}</h4>
              <div class="flex items-center gap-2 mt-1 text-xs text-text-muted">
                <span>{{ visibleItems(module).length }} bài</span>
                <span v-if="module.unlockAt" class="flex items-center gap-1">
                  <BaseIcon name="clock" class="w-3 h-3" />
                  {{ formatDate(module.unlockAt) }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <span class="text-xs text-text-muted font-mono">
              {{ getModuleCompletedCount(module) }}/{{ visibleItems(module).length }}
            </span>
            <BaseIcon 
              :name="isModuleExpanded(module.id) ? 'chevron-up' : 'chevron-down'" 
              class="w-4 h-4 text-text-muted transition-transform"
            />
          </div>
        </button>

        
        <div 
          v-show="isModuleExpanded(module.id) && !isModuleLocked(module)"
          class="module-items mt-2 ml-4 border-l border-border-subtle pl-4 space-y-2 animate-slide-down"
        >
          <div 
            v-for="item in visibleItems(module)" 
            :key="item.id"
            class="curriculum-item"
            :data-item-id="item.id"
            role="button"
            tabindex="0"
            :aria-disabled="isItemLocked(item)"
            :aria-label="(isItemLocked(item) ? 'Đã khóa: ' : 'Mở: ') + itemDisplayTitle(item)"
            :title="isItemLocked(item) ? lockedReason(item) : undefined"
            :class="[
              'flex items-center gap-3 p-3 rounded-xl transition-colors',
              getItemStatusClass(item),
              isItemLocked(item) ? 'cursor-not-allowed' : 'cursor-pointer',
              currentItemId === item.id ? 'bg-accent/10 border border-accent/20' : 'hover:bg-bg-hover'
            ]"
            @click="onItemClick(item)"
            @keydown.enter.prevent="onItemClick(item)"
            @keydown.space.prevent="onItemClick(item)"
          >
            
            <div class="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0" :class="getItemStatusBgClass(item)">
              <BaseIcon 
                v-if="isItemCompleted(item)" 
                name="check" 
                class="w-4 h-4 text-accent-green" 
              />
              <BaseIcon 
                v-else-if="isItemLocked(item)" 
                name="lock" 
                class="w-4 h-4 text-text-muted" 
              />
              <BaseIcon 
                v-else-if="item.itemType === 'Lesson'" 
                name="book-open" 
                class="w-4 h-4 text-accent" 
              />
              <BaseIcon 
                v-else-if="item.itemType === 'Quiz'" 
                name="help-circle" 
                class="w-4 h-4 text-accent-purple" 
              />
              <BaseIcon 
                v-else-if="item.itemType === 'Codelab'" 
                name="code" 
                class="w-4 h-4 text-accent-green" 
              />
              <BaseIcon 
                v-else-if="item.itemType === 'CustomLesson'" 
                name="file-text" 
                class="w-4 h-4 text-accent-yellow" 
              />
            </div>

            
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h5 class="font-medium text-text-primary truncate">{{ itemDisplayTitle(item) }}</h5>
                <span class="badge text-[10px]" :class="getTypeBadgeClass(item.itemType)">{{ typeLabel(item.itemType) }}</span>
                <span v-if="item.isRequired" class="badge badge-rose text-[10px]">Bắt buộc</span>
                <span v-if="item.isHidden" class="badge badge-slate text-[10px]">Ẩn</span>
              </div>
              
              <div class="flex items-center gap-3 mt-1 text-[11px] text-text-muted">
                <span v-if="item.unlockAt" class="flex items-center gap-1">
                  <BaseIcon name="clock" class="w-3 h-3" />
                  {{ formatDate(item.unlockAt) }}
                </span>
                <span v-if="item.dueAt" class="flex items-center gap-1">
                  <BaseIcon name="calendar" class="w-3 h-3" />
                  {{ formatDate(item.dueAt) }}
                </span>
                <span v-if="item.maxAttempts" class="flex items-center gap-1">
                  <BaseIcon name="refresh-cw" class="w-3 h-3" />
                  {{ item.maxAttempts }} lần
                </span>
              </div>
            </div>

            
            <div class="flex items-center gap-2 shrink-0">
              <span v-if="isItemCompleted(item)" class="text-accent-green text-xs font-bold flex items-center gap-1">
                <BaseIcon name="check-circle" class="w-3 h-3" /> Hoàn thành
              </span>
              <span v-else-if="isItemLocked(item)" class="text-text-muted text-xs">Đã khóa</span>
              <span v-else class="text-accent text-xs font-medium">Chưa làm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';

interface Props {
  classroomId: string;
  curriculum: any;
  currentItemId: string | null;
}

interface Emits {
  (e: 'navigate', itemId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const expandedModuleIds = ref<Set<string>>(new Set());
const sidebarRef = ref<HTMLElement | null>(null);

// LS-007: module ẩn + item ẩn bị lọc khỏi danh sách & không tính vào progress
// (khớp phía backend — tránh "bài ẩn vẫn hiển thị Đã khóa").
const visibleModules = computed(() =>
  (props.curriculum?.modules ?? []).filter((m: any) => !m.isHidden)
);

const visibleItems = (module: any) =>
  (module?.items ?? []).filter((i: any) => !i.isHidden);

const allItems = computed(() => {
  return visibleModules.value.flatMap((m: any) => visibleItems(m));
});

const totalItems = computed(() => allItems.value.length);

const completedItems = computed(() => allItems.value.filter((i: any) => i.status === 'Completed').length);

const overallProgress = computed(() => {
  if (totalItems.value === 0) return 0;
  return Math.round((completedItems.value / totalItems.value) * 100);
});

const isModuleExpanded = (moduleId: string) => expandedModuleIds.value.has(moduleId);
const toggleModule = (moduleId: string) => {
  if (expandedModuleIds.value.has(moduleId)) {
    expandedModuleIds.value.delete(moduleId);
  } else {
    expandedModuleIds.value.add(moduleId);
  }
};

const getModuleIndex = (moduleId: string) => {
  return visibleModules.value.findIndex((m: any) => m.id === moduleId) ?? -1;
};

const getModuleCompletedCount = (module: any) => {
  const items = visibleItems(module);
  return items.filter((item: any) => item.status === 'Completed').length;
};

const isModuleCompleted = (module: any) => {
  const items = visibleItems(module).filter((i: any) => i.isRequired);
  // LS-010: module không có item bắt buộc → không chặn module kế tiếp.
  if (items.length === 0) return true;
  return items.every((item: any) => item.status === 'Completed');
};

const isModuleLocked = (module: any) => {
  if (module.unlockAt && new Date(module.unlockAt) > new Date()) return true;
  
  const moduleIndex = getModuleIndex(module.id);
  if (moduleIndex > 0) {
    const prevModule = visibleModules.value[moduleIndex - 1];
    if (prevModule && !isModuleCompleted(prevModule)) return true;
  }
  return false;
};

const getModuleStatusClass = (module: any) => {
  if (isModuleCompleted(module)) return 'bg-accent-green/20 border-accent-green/30 text-accent-green';
  if (isModuleLocked(module)) return 'bg-bg-surface border-border-default text-text-muted';
  return 'bg-accent/20 border-accent/30 text-accent';
};

const isItemCompleted = (item: any) => item.status === 'Completed';

// LS-012: khóa sequential THẬT — ưu tiên isUnlocked từ backend, fallback tự tính:
// prerequisite chưa hoàn thành (hoặc không tìm thấy) → khóa.
const isItemLocked = (item: any) => {
  if (item.isHidden) return true;
  if (item.unlockAt && new Date(item.unlockAt) > new Date()) return true;
  if (typeof item.isUnlocked === 'boolean') return !item.isUnlocked;
  if (item.isSequential && item.prerequisiteItemId) {
    const prereq = allItems.value.find((i: any) => i.id === item.prerequisiteItemId);
    if (!prereq) return true;
    if (prereq.status !== 'Completed') return true;
  }
  return false;
};

// CR-051: tooltip giải thích lý do khóa (mở theo lịch / cần hoàn thành bài trước).
const lockedReason = (item: any): string => {
  if (item.unlockAt && new Date(item.unlockAt) > new Date()) {
    return `Bài học mở khóa vào ${formatDate(item.unlockAt)}`;
  }
  if (item.isSequential && item.prerequisiteItemId) {
    const prereq = allItems.value.find((i: any) => i.id === item.prerequisiteItemId);
    return `Cần hoàn thành "${prereq ? itemDisplayTitle(prereq) : 'bài học trước'}" trước khi mở bài này`;
  }
  return 'Bài học hiện đang bị khóa';
};

const getItemStatusClass = (item: any) => {
  if (item.status === 'Completed') return 'item-completed';
  if (isItemLocked(item)) return 'item-locked';
  if (item.status === 'InProgress') return 'item-in-progress';
  return 'item-not-started';
};

const getItemStatusBgClass = (item: any) => {
  if (item.status === 'Completed') return 'bg-accent-green/20 text-accent-green border-accent-green/30';
  if (isItemLocked(item)) return 'bg-bg-surface text-text-muted border-border-default';
  if (item.status === 'InProgress') return 'bg-accent-yellow/20 text-accent-yellow border-accent-yellow/30';
  return 'bg-bg-surface text-text-muted border-border-default';
};

const getTypeBadgeClass = (type: string) => {
  switch (type) {
    case 'Lesson': return 'badge-indigo';
    case 'Quiz': return 'badge-purple';
    case 'Codelab': return 'badge-emerald';
    case 'CustomLesson': return 'badge-amber';
    default: return 'badge-slate';
  }
};

// LS-030: nhãn tiếng Việt cho badge + fallback tiêu đề CustomLesson.
const typeLabel = (type: string) => {
  switch (type) {
    case 'Lesson': return 'Bài học';
    case 'Quiz': return 'Trắc nghiệm';
    case 'Codelab': return 'Codelab';
    case 'CustomLesson': return 'Tự soạn';
    default: return type || 'Unknown';
  }
};

const itemDisplayTitle = (item: any) =>
  item.overrideTitle || item.lessonTitle || item.quizTitle || item.codelabTitle || item.customLessonTitle || 'Untitled';

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', { 
    day: '2-digit', month: '2-digit', 
    hour: '2-digit', minute: '2-digit' 
  });
};

function onItemClick(item: any) {
  if (!isItemLocked(item)) {
    emit('navigate', item.id);
  }
}

// LS-028: auto-expand module chứa bài đang học + scroll bài active vào tầm nhìn.
function expandModuleContaining(itemId: string) {
  const module = props.curriculum?.modules?.find((m: any) =>
    m.items?.some((i: any) => i.id === itemId)
  );
  if (module) expandedModuleIds.value.add(module.id);
}

function scrollToActiveItem(itemId: string) {
  void nextTick(() => {
    if (!sidebarRef.value) return;
    const el = sidebarRef.value.querySelector(`[data-item-id="${CSS.escape(itemId)}"]`);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
}

watch(() => props.currentItemId, (itemId) => {
  if (!itemId) return;
  expandModuleContaining(itemId);
  scrollToActiveItem(itemId);
}, { immediate: true });
</script>

<style scoped>
@import "./StudentCurriculumSidebar.css";
</style>
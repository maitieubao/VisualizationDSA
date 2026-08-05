<template>
  <div 
    ref="itemRef"
    class="module-item-row"
    :class="[
      'draggable',
      isDragging && 'dragging',
      isDragOver && 'drag-over',
      item.isHidden && 'hidden'
    ]"
    draggable="true"
    @dragstart="onDragStart"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @dragend="onDragEnd"
    @drop.prevent="onDrop"
  >
    <button 
      type="button" 
      class="drag-handle"
      @mousedown.stop
      @click.stop
      aria-label="Drag to reorder"
    >
      <BaseIcon name="grip-vertical" class="w-5 h-5" />
    </button>

    <div class="type-badge-wrapper">
      <span 
        class="type-badge"
        :class="typeBadgeClass"
      >
        {{ item.itemType }}
      </span>
      
      <span 
        v-if="item.isSequential && item.prerequisiteItemId" 
        class="prerequisite-indicator"
      >
        <BaseIcon name="arrow-right" class="w-3 h-3 inline mr-0.5 align-middle" /> sau #{{ getPrerequisiteIndex(item.prerequisiteItemId) }}
      </span>
    </div>

    <div class="item-content">
      <div class="item-title-row">
        <h4 class="item-title">{{ displayTitle }}</h4>
        
        <div class="item-badges">
          <span v-if="item.isRequired" class="badge badge-primary text-[10px]">Bắt buộc</span>
          <span v-if="item.isHidden" class="badge badge-warning text-[10px]">Ẩn</span>
          <span v-if="item.unlockAt" class="badge badge-info text-[10px]">
            <BaseIcon name="clock" class="w-3 h-3 inline mr-0.5" />
            {{ formatDate(item.unlockAt) }}
          </span>
          <span v-if="item.dueAt" class="badge badge-rose text-[10px]">
            <BaseIcon name="calendar" class="w-3 h-3 inline mr-0.5" />
            {{ formatDate(item.dueAt) }}
          </span>
          <span v-if="item.maxAttempts" class="badge badge-purple text-[10px]">
            <BaseIcon name="refresh-cw" class="w-3 h-3 inline mr-0.5" />
            {{ item.maxAttempts }} lần
          </span>
        </div>
      </div>

      <p v-if="item.overrideDescription" class="item-description">{{ item.overrideDescription }}</p>
      
      <div v-if="linkedContentInfo.length" class="linked-content-info">
        <span 
          v-for="info in linkedContentInfo" 
          :key="info.label"
          class="linked-content-badge"
          :class="info.color"
        >
          <BaseIcon :name="info.icon" class="w-3 h-3" />
          {{ info.label }}
        </span>
      </div>
    </div>

    <div class="item-actions">
      <button 
        type="button" 
        class="action-btn"
        @click.stop="$emit('edit', item)"
        title="Chỉnh sửa"
      >
        <BaseIcon name="edit-2" class="w-4 h-4" />
      </button>
      
      <button 
        type="button" 
        class="action-btn"
        @click.stop="$emit('duplicate', item)"
        title="Nhân bản"
      >
        <BaseIcon name="copy" class="w-4 h-4" />
      </button>
      
      <button 
        type="button" 
        class="action-btn"
        @click.stop="$emit('toggle-hidden', item)"
        :title="item.isHidden ? 'Hiện cho học viên' : 'Ẩn khỏi học viên'"
        :class="{ 'active': item.isHidden }"
      >
        <BaseIcon 
          :name="item.isHidden ? 'eye-off' : 'eye'" 
          class="w-4 h-4" 
        />
      </button>
      
      <button 
        type="button" 
        class="action-btn"
        @click.stop="$emit('toggle-required', item)"
        :title="item.isRequired ? 'Đặt là tùy chọn' : 'Đặt là bắt buộc'"
        :class="{ 'active': item.isRequired }"
      >
        <BaseIcon 
          :name="item.isRequired ? 'lock' : 'unlock'" 
          class="w-4 h-4" 
        />
      </button>
      
      <button 
        type="button" 
        class="action-btn text-text-muted hover:text-accent"
        @click.stop="$emit('override-settings', item)"
        title="Cài đặt nâng cao"
      >
        <BaseIcon name="settings" class="w-4 h-4" />
      </button>
      
      <button 
        type="button" 
        class="action-btn text-text-muted hover:text-accent-red"
        @click.stop="$emit('delete', item)"
        title="Xóa"
      >
        <BaseIcon name="trash-2" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';

interface Props {
  item: any;
  module: any;
  index: number;
  isDragging: boolean;
  isDragOver: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits(['edit', 'delete', 'duplicate', 'toggle-hidden', 'toggle-required', 'override-settings', 'drag-start', 'drag-over', 'drag-end', 'drag-leave', 'drop']);

const displayTitle = computed(() => 
  props.item.overrideTitle || props.item.lessonTitle || props.item.quizTitle || props.item.codelabTitle || 'Untitled'
);

const typeBadgeClass = computed(() => {
  switch (props.item.itemType) {
    case 'Lesson': return 'badge-lesson';
    case 'Quiz': return 'badge-quiz';
    case 'Codelab': return 'badge-codelab';
    default: return 'badge-default';
  }
});

const linkedContentInfo = computed(() => {
  const info: any[] = [];
  if (props.item.lessonTitle) {
    info.push({ 
      label: props.item.lessonTitle, 
      icon: 'book-open', 
      color: 'indigo' 
    });
  }
  if (props.item.quizTitle) {
    info.push({ 
      label: props.item.quizTitle, 
      icon: 'help-circle', 
      color: 'purple' 
    });
  }
  if (props.item.codelabTitle) {
    info.push({ 
      label: props.item.codelabTitle, 
      icon: 'code', 
      color: 'emerald' 
    });
  }
  return info;
});

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('vi-VN');

function getPrerequisiteIndex(prereqId: string): number | string {
  const allItems = props.module?.items ?? [];
  const idx = allItems.findIndex((i: any) => i.id === prereqId);
  return idx >= 0 ? idx + 1 : '?';
}


function onDragStart(e: DragEvent) {
  e.dataTransfer!.effectAllowed = 'move';
  e.dataTransfer!.setData('text/plain', props.item.id);
  emit('drag-start', props.item);
}

function onDragOver(e: DragEvent) {
  e.preventDefault();
  e.dataTransfer!.dropEffect = 'move';
  emit('drag-over', props.item);
}

function onDragLeave(e: DragEvent) {
  emit('drag-leave', props.item);
}

function onDragEnd(e: DragEvent) {
  emit('drag-end', props.item);
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  const draggedId = e.dataTransfer!.getData('text/plain');
  if (draggedId && draggedId !== props.item.id) {
    emit('drop', { draggedId, targetId: props.item.id });
  }
}
</script>

<style scoped>
.module-item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.15s ease;
}

.module-item-row:hover {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.6);
}

.module-item-row.dragging {
  opacity: 0.4;
  transform: rotate(1deg);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
}

.module-item-row.drag-over {
  border-color: var(--color-accent-primary);
  background: rgba(99, 102, 241, 0.1);
}

.module-item-row.hidden {
  opacity: 0.5;
  border-style: dashed;
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.3);
  cursor: grab;
  flex-shrink: 0;
  background: transparent;
  border: none;
}

.drag-handle:hover {
  color: var(--color-accent-primary-light);
  background: rgba(99, 102, 241, 0.2);
}

.drag-handle:active {
  cursor: grabbing;
}

.type-badge-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 700;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.type-badge.badge-lesson { background: rgba(99, 102, 241, 0.2); color: var(--color-accent-primary-light); }
.type-badge.badge-quiz { background: rgba(168, 85, 247, 0.2); color: var(--color-accent-primary-light); }
.type-badge.badge-codelab { background: rgba(16, 185, 129, 0.2); color: var(--color-accent-green); }
.type-badge.badge-default { background: rgba(148, 163, 184, 0.2); color: var(--color-text-muted); }

.prerequisite-indicator {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  font-family: monospace;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.item-title {
  font-weight: 600;
  color: white;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.badge-primary { background: rgba(99, 102, 241, 0.2); color: var(--color-accent-primary-light); }
.badge-warning { background: rgba(245, 158, 11, 0.2); color: var(--color-accent-yellow); }
.badge-info { background: rgba(14, 165, 233, 0.2); color: var(--color-accent-primary-light); }
.badge-rose { background: rgba(244, 63, 94, 0.2); color: var(--color-accent-red); }
.badge-purple { background: rgba(168, 85, 247, 0.2); color: var(--color-accent-primary-light); }

.item-description {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.linked-content-info {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.linked-content-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  font-size: 11px;
  border-radius: 4px;
  white-space: nowrap;
}

.linked-content-badge.indigo { background: rgba(99, 102, 241, 0.15); color: var(--color-accent-primary-light); }
.linked-content-badge.purple { background: rgba(168, 85, 247, 0.15); color: var(--color-accent-primary-light); }
.linked-content-badge.emerald { background: rgba(16, 185, 129, 0.15); color: var(--color-accent-green); }

.item-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.15s;
}

.action-btn:hover {
  color: var(--color-accent-primary-light);
  background: rgba(99, 102, 241, 0.15);
}

.action-btn.active {
  color: var(--color-accent-yellow);
  background: rgba(245, 158, 11, 0.15);
}

.action-btn.text-text-muted:hover {
  color: var(--color-accent-primary);
}

.action-btn.text-accent-red:hover {
  color: var(--color-accent-red);
  background: rgba(244, 63, 94, 0.15);
}


@media (max-width: 768px) {
  .module-item-row {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .drag-handle {
    order: -1;
  }
  
  .type-badge-wrapper {
    order: 2;
  }
  
  .item-content {
    order: 3;
    width: calc(100% - 40px);
  }
  
  .item-actions {
    order: 4;
    width: 100%;
    justify-content: flex-end;
    padding-top: 4px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    margin-top: 4px;
  }
}
</style>

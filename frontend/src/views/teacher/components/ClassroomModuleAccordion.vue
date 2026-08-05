<template>
  <div 
    class="module-accordion bg-bg-secondary border border-border-subtle rounded-2xl overflow-hidden"
    :class="{ 'module-hidden': module.isHidden }"
    @dragstart="onDragStartModule"
    @dragover.prevent="onDragOverModule"
    @dragleave="onDragLeaveModule"
    @drop="onDropModule"
    draggable="true"
  >
    
    <button
      type="button"
      class="module-header w-full flex items-center justify-between p-5 cursor-pointer hover:bg-bg-hover transition-colors"
      @click="toggleExpanded"
    >
      <div class="flex items-center gap-4 flex-1 min-w-0">
        <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 text-accent font-bold text-lg">
          {{ moduleIndex + 1 }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-3 flex-wrap">
            <h3 class="font-bold text-white truncate">{{ module.title }}</h3>
            <span v-if="module.isHidden" class="badge badge-warning text-xs">Ẩn</span>
            <span v-if="module.unlockAt" class="badge badge-info text-xs">
              <BaseIcon name="clock" class="w-3 h-3 inline mr-1" /> 
              {{ formatDate(module.unlockAt) }}
            </span>
          </div>
          <p v-if="module.description" class="text-text-muted text-sm mt-1 line-clamp-1">{{ module.description }}</p>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <span class="text-text-muted text-sm font-mono">
          {{ module.items.length }} bài
        </span>
        <BaseIcon 
          :name="expanded ? 'chevron-up' : 'chevron-down'" 
          class="w-5 h-5 text-text-muted transition-transform"
        />
      </div>
    </button>

    
    <div 
      v-show="expanded"
      class="module-items px-5 pb-5 border-t border-border-subtle animate-slide-down"
    >
      
      <div class="flex gap-2 mb-4 pt-4">
        <button 
          type="button" 
          class="btn-add-item flex-1" 
          @click.stop="$emit('add-item', module)"
        >
          <BaseIcon name="plus" class="w-4 h-4 inline mr-1" />
          Thêm bài học
        </button>
        <button 
          type="button" 
          class="btn-action btn-action--edit" 
          @click.stop="$emit('edit-module', module)"
          title="Chỉnh sửa Module"
        >
          <BaseIcon name="edit" class="w-4 h-4" />
        </button>
        <button 
          type="button" 
          class="btn-action btn-action--delete" 
          @click.stop="$emit('delete-module', module)"
          title="Xóa Module"
        >
          <BaseIcon name="trash" class="w-4 h-4" />
        </button>
      </div>

      
      <div v-if="module.items.length === 0" class="empty-items text-center py-8">
        <div class="text-4xl mb-2"><BaseIcon name="clipboard-list" class="w-10 h-10 text-text-muted mx-auto" /></div>
        <p class="text-text-muted">Module này chưa có bài học nào</p>
        <button class="btn-primary mt-4" @click="$emit('add-item', module)">
          <BaseIcon name="plus" class="w-4 h-4 inline mr-1" /> Thêm bài học đầu tiên
        </button>
      </div>

      
      <div v-else class="items-list space-y-3">
        <div 
          v-for="(item, index) in module.items" 
          :key="item.id"
          class="item-wrapper"
          @dragstart="onDragStartItem(item, index)"
          @dragover.prevent="onDragOverItem(item, index)"
          @dragleave="onDragLeaveItem"
          @drop="onDropItem(item, index)"
          draggable="true"
        >
          <ModuleItemRow 
            :module="module"
            :item="item"
            :index="Number(index)"
            :is-dragging="false"
            :is-drag-over="false"
            @edit-item="$emit('edit-item', module, item)"
            @delete-item="$emit('delete-item', module, item)"
            @drag-start="$emit('drag-start-item', module, item)"
            @drag-over="$emit('drag-over-item', module, item)"
            @drag-end="$emit('drag-end-item')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ModuleItemRow from './ModuleItemRow.vue';

interface Props {
  module: any;
  moduleIndex: number;
  expanded: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'toggle-expanded': [any];
  'add-item': [any];
  'edit-module': [any];
  'delete-module': [any];
  'edit-item': [any, any];
  'delete-item': [any, any];
  'drag-start-module': [any];
  'drag-over-module': [any];
  'drag-leave-module': [any];
  'drop-module': [any];
  'drag-start-item': [any, any];
  'drag-over-item': [any, any];
  'drag-end-item': [];
}>();

function toggleExpanded() {
  emit('toggle-expanded', props.module.id);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', { 
    day: '2-digit', month: '2-digit', 
    hour: '2-digit', minute: '2-digit' 
  });
}

function onDragStartModule(e: DragEvent) {
  e.dataTransfer!.setData('module-id', props.module.id);
  emit('drag-start-module', props.module);
}

function onDragOverModule(e: DragEvent) {
  e.preventDefault();
  emit('drag-over-module', props.module);
}

function onDragLeaveModule() {
  emit('drag-leave-module', props.module);
}

function onDropModule(e: DragEvent) {
  e.preventDefault();
  emit('drop-module', props.module);
}

function onDragStartItem(item: any, index: number | string) {
  
}

function onDragOverItem(item: any, index: number | string) {
  
}

function onDragLeaveItem() {
  
}

function onDropItem(item: any, index: number | string) {
  
}
</script>

<style scoped>
@import "./ClassroomModuleAccordion.css";
</style>
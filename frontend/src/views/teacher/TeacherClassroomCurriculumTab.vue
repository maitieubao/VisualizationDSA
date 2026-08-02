<template>
  <section class="curriculum-manage-section">
    
    <div class="flex justify-between items-center mb-6 flex-wrap gap-3">
      <div>
        <h2 class="section-heading m-0">Quản lý Chương trình học (Curriculum)</h2>
        <p class="text-text-secondary text-sm mt-1">
          Kéo thả để sắp xếp Module & Bài học. Mỗi Module/Bài học có thể tùy chỉnh riêng cho lớp này.
        </p>
      </div>
      
      <div class="flex gap-2 flex-wrap">
        <button 
          type="button" 
          class="btn-secondary" 
          @click="showImportCourseModal = true"
        >
          <BaseIcon name="download" class="w-4 h-4 inline mr-1 align-middle" />
          Import từ Khóa học
        </button>
        
        <button 
          type="button" 
          class="btn-primary" 
          @click="addNewModule"
          :disabled="saving"
        >
          <BaseIcon name="plus" class="w-4 h-4 inline mr-1 align-middle" />
          Thêm Module
        </button>
      </div>
    </div>

    
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Đang tải chương trình học...</span>
    </div>

    
    <div v-else-if="!curriculum || curriculum.modules.length === 0" class="empty-state">
      <div class="text-5xl mb-4"><BaseIcon name="roadmap" class="w-12 h-12" /></div>
      <h3 class="text-xl font-bold text-text-primary">Chưa có Module nào</h3>
      <p class="text-text-secondary mt-2 max-w-md">
        Tạo Module đầu tiên hoặc Import từ Khóa học có sẵn để bắt đầu xây dựng chương trình học.
      </p>
      <div class="flex gap-2 mt-6 justify-center">
        <button class="btn-primary" @click="addNewModule">
          <BaseIcon name="plus" class="w-4 h-4 inline mr-1" /> Tạo Module đầu tiên
        </button>
        <button class="btn-secondary" @click="showImportCourseModal = true">
          <BaseIcon name="download" class="w-4 h-4 inline mr-1" /> Import từ Khóa học
        </button>
      </div>
    </div>

    
    <div v-else class="curriculum-accordion space-y-3">
      <div 
        v-for="module in curriculum.modules" 
        :key="module.id"
        class="module-accordion bg-bg-secondary/60 border border-border-default rounded-2xl overflow-hidden"
        :class="{ 'module-hidden': module.isHidden }"
        @dragstart="onDragStartModule(module)"
        @dragover.prevent="onDragOverModule(module)"
        @dragleave="onDragLeaveModule(module)"
        @drop="onDropModule(module)"
        draggable="true"
      >
        
        <button
          type="button"
          class="module-header w-full flex items-center justify-between p-5 cursor-pointer hover:bg-bg-surface transition-colors"
          @click="toggleModuleExpanded(module.id)"
        >
          <div class="flex items-center gap-4 flex-1 min-w-0">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/20 border border-border-accent text-accent font-bold text-lg">
              {{ getModuleIndex(module.id) + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 flex-wrap">
                <h3 class="font-bold text-text-primary truncate">{{ module.title }}</h3>
                <span v-if="module.isHidden" class="badge badge-warning text-xs">Ẩn</span>
                <span v-if="module.unlockAt" class="badge badge-info text-xs">
                  <BaseIcon name="clock" class="w-3 h-3 inline mr-1" /> 
                  {{ formatDate(module.unlockAt) }}
                </span>
              </div>
              <p v-if="module.description" class="text-text-secondary text-sm mt-1 line-clamp-1">{{ module.description }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <span class="text-text-secondary text-sm font-mono">
              {{ module.items.length }} bài
            </span>
            <BaseIcon 
              :name="isModuleExpanded(module.id) ? 'chevron-up' : 'chevron-down'" 
              class="w-5 h-5 text-text-secondary transition-transform"
            />
          </div>
        </button>

        
        <div 
          v-show="isModuleExpanded(module.id)"
          class="module-items px-5 pb-5 border-t border-border-default animate-slide-down"
        >
          
          <div class="flex gap-2 mb-4 pt-4">
            <button 
              type="button" 
              class="btn-add-item flex-1" 
              @click.stop="addNewItem(module)"
            >
              <BaseIcon name="plus" class="w-4 h-4 inline mr-1" />
              Thêm bài học
            </button>
            <button 
              type="button" 
              class="btn-action btn-action--edit" 
              @click.stop="editModule(module)"
              title="Chỉnh sửa Module"
            >
              <BaseIcon name="edit" class="w-4 h-4" />
            </button>
            <button 
              type="button" 
              class="btn-action btn-action--delete" 
              @click.stop="confirmDeleteModule(module)"
              title="Xóa Module"
            >
              <BaseIcon name="trash" class="w-4 h-4" />
            </button>
          </div>

          
          <component :is="DndContext as any" 
            :collisionDetection="closestCenter"
            @drag-start="handleDragStart"
            @drag-over="handleDragOver"
            @drag-end="handleDragEnd"
          >
            <component :is="SortableContext as any" :items="module.items.map(i => i.id)">
              <div class="space-y-2" ref="itemsContainer">
                <template v-for="(item, index) in module.items" :key="item.id">
                  <ModuleItemRow
                    :item="item"
                    :module="module"
                    :index="index"
                    :is-dragging="draggingItemId === item.id"
                    :is-drag-over="dragOverItemId === item.id"
                    @edit="editItem(item, module)"
                    @delete="confirmDeleteItem(item, module)"
                    @duplicate="duplicateItem(item, module)"
                    @toggle-hidden="toggleItemHidden(item, module)"
                    @toggle-required="toggleItemRequired(item, module)"
                    @override-settings="openOverrideSettings(item, module)"
                    @drag-start="onItemDragStart(item, module)"
                    @drag-over="onItemDragOver(item, module)"
                    @drag-end="onItemDragEnd"
                  />
                </template>
                
                
                <div 
                  class="drop-zone h-8 border-2 border-dashed border-transparent transition-colors rounded-xl"
                  :class="{ 'border-border-accent bg-accent/10': dragOverModuleId === module.id }"
                  @dragover.prevent="onDragOverModule(module)"
                  @dragleave="onDragLeaveModule(module)"
                  @drop="onDropItem(module, -1)"
                >
                  <div class="flex items-center justify-center h-full text-text-muted text-xs">
                    <BaseIcon name="arrow-down" class="w-4 h-4 mr-1" /> Thả bài học vào đây
                  </div>
                </div>
              </div>
            </component>
          </component>
        </div>
      </div>
    </div>

    
    <ImportCourseModal
      v-model:show="showImportCourseModal"
      :teacher-id="currentUserId"
      @imported="onCourseImported"
    />

    
    <ModuleFormModal
      v-model:show="showModuleForm"
      :editing-module="editingModule"
      @save="saveModule"
    />

    
    <ItemFormModal
      v-model:show="showItemForm"
      :editing-item="editingItem"
      :parent-module="editingItemModule"
      @save="saveItem"
    />

    
    <OverrideSettingsModal
      v-model:show="showOverrideSettings"
      :item="editingItem"
      :module="editingItemModule"
      @save="saveItemOverrides"
    />

    
    <ConfirmModal
      v-model:show="showConfirmDelete"
      :title="confirmDeleteTitle"
      :message="confirmDeleteMessage"
      :confirm-text="'Xóa'"
      :variant="'danger'"
      @confirm="executeDelete"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
// @ts-ignore
import { DndContext, closestCenter } from '@dnd-kit/core';
// @ts-ignore
import { SortableContext } from '@dnd-kit/sortable';
import { useClassroomCurriculumStore } from '@/stores/classroomCurriculum';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

import ModuleItemRow from './components/ModuleItemRow.vue';
import ModuleFormModal from './components/ModuleFormModal.vue';
import ItemFormModal from './components/ItemFormModal.vue';
import OverrideSettingsModal from './components/OverrideSettingsModal.vue';
import ImportCourseModal from './components/ImportCourseModal.vue';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';

const route = useRoute();
const router = useRouter();
const classroomId = computed(() => route.params.id as string);

const curriculumStore = useClassroomCurriculumStore();
const authStore = useAuthStore();

const showImportCourseModal = ref(false);
const showModuleForm = ref(false);
const showItemForm = ref(false);
const showOverrideSettings = ref(false);
const showConfirmDelete = ref(false);

const editingModule = ref<any>(null);
const editingItem = ref<any>(null);
const editingItemModule = ref<any>(null);
const confirmDeleteTitle = ref('');
const confirmDeleteMessage = ref('');
const deleteAction = ref<() => Promise<void>>();

const loading = computed(() => curriculumStore.loading);
const curriculum = computed(() => curriculumStore.curriculum);
const currentUserId = computed(() => authStore.currentUser?.id ?? '');
const saving = computed(() => curriculumStore.saving);
const draggingItemId = ref<string | null>(null);
const dragOverItemId = ref<string | null>(null);
const dragOverModuleId = ref<string | null>(null);

const isModuleExpanded = (moduleId: string) => curriculumStore.isModuleExpanded(moduleId);
const getModuleIndex = (moduleId: string) => curriculum.value?.modules.findIndex(m => m.id === moduleId) ?? -1;
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('vi-VN');

async function loadCurriculum() {
  try {
    await curriculumStore.fetchCurriculum(classroomId.value, currentUserId.value!);
  } catch (err: any) {
    console.error('Failed to load curriculum:', err);
  }
}

function toggleModuleExpanded(moduleId: string) {
  curriculumStore.toggleModuleExpanded(moduleId);
}

function addNewModule() {
  editingModule.value = null;
  showModuleForm.value = true;
}

function editModule(module: any) {
  editingModule.value = module;
  showModuleForm.value = true;
}

function confirmDeleteModule(module: any) {
  confirmDeleteTitle.value = 'Xóa Module';
  confirmDeleteMessage.value = `Bạn có chắc chắn muốn xóa module "${module.title}" và tất cả các bài học bên trong? Hành động này không thể hoàn tác.`;
  deleteAction.value = async () => {
    await curriculumStore.deleteModuleApi(module.id);
  };
  showConfirmDelete.value = true;
}

function addNewItem(module: any) {
  editingItem.value = null;
  editingItemModule.value = module;
  showItemForm.value = true;
}

function editItem(item: any, module: any) {
  editingItem.value = item;
  editingItemModule.value = module;
  showItemForm.value = true;
}

function confirmDeleteItem(item: any, module: any) {
  confirmDeleteTitle.value = 'Xóa Bài học';
  confirmDeleteMessage.value = `Bạn có chắc chắn muốn xóa "${item.overrideTitle || item.lessonTitle || item.quizTitle || item.codelabTitle}"?`;
  deleteAction.value = async () => {
    await curriculumStore.deleteItemApi(module.id, item.id);
  };
  showConfirmDelete.value = true;
}

function duplicateItem(item: any, module: any) {
  
}

function toggleItemHidden(item: any, module: any) {
  curriculumStore.updateItemApi(module.id, item.id, { isHidden: !item.isHidden });
}

function toggleItemRequired(item: any, module: any) {
  curriculumStore.updateItemApi(module.id, item.id, { isRequired: !item.isRequired });
}

function openOverrideSettings(item: any, module: any) {
  editingItem.value = item;
  editingItemModule.value = module;
  showOverrideSettings.value = true;
}

async function saveModule(moduleData: any) {
  if (editingModule.value) {
    await curriculumStore.updateModuleApi(editingModule.value.id, moduleData);
  } else {
    await curriculumStore.createModuleApi(classroomId.value, currentUserId.value!, moduleData);
  }
  showModuleForm.value = false;
  editingModule.value = null;
}

async function saveItem(itemData: any) {
  if (editingItem.value) {
    await curriculumStore.updateItemApi(editingItemModule.value!.id, editingItem.value.id, itemData);
  } else {
    await curriculumStore.createItemApi(editingItemModule.value!.id, itemData);
  }
  showItemForm.value = false;
  editingItem.value = null;
  editingItemModule.value = null;
}

async function saveItemOverrides(overrides: any) {
  await curriculumStore.updateItemApi(editingItemModule.value!.id, editingItem.value!.id, overrides);
  showOverrideSettings.value = false;
}

async function executeDelete() {
  if (deleteAction.value) {
    await deleteAction.value();
  }
  showConfirmDelete.value = false;
  deleteAction.value = undefined;
}

async function onCourseImported() {
  showImportCourseModal.value = false;
  await loadCurriculum();
}


function onDragStartModule(module: any) {
  dragOverModuleId.value = module.id;
}

function onDragOverModule(module: any) {
  dragOverModuleId.value = module.id;
}

function onDragLeaveModule(module: any) {
  if (dragOverModuleId.value === module.id) {
    dragOverModuleId.value = null;
  }
}

function onDropModule(module: any) {
  
  dragOverModuleId.value = null;
}

function onItemDragStart(item: any, module: any) {
  draggingItemId.value = item.id;
}

function onItemDragOver(item: any, module: any) {
  dragOverItemId.value = item.id;
}

function onItemDragEnd() {
  draggingItemId.value = null;
  dragOverItemId.value = null;
}

function handleDragStart(event: any) {
  draggingItemId.value = event.active.id;
}

function handleDragOver(event: any) {
  dragOverItemId.value = event.over?.id ?? null;
}

function handleDragEnd(event: any) {
  if (event.over && event.active.id !== event.over.id) {
    
  }
  draggingItemId.value = null;
  dragOverItemId.value = null;
}

function onDragOverModuleForItem(module: any) {
  dragOverModuleId.value = module.id;
}

function onDropItem(module: any, index: number) {
  
  if (draggingItemId.value && dragOverModuleId.value === module.id) {
    const sourceModuleId = curriculumStore.getModule(module.id)?.id;
    
  }
  dragOverModuleId.value = null;
}

onMounted(() => {
  loadCurriculum();
});


import { watch } from 'vue';
watch(() => classroomId.value, (newId) => {
  if (newId) {
    loadCurriculum();
  }
});
</script>

<style scoped>

</style>

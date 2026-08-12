<template>
  <section class="curriculum-manage-section">
    <!-- LS-014: banner lỗi chung — mọi API thất bại đều hiển thị ở đây. -->
    <div v-if="curriculumStore.error" class="error-banner" role="alert">
      <BaseIcon name="alert-circle" class="w-4 h-4 shrink-0" />
      <span class="flex-1">{{ curriculumStore.error }}</span>
      <button
        type="button"
        class="error-banner__close"
        aria-label="Đóng thông báo lỗi"
        @click="curriculumStore.setError(null)"
      >
        <BaseIcon name="x" class="w-3.5 h-3.5" />
      </button>
    </div>

    <div class="flex justify-between items-center mb-6 flex-wrap gap-3">
      <div>
        <h2 class="section-heading m-0">Quản lý Chương trình học (Curriculum)</h2>
        <p class="text-text-muted text-sm mt-1">
          Kéo thả để sắp xếp Module & Bài học. Mỗi Module/Bài học có thể tùy chỉnh riêng cho lớp này.
        </p>
      </div>
      
        <div class="flex gap-2 flex-wrap">
          <button
            type="button"
            class="btn-secondary"
            @click="showImportCourseModal = true"
            :disabled="saving"
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

          <button
            type="button"
            class="btn-action btn-action--delete"
            @click="confirmDeleteClassroom"
            :disabled="saving"
          >
            <BaseIcon name="trash" class="w-4 h-4" /> Xóa lớp học
          </button>
        </div>
    </div>

    
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Đang tải chương trình học...</span>
    </div>

    
    <div v-else-if="!curriculum || curriculum.modules.length === 0" class="empty-state">
      <div class="text-5xl mb-4"><BaseIcon name="book-open" class="w-12 h-12 text-text-muted mx-auto" /></div>
      <h3 class="text-xl font-bold text-text-primary">Chưa có Module nào</h3>
      <p class="text-text-muted mt-2 max-w-md">
        Tạo Module đầu tiên hoặc Import từ Khóa học có sẵn để bắt đầu xây dựng chương trình học.
      </p>
      <div class="flex gap-2 mt-6 justify-center">
        <button class="btn-primary" @click="addNewModule" :disabled="saving">
          <BaseIcon name="plus" class="w-4 h-4 inline mr-1" /> Tạo Module đầu tiên
        </button>
        <button class="btn-secondary" @click="showImportCourseModal = true" :disabled="saving">
          <BaseIcon name="download" class="w-4 h-4 inline mr-1" /> Import từ Khóa học
        </button>
      </div>
    </div>

    
    <div v-else class="curriculum-accordion space-y-3">
      <!-- LS-033: accordion không kéo toàn bộ — chỉ kéo qua handle riêng;
           dragenter/dragleave đếm độ sâu để hết flicker khi qua child. -->
      <div 
        v-for="module in curriculum.modules" 
        :key="module.id"
        class="module-accordion bg-bg-secondary border border-border-subtle rounded-2xl overflow-hidden"
        :class="{ 'module-hidden': module.isHidden, 'drag-over-module': dragOverModuleId === module.id }"
        @dragenter="onModuleDragEnter(module)"
        @dragover.prevent="onModuleDragOver(module)"
        @dragleave="onModuleDragLeave(module)"
        @drop.prevent="onModuleDrop(module)"
      >
        
        <button
          type="button"
          class="module-header w-full flex items-center justify-between p-5 cursor-pointer hover:bg-bg-hover transition-colors"
          @click="toggleModuleExpanded(module.id)"
        >
          <div class="flex items-center gap-4 flex-1 min-w-0">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 text-accent font-bold text-lg">
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
              <p v-if="module.description" class="text-text-muted text-sm mt-1 line-clamp-1">{{ module.description }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <span class="text-text-muted text-sm font-mono">
              {{ module.items.length }} bài
            </span>
            <span
              role="button"
              tabindex="0"
              class="module-drag-handle"
              draggable="true"
              aria-label="Kéo để sắp xếp module (dùng phím ↑ ↓ khi focus)"
              title="Kéo để sắp xếp module"
              @dragstart="onModuleDragStart(module)"
              @click.stop
              @keydown.up.prevent="onModuleMoveByKeyboard(module, -1)"
              @keydown.down.prevent="onModuleMoveByKeyboard(module, 1)"
            >
              <BaseIcon name="grip-vertical" class="w-4 h-4" />
            </span>
            <BaseIcon 
              :name="isModuleExpanded(module.id) ? 'chevron-up' : 'chevron-down'" 
              class="w-5 h-5 text-text-muted transition-transform"
            />
          </div>
        </button>

        
        <div 
          v-show="isModuleExpanded(module.id)"
          class="module-items px-5 pb-5 border-t border-border-subtle animate-slide-down"
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

          
          <!-- LS-003: hệ kéo HTML5 native duy nhất (đã bỏ dnd-kit) —
               ModuleItemRow emit drag-start/drag-over/drop; drop-zone cuối module nhận thả "cuối danh sách". -->
          <div class="space-y-2">
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
                @drag-start="onItemDragStart"
                @drag-over="onItemDragOver"
                @drag-leave="onItemDragLeave"
                @drag-end="onItemDragEnd"
                @drop="(payload: { draggedId: string; targetId: string }) => onItemDrop(payload, module)"
                @move="(item: any, delta: -1 | 1) => moveItemByKeyboard(item, module, delta)"
              />
            </template>
            
            
            <div 
              class="drop-zone h-8 border-2 border-dashed border-transparent transition-colors rounded-xl"
              :class="{ 'border-accent bg-accent/10': dragOverModuleId === module.id }"
              @dragover.prevent="onDropZoneDragOver(module)"
              @dragleave="onDropZoneDragLeave(module)"
              @drop.prevent="(e: DragEvent) => onDropZoneDrop(module, e)"
            >
              <div class="flex items-center justify-center h-full text-text-muted text-xs">
                <BaseIcon name="arrow-down" class="w-4 h-4 mr-1" /> Thả bài học vào đây
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    
    <ImportCourseModal
      v-model:show="showImportCourseModal"
      :classroom-id="classroomId"
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

    <!-- LS-015: xóa lớp học qua ConfirmModal + store API (thay confirm()/fetch thô). -->
    <ConfirmModal
      v-model:show="showConfirmDeleteClassroom"
      :title="'Xóa lớp học'"
      :message="confirmDeleteClassroomMessage"
      :confirm-text="'Xóa vĩnh viễn'"
      :variant="'danger'"
      @confirm="executeDeleteClassroom"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useClassroomCurriculumStore } from '@/stores/classroomCurriculum';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

import ModuleItemRow from './components/ModuleItemRow.vue';
import ModuleFormModal from './components/ModuleFormModal.vue';
import ItemFormModal from './components/ItemFormModal.vue';
import OverrideSettingsModal from './components/OverrideSettingsModal.vue';
import ImportCourseModal from './components/ImportCourseModal.vue';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';

// LS-011: nhận classroomId từ prop (TeacherPanelView truyền) — ưu tiên prop hơn route.params.
const props = defineProps<{
  classroomId?: string | null;
}>();

const route = useRoute();
const router = useRouter();
const classroomId = computed(() => props.classroomId || (route.params.id as string) || '');

const curriculumStore = useClassroomCurriculumStore();
const authStore = useAuthStore();

const showImportCourseModal = ref(false);
const showModuleForm = ref(false);
const showItemForm = ref(false);
const showOverrideSettings = ref(false);
const showConfirmDelete = ref(false);
const showConfirmDeleteClassroom = ref(false);

const editingModule = ref<any>(null);
const editingItem = ref<any>(null);
const editingItemModule = ref<any>(null);
const confirmDeleteTitle = ref('');
const confirmDeleteMessage = ref('');
const confirmDeleteClassroomMessage = ref('');
const deleteAction = ref<(() => Promise<void>) | null>(null);

const loading = computed(() => curriculumStore.loading);
const curriculum = computed(() => curriculumStore.curriculum);
const currentUserId = computed(() => authStore.currentUser?.id ?? '');
const saving = computed(() => curriculumStore.saving);
const draggingItemId = ref<string | null>(null);
const dragOverItemId = ref<string | null>(null);
const dragOverModuleId = ref<string | null>(null);
const draggingModuleId = ref<string | null>(null);

// LS-033: đếm dragenter/dragleave theo từng module để hết flicker.
const moduleDragDepth = reactive<Record<string, number>>({});

const isModuleExpanded = (moduleId: string) => curriculumStore.isModuleExpanded(moduleId);
const getModuleIndex = (moduleId: string) => curriculum.value?.modules.findIndex(m => m.id === moduleId) ?? -1;
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('vi-VN');

async function loadCurriculum() {
  if (!classroomId.value) return;
  try {
    await curriculumStore.fetchCurriculum(classroomId.value, currentUserId.value!);
  } catch (err: any) {
    curriculumStore.setError(err.message);
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
  confirmDeleteMessage.value = `Bạn có chắc chắn muốn xóa "${item.overrideTitle || item.lessonTitle || item.quizTitle || item.codelabTitle || item.customLessonTitle}"?`;
  deleteAction.value = async () => {
    await curriculumStore.deleteItemApi(module.id, item.id);
  };
  showConfirmDelete.value = true;
}

// LS-013: nhân bản bài học — clone liên kết + ghi đè, lưu qua createItemApi.
async function duplicateItem(item: any, module: any) {
  if (item.itemType === 'CustomLesson') return;
  try {
    const copy = {
      moduleId: module.id,
      itemType: item.itemType,
      lessonId: item.lessonId ?? null,
      quizId: item.quizId ?? null,
      codelabId: item.codelabId ?? null,
      overrideTitle: `${item.overrideTitle || item.lessonTitle || item.quizTitle || item.codelabTitle || 'Bài học'} (bản sao)`,
      overrideDescription: item.overrideDescription || '',
      orderIndex: module.items.length + 1,
      isRequired: item.isRequired,
      isHidden: item.isHidden,
      unlockAt: item.unlockAt ?? null,
      dueAt: item.dueAt ?? null,
      maxAttempts: item.maxAttempts ?? null,
      isSequential: item.isSequential,
      prerequisiteItemId: null
    };
    await curriculumStore.createItemApi(module.id, copy);
  } catch (err: any) {
    curriculumStore.setError(err.message);
  }
}

function toggleItemHidden(item: any, module: any) {
  curriculumStore.updateItemApi(module.id, item.id, { isHidden: !item.isHidden })
    .catch((err: any) => curriculumStore.setError(err.message));
}

function toggleItemRequired(item: any, module: any) {
  curriculumStore.updateItemApi(module.id, item.id, { isRequired: !item.isRequired })
    .catch((err: any) => curriculumStore.setError(err.message));
}

function openOverrideSettings(item: any, module: any) {
  editingItem.value = item;
  editingItemModule.value = module;
  showOverrideSettings.value = true;
}

// LS-014: try/catch quanh save/delete — lỗi hiện banner + GIỮ modal mở.
async function saveModule(moduleData: any) {
  try {
    if (editingModule.value) {
      await curriculumStore.updateModuleApi(editingModule.value.id, moduleData);
    } else {
      await curriculumStore.createModuleApi(classroomId.value, currentUserId.value!, moduleData);
    }
    showModuleForm.value = false;
    editingModule.value = null;
  } catch (err: any) {
    curriculumStore.setError(err.message);
  }
}

async function saveItem(itemData: any) {
  try {
    if (editingItem.value) {
      await curriculumStore.updateItemApi(editingItemModule.value!.id, editingItem.value.id, itemData);
    } else {
      await curriculumStore.createItemApi(editingItemModule.value!.id, itemData);
    }
    showItemForm.value = false;
    editingItem.value = null;
    editingItemModule.value = null;
  } catch (err: any) {
    curriculumStore.setError(err.message);
  }
}

async function saveItemOverrides(overrides: any) {
  try {
    await curriculumStore.updateItemApi(editingItemModule.value!.id, editingItem.value!.id, overrides);
    showOverrideSettings.value = false;
  } catch (err: any) {
    curriculumStore.setError(err.message);
  }
}

async function executeDelete() {
  if (!deleteAction.value) return;
  try {
    await deleteAction.value();
    showConfirmDelete.value = false;
    deleteAction.value = null;
  } catch (err: any) {
    curriculumStore.setError(err.message);
  }
}

async function onCourseImported() {
  showImportCourseModal.value = false;
  await loadCurriculum();
}

// ── LS-015: Xóa lớp học ──
function confirmDeleteClassroom() {
  const classroomName = curriculum.value?.classroomName || 'lớp học này';
  confirmDeleteClassroomMessage.value =
    `Bạn có chắc chắn muốn XÓA VĨNH VIỄN lớp học "${classroomName}"? ` +
    'Hành động này sẽ xóa toàn bộ module, bài học, học viên và dữ liệu liên quan. KHÔNG THỂ HOÀN TÁC!';
  showConfirmDeleteClassroom.value = true;
}

async function executeDeleteClassroom() {
  try {
    await curriculumStore.deleteClassroomApi(classroomId.value);
    showConfirmDeleteClassroom.value = false;
    router.push('/teacher');
  } catch (err: any) {
    curriculumStore.setError(err.message);
  }
}

// ── LS-003: kéo-thả Module (HTML5, handle riêng) ──
function onModuleDragStart(module: any) {
  draggingModuleId.value = module.id;
}

function onModuleDragEnter(module: any) {
  if (draggingModuleId.value) dragOverModuleId.value = module.id;
  moduleDragDepth[module.id] = (moduleDragDepth[module.id] || 0) + 1;
}

function onModuleDragOver(module: any) {
  if (draggingModuleId.value) dragOverModuleId.value = module.id;
}

function onModuleDragLeave(module: any) {
  moduleDragDepth[module.id] = Math.max(0, (moduleDragDepth[module.id] || 0) - 1);
  if (moduleDragDepth[module.id] === 0 && dragOverModuleId.value === module.id) {
    dragOverModuleId.value = null;
  }
}

async function onModuleDrop(targetModule: any) {
  const draggedId = draggingModuleId.value;
  const targetId = targetModule.id;
  clearModuleDrag();
  if (!draggedId || draggedId === targetId) return;
  const modules = curriculum.value!.modules;
  const newIds = reorderArray(modules.map(m => m.id), draggedId, targetId);
  const orders = newIds.map((id, idx) => ({ moduleId: id, orderIndex: idx }));
  curriculumStore.reorderModules(orders);
  try {
    await curriculumStore.reorderModulesApi(classroomId.value, currentUserId.value!, orders);
  } catch (err: any) {
    curriculumStore.setError(err.message);
  }
}

function clearModuleDrag() {
  draggingModuleId.value = null;
  dragOverModuleId.value = null;
  for (const key of Object.keys(moduleDragDepth)) delete moduleDragDepth[key];
}

// Di chuyển module bằng bàn phím (↑ ↓ trên handle).
async function onModuleMoveByKeyboard(module: any, delta: -1 | 1) {
  if (!curriculum.value) return;
  const modules = curriculum.value.modules;
  const idx = modules.findIndex(m => m.id === module.id);
  const targetIdx = idx + delta;
  if (idx === -1 || targetIdx < 0 || targetIdx >= modules.length) return;
  const ids = modules.map(m => m.id);
  const copy = [...ids];
  const [moved] = copy.splice(idx, 1);
  copy.splice(targetIdx, 0, moved);
  const orders = copy.map((id, orderIdx) => ({ moduleId: id, orderIndex: orderIdx }));
  curriculumStore.reorderModules(orders);
  try {
    await curriculumStore.reorderModulesApi(classroomId.value, currentUserId.value!, orders);
  } catch (err: any) {
    curriculumStore.setError(err.message);
  }
}

// ── LS-003: kéo-thả Bài học (HTML5) ──
function onItemDragStart(item: any) {
  draggingItemId.value = item.id;
}

function onItemDragOver(item: any) {
  dragOverItemId.value = item.id;
}

function onItemDragLeave(item: any) {
  if (dragOverItemId.value === item.id) {
    dragOverItemId.value = null;
  }
}

function onItemDragEnd() {
  clearItemDragVisuals();
}

function onItemDrop(payload: { draggedId: string; targetId: string }, module: any) {
  void handleItemDrop(payload.draggedId, module.id, payload.targetId);
}

function onDropZoneDragOver(module: any) {
  if (draggingItemId.value) dragOverModuleId.value = module.id;
}

function onDropZoneDragLeave(module: any) {
  if (dragOverModuleId.value === module.id) {
    dragOverModuleId.value = null;
  }
}

function onDropZoneDrop(module: any, e: DragEvent) {
  const draggedId = e.dataTransfer?.getData('text/plain') ?? '';
  void handleItemDrop(draggedId, module.id, null);
}

async function handleItemDrop(draggedId: string, targetModuleId: string, targetItemId: string | null) {
  if (!draggedId) {
    clearItemDragVisuals();
    return;
  }
  const dragItem = curriculumStore.allItems.find(i => i.id === draggedId);
  const targetModule = curriculumStore.getModule(targetModuleId);
  if (!dragItem || !targetModule) {
    clearItemDragVisuals();
    return;
  }
  const sourceModuleId = dragItem.moduleId;

  if (sourceModuleId === targetModuleId) {
    // Sắp xếp lại trong cùng module.
    const newIds = reorderArray(targetModule.items.map(i => i.id), draggedId, targetItemId);
    await persistItemOrder(targetModuleId, newIds);
  } else {
    // Chuyển bài sang module khác: cập nhật cục bộ + reorder 2 module.
    const sourceModule = curriculumStore.getModule(sourceModuleId);
    if (sourceModule) {
      const toIdx = targetItemId ? targetModule.items.findIndex(i => i.id === targetItemId) : -1;
      const targetOrder = toIdx >= 0
        ? targetModule.items[toIdx].orderIndex
        : (targetModule.items.length ? targetModule.items[targetModule.items.length - 1].orderIndex + 1 : 0);
      curriculumStore.moveItemToModule(draggedId, sourceModuleId, targetModuleId, targetOrder);
      await persistItemOrder(sourceModuleId, sourceModule.items.map(i => i.id));
      await persistItemOrder(targetModuleId, targetModule.items.map(i => i.id));
    }
  }
  clearItemDragVisuals();
}

async function persistItemOrder(moduleId: string, orderedIds: string[]) {
  const orders = orderedIds.map((id, idx) => ({ itemId: id, orderIndex: idx }));
  curriculumStore.reorderItems(moduleId, orders);
  try {
    await curriculumStore.reorderItemsApi(moduleId, currentUserId.value!, orders);
  } catch (err: any) {
    curriculumStore.setError(err.message);
  }
}

function clearItemDragVisuals() {
  draggingItemId.value = null;
  dragOverItemId.value = null;
  dragOverModuleId.value = null;
}

// LS-026: di chuyển bài bằng bàn phím (nút ↑ ↓ trên handle).
async function moveItemByKeyboard(item: any, module: any, delta: -1 | 1) {
  const idx = module.items.findIndex((i: any) => i.id === item.id);
  const targetIdx = idx + delta;
  if (idx === -1 || targetIdx < 0 || targetIdx >= module.items.length) return;
  const ids = module.items.map((i: any) => i.id);
  const copy = [...ids];
  const [moved] = copy.splice(idx, 1);
  copy.splice(targetIdx, 0, moved);
  await persistItemOrder(module.id, copy);
}

// Di chuyển phần tử tới vị trí của targetId (mặc định: cuối danh sách).
function reorderArray(ids: string[], draggedId: string, targetId: string | null): string[] {
  const from = ids.indexOf(draggedId);
  if (from === -1) return [...ids];
  const to = targetId ? ids.indexOf(targetId) : ids.length;
  if (to === -1) return [...ids];
  const copy = [...ids];
  const [moved] = copy.splice(from, 1);
  let insertAt = to;
  if (to > from) insertAt = to - 1;
  copy.splice(Math.max(0, insertAt), 0, moved);
  return copy;
}

onMounted(() => {
  loadCurriculum();
});

watch(classroomId, (newId) => {
  if (newId) {
    loadCurriculum();
  }
});
</script>

<style scoped>
@import "./TeacherClassroomCurriculumTab.css";
</style>

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// LS-001: backend phục vụ toàn bộ API dưới prefix /api/v1 (khớp shared/services/apiClient.ts).
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055'}/api/v1`;

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  // PUT/DELETE trả 204 No Content — không có body để parse (khớp shared/apiClient).
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface ClassroomModuleItem {
  id: string;
  moduleId: string;
  itemType: 'Lesson' | 'Quiz' | 'Codelab';
  overrideTitle: string;
  overrideDescription: string;
  orderIndex: number;
  isRequired: boolean;
  isHidden: boolean;
  unlockAt: string | null;
  dueAt: string | null;
  maxAttempts: number | null;
  isSequential: boolean;
  prerequisiteItemId: string | null;
  lessonId: string | null;
  quizId: string | null;
  codelabId: string | null;
  lessonTitle?: string;
  lessonSandboxType?: string;
  quizTitle?: string;
  codelabTitle?: string;
}

export interface ClassroomModule {
  id: string;
  classroomId: string;
  title: string;
  description: string;
  orderIndex: number;
  isHidden: boolean;
  unlockAt: string | null;
  items: ClassroomModuleItem[];
}

export interface ClassroomCurriculum {
  classroomId: string;
  classroomName: string;
  modules: ClassroomModule[];
}

export const useClassroomCurriculumStore = defineStore('classroomCurriculum', () => {
  
  const curriculum = ref<ClassroomCurriculum | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const saving = ref(false);
  
  
  const expandedModuleIds = ref<Set<string>>(new Set());
  
  
  const draggingItem = ref<{ item: ClassroomModuleItem; moduleId: string } | null>(null);
  const dragOverItem = ref<{ item: ClassroomModuleItem; moduleId: string } | null>(null);

  
  const getModule = computed(() => (moduleId: string) => 
    curriculum.value?.modules.find(m => m.id === moduleId)
  );

  const getItem = computed(() => (moduleId: string, itemId: string) => 
    curriculum.value?.modules
      .find(m => m.id === moduleId)
      ?.items.find(i => i.id === itemId)
  );

  const allItems = computed(() => 
    curriculum.value?.modules.flatMap(m => m.items) ?? []
  );

  const isModuleExpanded = computed(() => (moduleId: string) => 
    expandedModuleIds.value.has(moduleId)
  );

  
  function setCurriculum(data: ClassroomCurriculum | null) {
    curriculum.value = data;
    error.value = null;
  }

  function setLoading(isLoading: boolean) {
    loading.value = isLoading;
  }

  function setError(err: string | null) {
    error.value = err;
    loading.value = false;
  }

  function toggleModuleExpanded(moduleId: string) {
    if (expandedModuleIds.value.has(moduleId)) {
      expandedModuleIds.value.delete(moduleId);
    } else {
      expandedModuleIds.value.add(moduleId);
    }
  }

  function setModuleExpanded(moduleId: string, expanded: boolean) {
    if (expanded) {
      expandedModuleIds.value.add(moduleId);
    } else {
      expandedModuleIds.value.delete(moduleId);
    }
  }

  
  function addModule(module: ClassroomModule) {
    if (!curriculum.value) return;
    curriculum.value.modules.push(module);
    curriculum.value.modules.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  function updateModule(moduleId: string, updates: Partial<ClassroomModule>) {
    const module = curriculum.value?.modules.find(m => m.id === moduleId);
    if (module) {
      Object.assign(module, updates);
      curriculum.value!.modules.sort((a, b) => a.orderIndex - b.orderIndex);
    }
  }

  function removeModule(moduleId: string) {
    if (!curriculum.value) return;
    curriculum.value.modules = curriculum.value.modules.filter(m => m.id !== moduleId);
  }

  function reorderModules(moduleOrders: { moduleId: string; orderIndex: number }[]) {
    if (!curriculum.value) return;
    for (const { moduleId, orderIndex } of moduleOrders) {
      const module = curriculum.value.modules.find(m => m.id === moduleId);
      if (module) module.orderIndex = orderIndex;
    }
    curriculum.value.modules.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  
  function addItem(moduleId: string, item: ClassroomModuleItem) {
    const module = curriculum.value?.modules.find(m => m.id === moduleId);
    if (module) {
      module.items.push(item);
      module.items.sort((a, b) => a.orderIndex - b.orderIndex);
    }
  }

  function updateItem(moduleId: string, itemId: string, updates: Partial<ClassroomModuleItem>) {
    const item = getItem.value(moduleId, itemId);
    if (item) {
      Object.assign(item, updates);
      const module = getModule.value(moduleId);
      if (module) module.items.sort((a, b) => a.orderIndex - b.orderIndex);
    }
  }

  function removeItem(moduleId: string, itemId: string) {
    const module = getModule.value(moduleId);
    if (module) {
      module.items = module.items.filter(i => i.id !== itemId);
    }
  }

  function reorderItems(moduleId: string, itemOrders: { itemId: string; orderIndex: number }[]) {
    const module = getModule.value(moduleId);
    if (!module) return;
    
    for (const { itemId, orderIndex } of itemOrders) {
      const item = module.items.find(i => i.id === itemId);
      if (item) item.orderIndex = orderIndex;
    }
    module.items.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  function moveItemToModule(itemId: string, sourceModuleId: string, targetModuleId: string, newOrderIndex: number) {
    const sourceModule = getModule.value(sourceModuleId);
    const targetModule = getModule.value(targetModuleId);
    if (!sourceModule || !targetModule) return;

    const itemIndex = sourceModule.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;

    const [item] = sourceModule.items.splice(itemIndex, 1);
    item.moduleId = targetModuleId;
    item.orderIndex = newOrderIndex;
    targetModule.items.push(item);
    targetModule.items.sort((a, b) => a.orderIndex - b.orderIndex);
    sourceModule.items.forEach((i, idx) => i.orderIndex = idx);
  }

  
  function setDraggingItem(item: ClassroomModuleItem | null, moduleId: string) {
    if (item) {
      draggingItem.value = { item, moduleId };
    } else {
      draggingItem.value = null;
    }
  }

  function setDragOverItem(item: ClassroomModuleItem | null, moduleId: string) {
    if (item) {
      dragOverItem.value = { item, moduleId };
    } else {
      dragOverItem.value = null;
    }
  }

  function clearDragState() {
    draggingItem.value = null;
    dragOverItem.value = null;
  }

  function applyDragDrop() {
    if (!draggingItem.value || !dragOverItem.value) return;
    
    const { item: dragItem, moduleId: sourceModuleId } = draggingItem.value;
    const { item: dropItem, moduleId: targetModuleId } = dragOverItem.value;
    
    if (sourceModuleId === targetModuleId) {
      
      const sourceIdx = allItems.value.findIndex(i => i.id === dragItem.id);
      const targetIdx = allItems.value.findIndex(i => i.id === dropItem.id);
      if (sourceIdx !== -1 && targetIdx !== -1) {
        reorderItems(sourceModuleId, [
          { itemId: dragItem.id, orderIndex: dropItem.orderIndex },
          { itemId: dropItem.id, orderIndex: dragItem.orderIndex }
        ]);
      }
    } else {
      
      moveItemToModule(dragItem.id, sourceModuleId, targetModuleId, dropItem.orderIndex);
    }
    
    clearDragState();
  }

  // LS-017/LS-041: fetchCurriculum phải hạ loading sau khi xong + bỏ response cũ
  // (race 2 classroom) — chỉ response mới nhất được ghi state.
  let fetchSeq = 0;
  async function fetchCurriculum(classroomId: string, teacherId: string) {
    const seq = ++fetchSeq;
    setLoading(true);
    try {
      const data = await apiFetch<ClassroomCurriculum>(`/classrooms/${classroomId}/curriculum/teacher`);
      if (seq !== fetchSeq) return; // response cũ → bỏ
      setCurriculum(data);
    } catch (err: any) {
      if (seq !== fetchSeq) return; // lỗi của request cũ → bỏ
      setError(err.message);
      throw err;
    } finally {
      if (seq === fetchSeq) setLoading(false);
    }
  }

  async function createModuleApi(classroomId: string, teacherId: string, module: Omit<ClassroomModule, 'id' | 'classroomId' | 'items'>) {
    saving.value = true;
    try {
      const response = await apiFetch<{ moduleId: string }>(`/classrooms/${classroomId}/modules`, {
        method: 'POST',
        body: JSON.stringify({ teacherId, ...module })
      });
      addModule({ ...module, id: response.moduleId, classroomId, items: [] });
    } finally {
      saving.value = false;
    }
  }

  async function updateModuleApi(moduleId: string, updates: Partial<ClassroomModule>) {
    saving.value = true;
    try {
      await apiFetch(`/modules/${moduleId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      updateModule(moduleId, updates);
    } finally {
      saving.value = false;
    }
  }

  async function deleteModuleApi(moduleId: string) {
    saving.value = true;
    try {
      await apiFetch(`/modules/${moduleId}`, { method: 'DELETE' });
      removeModule(moduleId);
    } finally {
      saving.value = false;
    }
  }

  async function createItemApi(moduleId: string, item: Omit<ClassroomModuleItem, 'id'>) {
    saving.value = true;
    try {
      const response = await apiFetch<{ itemId: string }>(`/modules/${moduleId}/items`, {
        method: 'POST',
        body: JSON.stringify(item)
      });
      addItem(moduleId, { ...item, id: response.itemId });
    } finally {
      saving.value = false;
    }
  }

  // LS-002: endpoint PUT/DELETE /modules/{moduleId}/items/{itemId} do backend agent
  // bổ sung (Update/DeleteClassroomModuleItem). Payload giữ nguyên Partial — controller
  // đọc teacherId từ token, khớp các route còn lại của controller.
  async function updateItemApi(moduleId: string, itemId: string, updates: Partial<ClassroomModuleItem>) {
    saving.value = true;
    try {
      await apiFetch(`/modules/${moduleId}/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      updateItem(moduleId, itemId, updates);
    } finally {
      saving.value = false;
    }
  }

  async function deleteItemApi(moduleId: string, itemId: string) {
    saving.value = true;
    try {
      await apiFetch(`/modules/${moduleId}/items/${itemId}`, { method: 'DELETE' });
      removeItem(moduleId, itemId);
    } finally {
      saving.value = false;
    }
  }

  async function reorderModulesApi(classroomId: string, teacherId: string, moduleOrders: { moduleId: string; orderIndex: number }[]) {
    saving.value = true;
    try {
      await apiFetch(`/classrooms/${classroomId}/modules/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ teacherId, moduleOrders })
      });
      reorderModules(moduleOrders);
    } finally {
      saving.value = false;
    }
  }

  async function reorderItemsApi(moduleId: string, teacherId: string, itemOrders: { itemId: string; orderIndex: number }[]) {
    saving.value = true;
    try {
      await apiFetch(`/modules/${moduleId}/items/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ teacherId, itemOrders })
      });
      reorderItems(moduleId, itemOrders);
    } finally {
      saving.value = false;
    }
  }

  // LS-015: xóa lớp học qua store (thay fetch thô trong view).
  async function deleteClassroomApi(classroomId: string) {
    saving.value = true;
    try {
      await apiFetch(`/classrooms/${classroomId}`, { method: 'DELETE' });
      reset();
    } finally {
      saving.value = false;
    }
  }

  function reset() {
    curriculum.value = null;
    loading.value = false;
    error.value = null;
    saving.value = false;
    expandedModuleIds.value.clear();
    clearDragState();
  }

  return {
    
    curriculum,
    loading,
    error,
    saving,
    expandedModuleIds,
    draggingItem,
    dragOverItem,
    
    
    getModule,
    getItem,
    allItems,
    isModuleExpanded,
    
    
    fetchCurriculum,
    setCurriculum,
    setLoading,
    setError,
    toggleModuleExpanded,
    setModuleExpanded,
    addModule,
    updateModule,
    removeModule,
    reorderModules,
    addItem,
    updateItem,
    removeItem,
    reorderItems,
    moveItemToModule,
    setDraggingItem,
    setDragOverItem,
    clearDragState,
    applyDragDrop,
    reset,
    
    
    createModuleApi,
    updateModuleApi,
    deleteModuleApi,
    createItemApi,
    updateItemApi,
    deleteItemApi,
    reorderModulesApi,
    reorderItemsApi,
    deleteClassroomApi
  };
});
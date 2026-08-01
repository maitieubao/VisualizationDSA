<template>
  <div class="roadmap-editor p-6 max-w-7xl mx-auto h-screen flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6 shrink-0">
      <div class="flex items-center space-x-4">
        <button class="btn btn-secondary !p-2" @click="router.push('/teacher-studio')">
          <BaseIcon name="chevron-left" class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center">
            {{ roadmap?.name || 'Đang tải...' }}
            <span v-if="roadmap" class="ml-3 px-2 py-1 text-xs rounded bg-slate-700 text-slate-300">
              {{ roadmap.status }}
            </span>
          </h1>
        </div>
      </div>
      <div class="flex space-x-3">
        <button class="btn btn-primary" @click="showAddNodeModal = true" :disabled="!roadmap">
          Thêm Node mới
        </button>
        <button class="btn btn-secondary bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40" @click="publishRoadmap" :disabled="!canPublish">
          Xuất bản Lộ trình
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex flex-1 gap-6 min-h-0">
      <!-- Sidebar (Nodes List) -->
      <div class="w-1/3 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
        <div class="p-4 border-b border-slate-700 font-bold text-white flex justify-between items-center">
          <span>Danh sách Bài giảng (Nodes)</span>
          <span class="text-xs bg-slate-700 px-2 py-1 rounded">{{ roadmap?.nodes?.length || 0 }}</span>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div v-if="!roadmap?.nodes?.length" class="text-center text-slate-500 py-8 text-sm">
            Chưa có Node nào. Nhấn "Thêm Node mới" để bắt đầu.
          </div>
          
          <div 
            v-for="(node, index) in sortedNodes" 
            :key="node.id"
            class="p-3 rounded-lg border cursor-pointer transition-colors"
            :class="selectedNode?.id === node.id ? 'bg-indigo-900/40 border-indigo-500' : 'bg-slate-900 border-slate-700 hover:border-slate-500'"
            @click="selectNode(node)"
          >
            <div class="flex justify-between items-start mb-1">
              <h4 class="font-bold text-white text-sm">
                {{ index + 1 }}. {{ node.name }}
              </h4>
              <span class="text-xs px-1.5 py-0.5 rounded" :class="node.isComplete ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'">
                {{ node.isComplete ? 'Hoàn tất' : 'Thiếu Practice' }}
              </span>
            </div>
            <p class="text-xs text-slate-400 line-clamp-1 mb-2">{{ node.description }}</p>
            <div class="flex gap-2 text-xs text-slate-500">
              <span v-if="node.quizId" class="text-indigo-400">✓ Quiz</span>
              <span v-if="node.labId" class="text-green-400">✓ Lab</span>
              <span v-if="node.leetCodeId" class="text-orange-400">✓ LC</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Editor Panel -->
      <div class="w-2/3 bg-slate-800 rounded-xl border border-slate-700 overflow-y-auto p-6">
        <div v-if="!selectedNode" class="h-full flex flex-col items-center justify-center text-slate-500">
          <BaseIcon name="hand-click" class="w-16 h-16 mb-4 opacity-50" />
          <p>Chọn một Node bên trái để chỉnh sửa chi tiết</p>
        </div>
        
        <div v-else>
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-white">Chỉnh sửa: {{ selectedNode.name }}</h2>
            <button class="btn btn-secondary !py-1 !px-2 text-red-400 hover:bg-red-900/30 border-red-900/50" @click="deleteSelectedNode">
              Xóa Node
            </button>
          </div>
          
          <div class="space-y-8">
            <!-- Section 1: Content -->
            <div class="bg-slate-900 p-5 rounded-lg border border-slate-700">
              <h3 class="font-bold text-white mb-4 border-b border-slate-700 pb-2">1. Nội dung (Content)</h3>
              
              <div class="mb-4">
                <label class="block text-sm font-medium text-slate-300 mb-1">Nội dung văn bản (Rich Text / Markdown)</label>
                <textarea 
                  v-model="editorForm.contentJson"
                  rows="4"
                  class="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white"
                ></textarea>
              </div>
              
              <div class="mb-4">
                <label class="block text-sm font-medium text-slate-300 mb-1">Video URL (Tùy chọn)</label>
                <input 
                  v-model="editorForm.videoUrl"
                  type="url"
                  class="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-slate-300 mb-1">Visualizer ID (Thuật toán minh họa)</label>
                <input 
                  v-model="editorForm.visualizerId"
                  type="text"
                  class="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  placeholder="Nhập ID của Visualizer (nếu có)"
                />
              </div>
              
              <div class="flex justify-end">
                <button class="btn btn-primary btn-sm" @click="saveNodeContent" :disabled="isSaving">
                  Lưu Nội dung
                </button>
              </div>
            </div>
            
            <!-- Section 2: Practice -->
            <div class="bg-slate-900 p-5 rounded-lg border border-slate-700">
              <h3 class="font-bold text-white mb-4 border-b border-slate-700 pb-2">
                2. Bài tập thực hành (Cần ít nhất 1 bài tập)
              </h3>
              
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-1">Quiz ID</label>
                  <input 
                    v-model="editorForm.quizId"
                    type="text"
                    class="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-1">Lab ID</label>
                  <input 
                    v-model="editorForm.labId"
                    type="text"
                    class="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-slate-300 mb-1">LeetCode Problem ID</label>
                  <input 
                    v-model="editorForm.leetCodeId"
                    type="text"
                    class="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>
              
              <div class="flex justify-end">
                <button class="btn btn-primary btn-sm" @click="saveNodePractice" :disabled="isSaving">
                  Lưu Bài tập
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Node Modal -->
    <div v-if="showAddNodeModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div class="bg-slate-800 rounded-xl max-w-lg w-full border border-slate-700 shadow-2xl overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
          <h3 class="text-lg font-bold text-white">Thêm Node mới</h3>
          <button class="text-slate-400 hover:text-white" @click="showAddNodeModal = false">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="handleAddNode" class="p-6">
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-300 mb-1">Tên Node</label>
            <input 
              v-model="newNodeForm.name" 
              type="text" 
              required 
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-300 mb-1">Mô tả ngắn</label>
            <input 
              v-model="newNodeForm.description" 
              type="text" 
              required 
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
            />
          </div>
          
          <div class="flex gap-4 mb-6">
            <div class="flex-1">
              <label class="block text-sm font-medium text-slate-300 mb-1">Độ khó</label>
              <select v-model="newNodeForm.difficulty" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white">
                <option value="Easy">Dễ</option>
                <option value="Medium">Trung bình</option>
                <option value="Hard">Khó</option>
              </select>
            </div>
            <div class="w-24">
              <label class="block text-sm font-medium text-slate-300 mb-1">Thứ tự</label>
              <input v-model.number="newNodeForm.sortOrder" type="number" min="0" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" />
            </div>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button type="button" class="btn btn-secondary" @click="showAddNodeModal = false">Hủy</button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">Thêm</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { teacherStudioService, type CustomRoadmapDto, type CustomNodeDto } from '@/services/TeacherStudioService';
import { useToastStore } from '@/composables/useToast';
import BaseIcon from '@/shared/components/BaseIcon.vue';

const route = useRoute();
const router = useRouter();
const toastStore = useToastStore();

const roadmapId = computed(() => route.params.id as string);
const roadmap = ref<CustomRoadmapDto | null>(null);
const selectedNode = ref<CustomNodeDto | null>(null);

const sortedNodes = computed(() => {
  if (!roadmap.value?.nodes) return [];
  return [...roadmap.value.nodes].sort((a, b) => a.sortOrder - b.sortOrder);
});

// Modals & States
const showAddNodeModal = ref(false);
const isSubmitting = ref(false);
const isSaving = ref(false);

const newNodeForm = ref({
  name: '',
  description: '',
  difficulty: 'Medium',
  sortOrder: 0
});

const editorForm = ref({
  contentJson: '',
  videoUrl: '',
  visualizerId: '',
  quizId: '',
  labId: '',
  leetCodeId: ''
});

const canPublish = computed(() => {
  if (!roadmap.value) return false;
  if (roadmap.value.status !== 'Draft' && roadmap.value.status !== 'Rejected') return false;
  if (!roadmap.value.nodes || roadmap.value.nodes.length === 0) return false;
  return roadmap.value.nodes.every(n => n.isComplete);
});

const loadRoadmap = async () => {
  // Currently, the TeacherStudioService doesn't have a GetRoadmapById endpoint explicitly exposed in TeacherStudioController?
  // Wait, I should add it to TeacherStudioService.ts: getRoadmap(id) -> GET /api/v1/teacher-studio/roadmaps/{id}
  try {
    const res = await teacherStudioService.getMyRoadmaps();
    roadmap.value = res.find((r: any) => r.id === roadmapId.value) || null;
    
    if (roadmap.value && sortedNodes.value.length > 0) {
      newNodeForm.value.sortOrder = sortedNodes.value.length;
    }
  } catch (err) {
    toastStore.error('Lỗi khi tải thông tin Lộ trình');
  }
};

const selectNode = (node: CustomNodeDto) => {
  selectedNode.value = node;
  editorForm.value = {
    contentJson: node.contentJson || '',
    videoUrl: node.videoUrl || '',
    visualizerId: node.visualizerId || '',
    quizId: node.quizId || '',
    labId: node.labId || '',
    leetCodeId: node.leetCodeId || ''
  };
};

const handleAddNode = async () => {
  isSubmitting.value = true;
  try {
    const res = await teacherStudioService.addNode(roadmapId.value, newNodeForm.value);
    if (roadmap.value) {
      roadmap.value.nodes.push(res);
    }
    showAddNodeModal.value = false;
    toastStore.success('Thêm Node thành công');
    selectNode(res);
    newNodeForm.value.name = '';
    newNodeForm.value.description = '';
    newNodeForm.value.sortOrder += 1;
  } catch (err: any) {
    toastStore.error(err.response?.data?.message || 'Lỗi khi thêm Node');
  } finally {
    isSubmitting.value = false;
  }
};

const saveNodeContent = async () => {
  if (!selectedNode.value) return;
  isSaving.value = true;
  try {
    const payload = {
      contentJson: editorForm.value.contentJson,
      videoUrl: editorForm.value.videoUrl,
      visualizerId: editorForm.value.visualizerId
    };
    
    const res = await teacherStudioService.updateNodeContent(roadmapId.value, selectedNode.value.id, payload);
    updateNodeInList(res);
    toastStore.success('Lưu nội dung thành công');
  } catch (err: any) {
    toastStore.error('Lỗi khi lưu nội dung');
  } finally {
    isSaving.value = false;
  }
};

const saveNodePractice = async () => {
  if (!selectedNode.value) return;
  isSaving.value = true;
  try {
    const payload = {
      quizId: editorForm.value.quizId,
      labId: editorForm.value.labId,
      leetCodeId: editorForm.value.leetCodeId
    };
    
    // Convert empty strings to null or undefined
    const cleanPayload: any = {};
    if (payload.quizId) cleanPayload.quizId = payload.quizId;
    if (payload.labId) cleanPayload.labId = payload.labId;
    if (payload.leetCodeId) cleanPayload.leetCodeId = payload.leetCodeId;
    
    const res = await teacherStudioService.updateNodePractice(roadmapId.value, selectedNode.value.id, cleanPayload);
    updateNodeInList(res);
    toastStore.success('Lưu bài tập thành công');
  } catch (err: any) {
    toastStore.error(err.response?.data?.message || 'Lỗi khi lưu bài tập');
  } finally {
    isSaving.value = false;
  }
};

const deleteSelectedNode = async () => {
  if (!selectedNode.value) return;
  if (!confirm('Bạn có chắc muốn xóa Node này?')) return;
  
  try {
    await teacherStudioService.deleteNode(roadmapId.value, selectedNode.value.id);
    if (roadmap.value) {
      roadmap.value.nodes = roadmap.value.nodes.filter(n => n.id !== selectedNode.value!.id);
    }
    selectedNode.value = null;
    toastStore.success('Xóa Node thành công');
  } catch (err) {
    toastStore.error('Lỗi khi xóa Node');
  }
};

const updateNodeInList = (updatedNode: CustomNodeDto) => {
  if (!roadmap.value) return;
  const idx = roadmap.value.nodes.findIndex(n => n.id === updatedNode.id);
  if (idx !== -1) {
    roadmap.value.nodes[idx] = updatedNode;
  }
  if (selectedNode.value?.id === updatedNode.id) {
    selectedNode.value = updatedNode;
  }
};

const publishRoadmap = async () => {
  if (!roadmap.value) return;
  if (!confirm(`Bạn có chắc muốn xuất bản lộ trình này dưới dạng ${roadmap.value.visibility}?`)) return;
  
  try {
    const res = await teacherStudioService.publishRoadmap(roadmapId.value, roadmap.value.visibility);
    roadmap.value = res;
    toastStore.success('Lộ trình đã được gửi phê duyệt (hoặc xuất bản)');
  } catch (err: any) {
    const msg = err.response?.data?.message || 'Lỗi khi xuất bản';
    toastStore.error(msg);
  }
};

onMounted(() => {
  loadRoadmap();
});
</script>

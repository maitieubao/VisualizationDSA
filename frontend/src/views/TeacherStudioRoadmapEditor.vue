<template>
  <div class="roadmap-editor p-6 max-w-7xl mx-auto h-screen flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6 shrink-0">
      <div class="flex items-center space-x-4">
        <button class="btn btn-secondary !p-2" @click="router.push('/teacher-studio')">
          <BaseIcon name="chevron-left" class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-text-primary flex items-center">
            {{ roadmap?.name || 'Äang táº£i...' }}
            <span v-if="roadmap" class="ml-3 px-2 py-1 text-xs rounded bg-bg-hover text-text-secondary">
              {{ roadmap.status }}
            </span>
          </h1>
        </div>
      </div>
      <div class="flex space-x-3">
        <button class="btn btn-primary" @click="showAddNodeModal = true" :disabled="!roadmap">
          ThÃªm Node má»›i
        </button>
        <button class="btn btn-secondary bg-accent/20 text-accent hover:bg-accent/40" @click="publishRoadmap" :disabled="!canPublish">
          Xuáº¥t báº£n Lá»™ trÃ¬nh
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex flex-1 gap-6 min-h-0">
      <!-- Sidebar (Nodes List) -->
      <div class="w-1/3 glass-panel rounded-xl flex flex-col overflow-hidden">
        <div class="p-4 border-b border-border-default font-bold text-text-primary flex justify-between items-center">
          <span>Danh sÃ¡ch BÃ i giáº£ng (Nodes)</span>
          <span class="text-xs bg-bg-hover px-2 py-1 rounded">{{ roadmap?.nodes?.length || 0 }}</span>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div v-if="!roadmap?.nodes?.length" class="text-center text-text-muted py-8 text-sm">
            ChÆ°a cÃ³ Node nÃ o. Nháº¥n "ThÃªm Node má»›i" Ä‘á»ƒ báº¯t Ä‘áº§u.
          </div>
          
          <div 
            v-for="(node, index) in sortedNodes" 
            :key="node.id"
            class="p-3 rounded-lg border cursor-pointer transition-colors"
            :class="selectedNode?.id === node.id ? 'bg-accent-dark/40 border-border-accent' : 'bg-bg-secondary border-border-default hover:border-border-default'"
            @click="selectNode(node)"
          >
            <div class="flex justify-between items-start mb-1">
              <h4 class="font-bold text-text-primary text-sm">
                {{ index + 1 }}. {{ node.name }}
              </h4>
              <span class="text-xs px-1.5 py-0.5 rounded" :class="node.isComplete ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-accent-red'">
                {{ node.isComplete ? 'HoÃ n táº¥t' : 'Thiáº¿u Practice' }}
              </span>
            </div>
            <p class="text-xs text-text-secondary line-clamp-1 mb-2">{{ node.description }}</p>
            <div class="flex gap-2 text-xs text-text-muted">
              <span v-if="node.quizId" class="text-accent"><BaseIcon name="quiz" class="w-3 h-3 inline-block mr-0.5 align-text-bottom" />Quiz</span>
              <span v-if="node.labId" class="text-green-400"><BaseIcon name="code-ide" class="w-3 h-3 inline-block mr-0.5 align-text-bottom" />Lab</span>
              <span v-if="node.leetCodeId" class="text-accent-warm"><BaseIcon name="code-ide" class="w-3 h-3 inline-block mr-0.5 align-text-bottom" />LC</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Editor Panel -->
      <div class="w-2/3 glass-panel rounded-xl overflow-y-auto p-6">
        <div v-if="!selectedNode" class="h-full flex flex-col items-center justify-center text-text-muted">
          <BaseIcon name="hand-click" class="w-16 h-16 mb-4 opacity-50" />
          <p>Chá»n má»™t Node bÃªn trÃ¡i Ä‘á»ƒ chá»‰nh sá»­a chi tiáº¿t</p>
        </div>
        
        <div v-else>
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-text-primary">Chá»‰nh sá»­a: {{ selectedNode.name }}</h2>
            <button class="btn btn-secondary !py-1 !px-2 text-accent-red hover:bg-accent-red/20 border-accent-red/50" @click="deleteSelectedNode">
              XÃ³a Node
            </button>
          </div>
          
          <div class="space-y-8">
            <!-- Section 1: Content -->
            <div class="glass-panel p-5 rounded-lg border border-border-default">
              <h3 class="font-bold text-text-primary mb-4 border-b border-border-default pb-2">1. Ná»™i dung (Content)</h3>
              
              <div class="mb-5">
                <label class="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Ná»™i dung vÄƒn báº£n (Rich Text / Markdown)</label>
                <textarea 
                  v-model="editorForm.contentJson"
                  rows="5"
                  class="w-full bg-bg-secondary/50 border border-border-default/80 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-accent focus:ring-4 focus:ring-accent/10 transition-all resize-y"
                  placeholder="Nháº­p ná»™i dung bÃ i giáº£ng táº¡i Ä‘Ã¢y..."
                ></textarea>
              </div>
              
              <div class="mb-5">
                <label class="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Video URL (TÃ¹y chá»n)</label>
                <input 
                  v-model="editorForm.videoUrl"
                  type="url"
                  class="w-full bg-bg-secondary/50 border border-border-default/80 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div class="mb-5">
                <label class="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Visualizer ID (Thuáº­t toÃ¡n minh há»a)</label>
                <input 
                  v-model="editorForm.visualizerId"
                  type="text"
                  class="w-full bg-bg-secondary/50 border border-border-default/80 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                  placeholder="Nháº­p ID cá»§a Visualizer (náº¿u cÃ³)"
                />
              </div>
              
              <div class="flex justify-end">
                <button class="btn btn-primary btn-sm" @click="saveNodeContent" :disabled="isSaving">
                  LÆ°u Ná»™i dung
                </button>
              </div>
            </div>
            
            <!-- Section 2: Practice -->
            <div class="glass-panel p-5 rounded-lg border border-border-default">
              <h3 class="font-bold text-text-primary mb-4 border-b border-border-default pb-2">
                2. BÃ i táº­p thá»±c hÃ nh (Cáº§n Ã­t nháº¥t 1 bÃ i táº­p)
              </h3>
              
              <div class="grid grid-cols-2 gap-5 mb-5">
                <div>
                  <label class="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Quiz ID</label>
                  <input 
                    v-model="editorForm.quizId"
                    type="text"
                    class="w-full bg-bg-secondary/50 border border-border-default/80 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                    placeholder="ID bÃ i Quiz"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Lab ID</label>
                  <input 
                    v-model="editorForm.labId"
                    type="text"
                    class="w-full bg-bg-secondary/50 border border-border-default/80 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                    placeholder="ID bÃ i Lab"
                  />
                </div>
                <div class="col-span-2">
                  <label class="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">LeetCode Problem ID</label>
                  <input 
                    v-model="editorForm.leetCodeId"
                    type="text"
                    class="w-full bg-bg-secondary/50 border border-border-default/80 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                    placeholder="Nháº­p mÃ£ bÃ i toÃ¡n LeetCode"
                  />
                </div>
              </div>
              
              <div class="flex justify-end">
                <button class="btn btn-primary btn-sm" @click="saveNodePractice" :disabled="isSaving">
                  LÆ°u BÃ i táº­p
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Node Modal -->
    <div v-if="showAddNodeModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div class="glass-panel rounded-xl max-w-lg w-full shadow-2xl overflow-hidden">
        <div class="px-6 py-4 border-b border-border-default flex justify-between items-center">
          <h3 class="text-lg font-bold text-text-primary">ThÃªm Node má»›i</h3>
          <button class="text-text-secondary hover:text-text-primary" @click="showAddNodeModal = false">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="handleAddNode" class="p-6">
          <div class="mb-4">
            <label class="block text-sm font-medium text-text-secondary mb-1">TÃªn Node</label>
            <input 
              v-model="newNodeForm.name" 
              type="text" 
              required 
              class="w-full bg-bg-secondary border border-border-default rounded-lg px-4 py-2 text-text-primary"
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-text-secondary mb-1">MÃ´ táº£ ngáº¯n</label>
            <input 
              v-model="newNodeForm.description" 
              type="text" 
              required 
              class="w-full bg-bg-secondary border border-border-default rounded-lg px-4 py-2 text-text-primary"
            />
          </div>
          
          <div class="flex gap-4 mb-6">
            <div class="flex-1">
              <label class="block text-sm font-medium text-text-secondary mb-1">Äá»™ khÃ³</label>
              <select v-model="newNodeForm.difficulty" class="w-full bg-bg-secondary border border-border-default rounded-lg px-4 py-2 text-text-primary">
                <option value="Easy">Dá»…</option>
                <option value="Medium">Trung bÃ¬nh</option>
                <option value="Hard">KhÃ³</option>
              </select>
            </div>
            <div class="w-24">
              <label class="block text-sm font-medium text-text-secondary mb-1">Thá»© tá»±</label>
              <input v-model.number="newNodeForm.sortOrder" type="number" min="0" class="w-full bg-bg-secondary border border-border-default rounded-lg px-4 py-2 text-text-primary" />
            </div>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button type="button" class="btn btn-secondary" @click="showAddNodeModal = false">Há»§y</button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">ThÃªm</button>
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
    toastStore.error('Lá»—i khi táº£i thÃ´ng tin Lá»™ trÃ¬nh');
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
    toastStore.success('ThÃªm Node thÃ nh cÃ´ng');
    selectNode(res);
    newNodeForm.value.name = '';
    newNodeForm.value.description = '';
    newNodeForm.value.sortOrder += 1;
  } catch (err: any) {
    toastStore.error(err.response?.data?.message || 'Lá»—i khi thÃªm Node');
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
    toastStore.success('LÆ°u ná»™i dung thÃ nh cÃ´ng');
  } catch (err: any) {
    toastStore.error('Lá»—i khi lÆ°u ná»™i dung');
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
    toastStore.success('LÆ°u bÃ i táº­p thÃ nh cÃ´ng');
  } catch (err: any) {
    toastStore.error(err.response?.data?.message || 'Lá»—i khi lÆ°u bÃ i táº­p');
  } finally {
    isSaving.value = false;
  }
};

const deleteSelectedNode = async () => {
  if (!selectedNode.value) return;
  if (!confirm('Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a Node nÃ y?')) return;
  
  try {
    await teacherStudioService.deleteNode(roadmapId.value, selectedNode.value.id);
    if (roadmap.value) {
      roadmap.value.nodes = roadmap.value.nodes.filter(n => n.id !== selectedNode.value!.id);
    }
    selectedNode.value = null;
    toastStore.success('XÃ³a Node thÃ nh cÃ´ng');
  } catch (err) {
    toastStore.error('Lá»—i khi xÃ³a Node');
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
  if (!confirm(`Báº¡n cÃ³ cháº¯c muá»‘n xuáº¥t báº£n lá»™ trÃ¬nh nÃ y dÆ°á»›i dáº¡ng ${roadmap.value.visibility}?`)) return;
  
  try {
    const res = await teacherStudioService.publishRoadmap(roadmapId.value, roadmap.value.visibility);
    roadmap.value = res;
    toastStore.success('Lá»™ trÃ¬nh Ä‘Ã£ Ä‘Æ°á»£c gá»­i phÃª duyá»‡t (hoáº·c xuáº¥t báº£n)');
  } catch (err: any) {
    const msg = err.response?.data?.message || 'Lá»—i khi xuáº¥t báº£n';
    toastStore.error(msg);
  }
};

onMounted(() => {
  loadRoadmap();
});
</script>

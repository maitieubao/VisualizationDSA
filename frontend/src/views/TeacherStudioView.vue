<template>
  <div class="teacher-studio-view p-6 max-w-[1280px] mx-auto">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-text-primary mb-2">Teacher Studio</h1>
        <p class="text-text-secondary">Quản lý các Lộ trình học thuật và Bài giảng (Nodes) của bạn.</p>
      </div>
      <button class="btn btn-primary" @click="showCreateModal = true">
        <BaseIcon name="plus" class="w-5 h-5 inline-block mr-1" />
        Tạo Lộ trình mới
      </button>
    </div>

    <!-- Error/Loading states -->
    <div v-if="loading" class="text-center py-10 text-text-secondary">
      Đang tải Lộ trình...
    </div>
    <div v-else-if="error" class="text-center py-10 text-accent-red">
      {{ error }}
    </div>

    <!-- Roadmaps Grid -->
    <div v-else-if="roadmaps.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div 
        v-for="rm in roadmaps" 
        :key="rm.id"
        class="group relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-bg-surface/80 to-bg-secondary/90 border border-border-default backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-500 hover:border-border-accent/50 hover:shadow-[0_8px_30px_rgba(99,102,241,0.2)] hover:-translate-y-2"
      >
        <div class="h-44 relative flex items-center justify-center overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-t from-bg-secondary/90 via-transparent to-transparent z-10"></div>
          <img v-if="rm.thumbnailUrl" :src="rm.thumbnailUrl" alt="Thumbnail" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div v-else class="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent-purple/40 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
            <BaseIcon name="map" class="w-16 h-16 text-accent/50 group-hover:text-accent/80 transition-colors duration-300" />
          </div>
          
          <span 
            class="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md"
            :class="{
              'bg-bg-surface text-text-secondary border border-border-default': rm.status === 'Draft',
              'bg-accent-warm/20 text-accent-warm border border-yellow-500/30': rm.status === 'Pending',
              'bg-accent-green/20 text-accent-green border border-accent-green/30': rm.status === 'Published',
              'bg-red-500/20 text-accent-red border border-red-500/30': rm.status === 'Rejected'
            }"
          >
            <span class="flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full animate-pulse" :class="{
                'bg-slate-400': rm.status === 'Draft', 'bg-yellow-400': rm.status === 'Pending', 'bg-accent-green': rm.status === 'Published', 'bg-red-400': rm.status === 'Rejected'
              }"></span>
              {{ rm.status }}
            </span>
          </span>
        </div>
        
        <div class="p-6 flex-1 flex flex-col relative z-20">
          <h3 class="text-xl font-bold text-text-primary mb-2 line-clamp-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-accent-light group-hover:to-accent-cyan transition-all duration-300">{{ rm.name }}</h3>
          <p class="text-text-secondary text-sm mb-5 line-clamp-2 flex-1 leading-relaxed">{{ rm.description }}</p>
          
          <div class="flex items-center gap-3 text-xs font-semibold text-text-muted mb-6">
            <span class="flex items-center bg-bg-primary/50 px-3 py-1.5 rounded-lg border border-border-default">
              <BaseIcon name="collection" class="w-4 h-4 mr-1.5 text-accent" />
              {{ rm.nodes.length }} Nodes
            </span>
            <span class="flex items-center bg-bg-primary/50 px-3 py-1.5 rounded-lg border border-border-default">
              <BaseIcon :name="rm.visibility === 'Private' ? 'lock-closed' : 'users'" class="w-4 h-4 mr-1.5" :class="rm.visibility === 'Private' ? 'text-accent-red' : 'text-accent-green'" />
              {{ rm.visibility === 'Private' ? 'Cá nhân' : 'Lớp học' }}
            </span>
          </div>
          
          <div class="flex gap-3 mt-auto">
            <button class="flex-1 py-2.5 text-sm font-bold rounded-xl bg-accent hover:bg-accent text-text-primary shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-0.5 transition-all duration-200" @click="editRoadmap(rm.id)">
              Biên tập
            </button>
            <button class="p-2.5 rounded-xl bg-bg-hover text-text-secondary hover:bg-accent-red/20 hover:text-accent-red border border-border-default hover:border-accent-red/30 transition-all duration-200" title="Xóa lộ trình" @click="confirmDelete(rm)">
              <BaseIcon name="trash" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-20 glass-panel border-dashed">
      <BaseIcon name="map" class="w-16 h-16 text-text-muted mx-auto mb-4" />
      <h3 class="text-xl font-bold text-text-primary mb-2">Chưa có Lộ trình nào</h3>
      <p class="text-text-secondary mb-6">Hãy bắt đầu tạo lộ trình đầu tiên của bạn để chia sẻ kiến thức với học sinh.</p>
      <button class="btn btn-primary" @click="showCreateModal = true">
        Tạo Lộ trình mới
      </button>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div class="glass-panel max-w-lg w-full">
        <div class="px-6 py-4 border-b border-border-default flex justify-between items-center">
          <h3 class="text-lg font-bold text-text-primary">Tạo Lộ trình mới</h3>
          <button class="text-text-secondary hover:text-text-primary" @click="showCreateModal = false">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="handleCreateRoadmap" class="p-6">
          <div class="mb-4">
            <label class="block text-sm font-medium text-text-secondary mb-1">Tên Lộ trình <span class="text-accent-red">*</span></label>
            <input 
              v-model="newRoadmapForm.name" 
              type="text" 
              required 
              class="w-full bg-bg-secondary border border-border-default rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-border-accent"
              placeholder="VD: Nhập môn Cấu trúc dữ liệu"
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-text-secondary mb-1">Mô tả chi tiết <span class="text-accent-red">*</span></label>
            <textarea 
              v-model="newRoadmapForm.description" 
              required 
              rows="3"
              class="w-full bg-bg-secondary border border-border-default rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-border-accent"
              placeholder="Nhập mô tả..."
            ></textarea>
          </div>
          
          <div class="mb-6">
            <label class="block text-sm font-medium text-text-secondary mb-1">Quyền riêng tư ban đầu</label>
            <select 
              v-model="newRoadmapForm.visibility"
              class="w-full bg-bg-secondary border border-border-default rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-border-accent"
            >
              <option value="Private">Private (Chỉ mình tôi)</option>
              <option value="ClassroomOnly">Classroom Only (Chỉ dành cho học sinh trong lớp)</option>
            </select>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button type="button" class="btn btn-secondary" @click="showCreateModal = false">Hủy</button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Đang tạo...' : 'Tạo Lộ trình' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { teacherStudioService, type CustomRoadmapDto } from '@/services/TeacherStudioService';
import { useToastStore } from '@/composables/useToast';
import BaseIcon from '@/shared/components/BaseIcon.vue';

const router = useRouter();
const toastStore = useToastStore();

const roadmaps = ref<CustomRoadmapDto[]>([]);
const loading = ref(true);
const error = ref('');

const showCreateModal = ref(false);
const isSubmitting = ref(false);
const newRoadmapForm = ref({
  name: '',
  description: '',
  tags: '[]',
  visibility: 'Private'
});

const loadRoadmaps = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await teacherStudioService.getMyRoadmaps();
    roadmaps.value = res;
  } catch (err: any) {
    console.error('Error loading roadmaps:', err);
    roadmaps.value = []; // Fallback to empty state
  } finally {
    loading.value = false;
  }
};

const handleCreateRoadmap = async () => {
  if (!newRoadmapForm.value.name || !newRoadmapForm.value.description) return;
  
  isSubmitting.value = true;
  try {
    const res = await teacherStudioService.createRoadmap(newRoadmapForm.value);
    roadmaps.value.unshift(res);
    showCreateModal.value = false;
    toastStore.success('Tạo Lộ trình thành công!');
    // Reset form
    newRoadmapForm.value = { name: '', description: '', tags: '[]', visibility: 'Private' };
    
    // Redirect to editor
    router.push(`/teacher-studio/${res.id}`);
  } catch (err: any) {
    toastStore.error(err.response?.data?.message || 'Lỗi khi tạo Lộ trình');
  } finally {
    isSubmitting.value = false;
  }
};

const editRoadmap = (id: string) => {
  router.push(`/teacher-studio/${id}`);
};

const confirmDelete = async (rm: CustomRoadmapDto) => {
  if (rm.status === 'Published' || rm.status === 'Pending') {
    toastStore.error('Chỉ có thể xóa Lộ trình ở trạng thái Draft hoặc Rejected.');
    return;
  }
  
  if (confirm(`Bạn có chắc muốn xóa Lộ trình "${rm.name}"? Hành động này không thể hoàn tác.`)) {
    try {
      await teacherStudioService.deleteRoadmap(rm.id);
      roadmaps.value = roadmaps.value.filter(r => r.id !== rm.id);
      toastStore.success('Xóa Lộ trình thành công');
    } catch (err: any) {
      toastStore.error(err.response?.data?.message || 'Lỗi khi xóa Lộ trình');
    }
  }
};

onMounted(() => {
  loadRoadmaps();
});
</script>

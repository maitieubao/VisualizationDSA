<template>
  <div class="teacher-studio-view p-6 max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-white mb-2">Teacher Studio</h1>
        <p class="text-slate-400">Quản lý các Lộ trình học thuật và Bài giảng (Nodes) của bạn.</p>
      </div>
      <button class="btn btn-primary" @click="showCreateModal = true">
        <BaseIcon name="plus" class="w-5 h-5 inline-block mr-1" />
        Tạo Lộ trình mới
      </button>
    </div>

    <!-- Error/Loading states -->
    <div v-if="loading" class="text-center py-10 text-slate-400">
      Đang tải Lộ trình...
    </div>
    <div v-else-if="error" class="text-center py-10 text-red-400">
      {{ error }}
    </div>

    <!-- Roadmaps Grid -->
    <div v-else-if="roadmaps.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="rm in roadmaps" 
        :key="rm.id"
        class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-indigo-500 transition-colors flex flex-col"
      >
        <div class="h-32 bg-slate-700 relative flex items-center justify-center">
          <img v-if="rm.thumbnailUrl" :src="rm.thumbnailUrl" alt="Thumbnail" class="w-full h-full object-cover opacity-60" />
          <BaseIcon v-else name="map" class="w-12 h-12 text-slate-500" />
          
          <span 
            class="absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold"
            :class="{
              'bg-slate-600 text-slate-200': rm.status === 'Draft',
              'bg-yellow-600 text-yellow-100': rm.status === 'Pending',
              'bg-green-600 text-green-100': rm.status === 'Published',
              'bg-red-600 text-red-100': rm.status === 'Rejected'
            }"
          >
            {{ rm.status }}
          </span>
        </div>
        
        <div class="p-5 flex-1 flex flex-col">
          <h3 class="text-xl font-bold text-white mb-2 line-clamp-1">{{ rm.name }}</h3>
          <p class="text-slate-400 text-sm mb-4 line-clamp-2 flex-1">{{ rm.description }}</p>
          
          <div class="flex items-center justify-between text-xs text-slate-500 mb-4">
            <span class="flex items-center">
              <BaseIcon name="collection" class="w-4 h-4 mr-1" />
              {{ rm.nodes.length }} Nodes
            </span>
            <span>Hiển thị: {{ rm.visibility }}</span>
          </div>
          
          <div class="flex space-x-2">
            <button class="btn btn-secondary flex-1" @click="editRoadmap(rm.id)">
              Chỉnh sửa
            </button>
            <button class="btn bg-red-900/50 text-red-400 hover:bg-red-900 px-3 py-2 rounded-lg transition-colors" @click="confirmDelete(rm)">
              <BaseIcon name="trash" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Empty state -->
    <div v-else class="text-center py-20 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed">
      <BaseIcon name="map" class="w-16 h-16 text-slate-600 mx-auto mb-4" />
      <h3 class="text-xl font-bold text-white mb-2">Chưa có Lộ trình nào</h3>
      <p class="text-slate-400 mb-6">Hãy bắt đầu tạo lộ trình đầu tiên của bạn để chia sẻ kiến thức với học sinh.</p>
      <button class="btn btn-primary" @click="showCreateModal = true">
        Tạo Lộ trình mới
      </button>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div class="bg-slate-800 rounded-xl max-w-lg w-full border border-slate-700 shadow-2xl overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
          <h3 class="text-lg font-bold text-white">Tạo Lộ trình mới</h3>
          <button class="text-slate-400 hover:text-white" @click="showCreateModal = false">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="handleCreateRoadmap" class="p-6">
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-300 mb-1">Tên Lộ trình <span class="text-red-400">*</span></label>
            <input 
              v-model="newRoadmapForm.name" 
              type="text" 
              required 
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              placeholder="VD: Nhập môn Cấu trúc dữ liệu"
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-300 mb-1">Mô tả chi tiết <span class="text-red-400">*</span></label>
            <textarea 
              v-model="newRoadmapForm.description" 
              required 
              rows="3"
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              placeholder="Nhập mô tả..."
            ></textarea>
          </div>
          
          <div class="mb-6">
            <label class="block text-sm font-medium text-slate-300 mb-1">Quyền riêng tư ban đầu</label>
            <select 
              v-model="newRoadmapForm.visibility"
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
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
    error.value = 'Có lỗi xảy ra khi tải danh sách Lộ trình.';
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

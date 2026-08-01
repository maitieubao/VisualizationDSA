<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import ClassroomService from '@/services/ClassroomService';
import type { ClassroomDto } from '@/services/ClassroomService';

const authStore = useAuthStore();
const router = useRouter();
const isTeacher = ref(authStore.userRole === 'Teacher' || authStore.userRole === 'Admin');

const classrooms = ref<ClassroomDto[]>([]);
const showCreateModal = ref(false);
const showJoinModal = ref(false);
const newClassName = ref('');
const newClassRoadmapId = ref('');
const joinCode = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(true);

const fetchClassrooms = async () => {
  isLoading.value = true;
  try {
    const data = await ClassroomService.getMyClassrooms();
    classrooms.value = data;
  } catch (err: any) {
    errorMessage.value = "Lỗi khi tải danh sách lớp học: " + (err.response?.data?.message || err.message);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchClassrooms();
});

const handleCreate = async () => {
  try {
    errorMessage.value = '';
    const res = await ClassroomService.createClassroom(newClassName.value, newClassRoadmapId.value);
    successMessage.value = `Tạo lớp thành công: ${res.name}. Mã tham gia: ${res.joinCode}`;
    showCreateModal.value = false;
    newClassName.value = '';
    newClassRoadmapId.value = '';
    await fetchClassrooms();
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Có lỗi xảy ra khi tạo lớp';
  }
};

const handleJoin = async () => {
  try {
    errorMessage.value = '';
    const res = await ClassroomService.joinClassroom(joinCode.value);
    successMessage.value = `Tham gia lớp ${res.name} thành công!`;
    showJoinModal.value = false;
    joinCode.value = '';
    await fetchClassrooms();
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Có lỗi xảy ra khi tham gia lớp';
  }
};

const goToClassroom = (id: string) => {
  router.push(`/classroom/${id}`);
};
</script>

<template>
  <div class="h-full w-full bg-slate-950 overflow-y-auto custom-scrollbar p-6 lg:p-10 text-white animate-fade-in relative">
    
    <header class="mb-12 relative z-10">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 tracking-tight">
            Quản lý Lớp học
          </h1>
          <p class="text-slate-400 mt-2 text-lg">
            Trung tâm kết nối và học tập theo lộ trình chung cùng bạn bè.
          </p>
        </div>
        
        <div class="flex gap-4">
          <button 
            v-if="isTeacher" 
            @click="showCreateModal = true" 
            class="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <span>✨</span> Tạo Lớp Mới
          </button>
          
          <button 
            v-else 
            @click="showJoinModal = true" 
            class="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <span>🔗</span> Tham gia bằng Mã
          </button>
        </div>
      </div>
    </header>

    <div class="relative z-10 mb-8 max-w-4xl mx-auto space-y-4">
      <transition name="fade-slide">
        <div v-if="successMessage" class="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <span class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">✓</span>
          <p class="text-emerald-300 font-medium">{{ successMessage }}</p>
        </div>
      </transition>
      
      <transition name="fade-slide">
        <div v-if="errorMessage" class="flex items-center gap-3 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 backdrop-blur-md shadow-[0_0_20px_rgba(243,64,105,0.1)]">
          <span class="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">!</span>
          <p class="text-rose-300 font-medium">{{ errorMessage }}</p>
        </div>
      </transition>
    </div>

    <!-- State: Loading -->
    <div v-if="isLoading" class="relative z-10 flex justify-center py-20">
      <div class="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- State: Empty -->
    <div v-else-if="classrooms.length === 0" class="relative z-10 text-center py-32 bg-slate-900/40 rounded-3xl border border-white/5 backdrop-blur-sm max-w-4xl mx-auto">
      <div class="text-6xl mb-6 opacity-80">🏫</div>
      <h3 class="text-2xl font-bold text-slate-300">Chưa có lớp học nào</h3>
      <p class="text-slate-500 mt-2 max-w-sm mx-auto">
        {{ isTeacher ? 'Bạn chưa tạo bất kỳ lớp học nào. Hãy tạo một lớp học để gán Lộ trình cho học viên!' : 'Bạn chưa tham gia lớp học nào. Hãy xin Mã từ Giáo viên để bắt đầu!' }}
      </p>
    </div>

    <!-- State: Grid of Classrooms -->
    <div v-else class="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="cls in classrooms" 
        :key="cls.id"
        @click="goToClassroom(cls.id)"
        class="bg-slate-900/60 border border-white/10 rounded-2xl p-6 hover:bg-slate-800/80 hover:border-emerald-500/50 hover:shadow-[0_10px_30px_rgba(16,185,129,0.1)] transition-all cursor-pointer group flex flex-col h-full"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <span class="text-2xl">🏫</span>
          </div>
          <span v-if="isTeacher" class="text-xs font-bold px-2 py-1 bg-slate-800 rounded text-slate-300">Mã: {{ cls.joinCode }}</span>
        </div>
        <h3 class="text-xl font-bold text-white mb-2 line-clamp-2">{{ cls.name }}</h3>
        <p class="text-sm text-slate-400 mb-4 line-clamp-1">Roadmap ID: {{ cls.roadmapId }}</p>
        <div class="mt-auto pt-4 border-t border-white/10 flex justify-between items-center text-xs text-slate-500">
          <span>Tạo ngày: {{ new Date(cls.createdAt).toLocaleDateString() }}</span>
          <span class="text-emerald-400 font-semibold group-hover:underline">Vào lớp &rarr;</span>
        </div>
      </div>
    </div>

    <div class="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
    <div class="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>

    <transition name="modal-fade">
      <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
        <div class="bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden" @click.stop>
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
          
          <h2 class="text-2xl font-bold mb-6 text-white flex items-center gap-2">
            <span>✨</span> Tạo Lớp Học
          </h2>
          
          <div class="space-y-5">
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tên Lớp</label>
              <input v-model="newClassName" placeholder="VD: Cấu trúc dữ liệu Nhóm 1" class="w-full bg-slate-950/50 border border-white/10 p-3 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Roadmap ID</label>
              <input v-model="newClassRoadmapId" placeholder="Nhập ID (Guid)" class="w-full bg-slate-950/50 border border-white/10 p-3 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
              <p class="text-[10px] text-slate-500 mt-1">* ID của Lộ trình bạn muốn gán cho lớp này.</p>
            </div>
          </div>
          
          <div class="flex justify-end gap-3 mt-8">
            <button @click="showCreateModal = false" class="px-5 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-semibold">Hủy</button>
            <button @click="handleCreate" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/30 font-bold transition-all">Tạo Mới</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="showJoinModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
        <div class="bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden" @click.stop>
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-400"></div>
          
          <h2 class="text-2xl font-bold mb-6 text-white flex items-center gap-2">
            <span>🔗</span> Tham gia Lớp
          </h2>
          
          <div class="space-y-5">
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mã Lớp Học</label>
              <input v-model="joinCode" placeholder="Nhập mã 6-8 ký tự..." class="w-full bg-slate-950/50 border border-white/10 p-3 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-center text-xl tracking-widest uppercase" />
            </div>
          </div>
          
          <div class="flex justify-end gap-3 mt-8">
            <button @click="showJoinModal = false" class="px-5 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-semibold">Hủy</button>
            <button @click="handleJoin" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 font-bold transition-all">Tham gia</button>
          </div>
        </div>
      </div>
    </transition>
    
  </div>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>

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
    errorMessage.value = "Lá»—i khi táº£i danh sÃ¡ch lá»›p há»c: " + (err.response?.data?.message || err.message);
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
    successMessage.value = `Táº¡o lá»›p thÃ nh cÃ´ng: ${res.name}. MÃ£ tham gia: ${res.joinCode}`;
    showCreateModal.value = false;
    newClassName.value = '';
    newClassRoadmapId.value = '';
    await fetchClassrooms();
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'CÃ³ lá»—i xáº£y ra khi táº¡o lá»›p';
  }
};

const handleJoin = async () => {
  try {
    errorMessage.value = '';
    const res = await ClassroomService.joinClassroom(joinCode.value);
    successMessage.value = `Tham gia lá»›p ${res.name} thÃ nh cÃ´ng!`;
    showJoinModal.value = false;
    joinCode.value = '';
    await fetchClassrooms();
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'CÃ³ lá»—i xáº£y ra khi tham gia lá»›p';
  }
};

const goToClassroom = (id: string) => {
  router.push(`/classroom/${id}`);
};
</script>

<template>
  <div class="h-full w-full overflow-y-auto custom-scrollbar p-6 lg:p-10 text-text-primary animate-fade-in relative">
    
    <header class="mb-12 relative z-10">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-green via-accent-cyan to-accent-cyan tracking-tight">
            Quáº£n lÃ½ Lá»›p há»c
          </h1>
          <p class="text-text-secondary mt-2 text-lg">
            Trung tÃ¢m káº¿t ná»‘i vÃ  há»c táº­p theo lá»™ trÃ¬nh chung cÃ¹ng báº¡n bÃ¨.
          </p>
        </div>
        
        <div class="flex gap-4">
          <button 
            v-if="isTeacher" 
            @click="showCreateModal = true" 
            class="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-accent-green to-accent-cyan text-text-primary shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <span>âœ¨</span> Táº¡o Lá»›p Má»›i
          </button>
          
          <button 
            v-else 
            @click="showJoinModal = true" 
            class="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-accent to-accent-purple text-text-primary shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <span>ðŸ”—</span> Tham gia báº±ng MÃ£
          </button>
        </div>
      </div>
    </header>

    <div class="relative z-10 mb-8 max-w-4xl mx-auto space-y-4">
      <transition name="fade-slide">
        <div v-if="successMessage" class="flex items-center gap-3 p-4 rounded-xl border border-accent-green/30 bg-accent-green/10 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <span class="w-8 h-8 rounded-full bg-accent-green/20 text-accent-green flex items-center justify-center font-bold">âœ“</span>
          <p class="text-accent-green font-medium">{{ successMessage }}</p>
        </div>
      </transition>
      
      <transition name="fade-slide">
        <div v-if="errorMessage" class="flex items-center gap-3 p-4 rounded-xl border border-accent-red/30 bg-accent-red/10 backdrop-blur-md shadow-[0_0_20px_rgba(243,64,105,0.1)]">
          <span class="w-8 h-8 rounded-full bg-accent-red/20 text-accent-red flex items-center justify-center font-bold">!</span>
          <p class="text-accent-red font-medium">{{ errorMessage }}</p>
        </div>
      </transition>
    </div>

    <!-- State: Loading -->
    <div v-if="isLoading" class="relative z-10 flex justify-center py-20">
      <div class="w-10 h-10 border-4 border-accent-green border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- State: Empty -->
    <div v-else-if="classrooms.length === 0" class="relative z-10 text-center py-32 bg-bg-surface rounded-3xl border border-border-default backdrop-blur-sm max-w-4xl mx-auto">
      <div class="text-6xl mb-6 opacity-80">ðŸ«</div>
      <h3 class="text-2xl font-bold text-text-secondary">ChÆ°a cÃ³ lá»›p há»c nÃ o</h3>
      <p class="text-text-muted mt-2 max-w-sm mx-auto">
        {{ isTeacher ? 'Báº¡n chÆ°a táº¡o báº¥t ká»³ lá»›p há»c nÃ o. HÃ£y táº¡o má»™t lá»›p há»c Ä‘á»ƒ gÃ¡n Lá»™ trÃ¬nh cho há»c viÃªn!' : 'Báº¡n chÆ°a tham gia lá»›p há»c nÃ o. HÃ£y xin MÃ£ tá»« GiÃ¡o viÃªn Ä‘á»ƒ báº¯t Ä‘áº§u!' }}
      </p>
    </div>

    <!-- State: Grid of Classrooms -->
    <div v-else class="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="cls in classrooms" 
        :key="cls.id"
        @click="goToClassroom(cls.id)"
        class="glass-panel spring-hover rounded-2xl p-6 cursor-pointer group flex flex-col h-full"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-green/20 to-teal-500/20 border border-accent-green/30 flex items-center justify-center text-accent-green group-hover:scale-110 transition-transform">
            <span class="text-2xl">ðŸ«</span>
          </div>
          <span v-if="isTeacher" class="text-xs font-bold px-2 py-1 bg-bg-hover rounded text-text-secondary">MÃ£: {{ cls.joinCode }}</span>
        </div>
        <h3 class="text-xl font-bold text-text-primary mb-2 line-clamp-2">{{ cls.name }}</h3>
        <p class="text-sm text-text-secondary mb-4 line-clamp-1">Roadmap ID: {{ cls.roadmapId }}</p>
        <div class="mt-auto pt-4 border-t border-border-default flex justify-between items-center text-xs text-text-muted">
          <span>Táº¡o ngÃ y: {{ new Date(cls.createdAt).toLocaleDateString() }}</span>
          <span class="text-accent-green font-semibold group-hover:underline">VÃ o lá»›p &rarr;</span>
        </div>
      </div>
    </div>

    <div class="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-accent-green/10 blur-[120px] rounded-full pointer-events-none"></div>
    <div class="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full pointer-events-none"></div>

    <transition name="modal-fade">
      <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div class="glass-panel p-8 rounded-3xl w-full max-w-md relative overflow-hidden" @click.stop>
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-green to-accent-cyan"></div>
          
          <h2 class="text-2xl font-bold mb-6 text-text-primary flex items-center gap-2">
            <span>âœ¨</span> Táº¡o Lá»›p Há»c
          </h2>
          
          <div class="space-y-5">
            <div>
              <label class="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">TÃªn Lá»›p</label>
              <input v-model="newClassName" placeholder="VD: Cáº¥u trÃºc dá»¯ liá»‡u NhÃ³m 1" class="w-full bg-bg-primary/50 border border-border-default p-3 rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green transition-all" />
            </div>
            <div>
              <label class="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Roadmap ID</label>
              <input v-model="newClassRoadmapId" placeholder="Nháº­p ID (Guid)" class="w-full bg-bg-primary/50 border border-border-default p-3 rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green transition-all" />
              <p class="text-[10px] text-text-muted mt-1">* ID cá»§a Lá»™ trÃ¬nh báº¡n muá»‘n gÃ¡n cho lá»›p nÃ y.</p>
            </div>
          </div>
          
          <div class="flex justify-end gap-3 mt-8">
            <button @click="showCreateModal = false" class="px-5 py-2.5 text-text-secondary hover:text-text-primary hover:bg-bg-surface rounded-xl transition-all font-semibold">Há»§y</button>
            <button @click="handleCreate" class="px-6 py-2.5 bg-accent-green hover:bg-accent-green text-text-primary rounded-xl shadow-lg shadow-emerald-600/30 font-bold transition-all">Táº¡o Má»›i</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="showJoinModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div class="glass-panel p-8 rounded-3xl w-full max-w-md relative overflow-hidden" @click.stop>
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-light to-accent-purple"></div>
          
          <h2 class="text-2xl font-bold mb-6 text-text-primary flex items-center gap-2">
            <span>ðŸ”—</span> Tham gia Lá»›p
          </h2>
          
          <div class="space-y-5">
            <div>
              <label class="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">MÃ£ Lá»›p Há»c</label>
              <input v-model="joinCode" placeholder="Nháº­p mÃ£ 6-8 kÃ½ tá»±..." class="w-full bg-bg-primary/50 border border-border-default p-3 rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-accent focus:ring-1 focus:ring-accent transition-all text-center text-xl tracking-widest uppercase" />
            </div>
          </div>
          
          <div class="flex justify-end gap-3 mt-8">
            <button @click="showJoinModal = false" class="px-5 py-2.5 text-text-secondary hover:text-text-primary hover:bg-bg-surface rounded-xl transition-all font-semibold">Há»§y</button>
            <button @click="handleJoin" class="px-6 py-2.5 bg-accent hover:bg-accent text-text-primary rounded-xl shadow-lg shadow-indigo-600/30 font-bold transition-all">Tham gia</button>
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

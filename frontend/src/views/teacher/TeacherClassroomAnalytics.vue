<template>
  <div class="teacher-classroom-analytics min-h-screen bg-slate-950 p-6">
    <header class="mb-8">
      <button type="button" class="text-slate-400 hover:text-white transition-colors mb-4 flex items-center gap-2" @click="$router.back()">
        <BaseIcon name="arrow-left" class="w-4 h-4" />
        <span class="text-sm">Quay láº¡i</span>
      </button>
      <h1 class="text-2xl font-bold text-white">PhÃ¢n tÃ­ch lá»›p há»c</h1>
      <p class="text-slate-400 mt-1">Thá»‘ng kÃª tiáº¿n Ä‘á»™ vÃ  káº¿t quáº£ há»c táº­p</p>
    </header>

    
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <template v-else-if="stats">
      
      <div class="grid grid-cols-4 gap-4 mb-8">
        <div class="bg-slate-900/60 border border-white/10 rounded-2xl p-5">
          <div class="text-sm text-slate-400 mb-1">Tá»•ng há»c viÃªn</div>
          <div class="text-3xl font-bold text-white">{{ stats.totalStudents }}</div>
        </div>
        <div class="bg-slate-900/60 border border-white/10 rounded-2xl p-5">
          <div class="text-sm text-slate-400 mb-1">Äiá»ƒm trung bÃ¬nh</div>
          <div class="text-3xl font-bold text-cyan-400">{{ stats.avgScore }}%</div>
        </div>
        <div class="bg-slate-900/60 border border-white/10 rounded-2xl p-5">
          <div class="text-sm text-slate-400 mb-1">Tá»· lá»‡ Ä‘áº¡t</div>
          <div class="text-3xl font-bold text-emerald-400">{{ stats.passRate }}%</div>
        </div>
        <div class="bg-slate-900/60 border border-white/10 rounded-2xl p-5">
          <div class="text-sm text-slate-400 mb-1">HoÃ n thÃ nh</div>
          <div class="text-3xl font-bold text-amber-400">{{ (stats.completionRate * 100).toFixed(1) }}%</div>
        </div>
      </div>

      
      <div class="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden">
        <div class="p-5 border-b border-white/10">
          <h2 class="text-lg font-bold text-white">Chi tiáº¿t Ä‘iá»ƒm sá»‘</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-white/10 text-slate-400">
                <th class="text-left p-4 font-medium">Há»c viÃªn</th>
                <th v-for="(title, id) in stats.quizTitles" :key="id" class="text-center p-4 font-medium">{{ title }}</th>
                <th class="text-center p-4 font-medium">XP</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in stats.studentScores" :key="student.studentId" class="border-b border-white/5 hover:bg-white/5">
                <td class="p-4 text-white font-medium">{{ student.name }}</td>
                <td v-for="(title, id) in stats.quizTitles" :key="id" class="text-center p-4">
                  <span class="font-mono" :class="getScoreClass(student.scoresPerQuiz[id])">{{ student.scoresPerQuiz[id] ?? '-' }}%</span>
                </td>
                <td class="text-center p-4 font-mono text-amber-400">{{ student.totalXP }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <div v-else class="text-center py-20 text-slate-500">
      KhÃ´ng cÃ³ dá»¯ liá»‡u phÃ¢n tÃ­ch
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import BaseIcon from '@/shared/components/BaseIcon.vue';

const route = useRoute();
const classroomId = route.params.id as string;
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

const loading = ref(true);
const stats = ref<any>(null);

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

function getScoreClass(score: number | undefined | null): string {
  if (score == null) return 'text-slate-500';
  if (score >= 80) return 'text-emerald-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-rose-400';
}

async function loadAnalytics() {
  try {
    const headers = getAuthHeaders();
    const res = await fetch(`${BASE_URL}/api/v1/classrooms/${classroomId}/analytics`, { headers });
    if (res.ok) {
      stats.value = await res.json();
    }
  } catch (err) {
    console.error('Failed to load analytics:', err);
  } finally {
    loading.value = false;
  }
}

onMounted(loadAnalytics);
</script>

<style scoped>
.teacher-classroom-analytics {
  background: #020617;
}
</style>

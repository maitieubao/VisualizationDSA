<template>
  <section class="tab-section fade-in">
    <div class="card card--quizzes">
      <h3 class="card-heading"><BaseIcon name="clipboard-list" style="width:18px;height:18px" /> Ngân hàng Quiz hiện có</h3>
      <div class="overflow-x-auto rounded-xl border border-border-default/50 bg-bg-surface shadow-xl mt-4">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr class="bg-bg-surface border-b border-border-default">
              <th class="px-4 py-4 w-12 text-center text-text-muted"></th>
              <th class="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Tiêu đề</th>
              <th class="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Chủ đề</th>
              <th class="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Độ khó</th>
              <th class="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">XP</th>
              <th class="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Số câu hỏi</th>
              <th class="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700/50">
            <template v-for="q in quizzesList" :key="q.id">
              <tr class="hover:bg-bg-hover/30 transition-colors cursor-pointer" @click="toggleQuizDetails(q.id)">
                <td class="px-4 py-4 text-center text-text-muted text-xs">
                  <BaseIcon :name="expandedQuizId === q.id ? 'chevron-down' : 'chevron-right'" class="w-4 h-4 inline-block transition-transform duration-200" />
                </td>
                <td class="px-6 py-4 font-bold text-text-primary text-sm">{{ q.title }}</td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-md bg-accent/10 text-accent border border-border-accent text-xs font-medium">{{ q.topic }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-md border text-xs font-bold" 
                    :class="{
                      'bg-accent-green/10 text-accent-green border-accent-green/20': q.difficulty === 'Easy',
                      'bg-accent-warm/10 text-accent-warm border-accent-warm/20': q.difficulty === 'Medium',
                      'bg-accent-red/10 text-accent-red border-red-500/20': q.difficulty === 'Hard'
                    }">
                    {{ getDifficultyLabel(q.difficulty) }}
                  </span>
                </td>
                <td class="px-6 py-4 font-mono font-bold text-accent-purple text-sm">{{ q.xpReward }} XP</td>
                <td class="px-6 py-4 text-text-secondary text-sm">{{ q.questionCount }} câu</td>
                <td class="px-6 py-4 text-right">
                  <button class="p-1.5 rounded-lg bg-accent-red/10 text-accent-red hover:bg-accent-red hover:text-text-primary transition-colors ml-auto" @click.stop="deleteQuiz(q.id, q.title)" title="Xóa Quiz">
                    <BaseIcon name="trash" class="w-4 h-4" />
                  </button>
                </td>
              </tr>
              <tr v-if="expandedQuizId === q.id" class="bg-bg-secondary/60 border-t border-border-default/50">
                <td colspan="7" class="px-8 py-6">
                  <div class="rounded-xl border border-border-default bg-bg-hover/40 p-5">
                    <div v-if="quizDetailsLoading" class="flex items-center justify-center gap-2 text-text-secondary py-6">
                      <BaseIcon name="hourglass" class="w-5 h-5 animate-spin" />
                      <span>Đang tải câu hỏi...</span>
                    </div>
                    <div v-else-if="quizDetails.length === 0" class="text-center text-text-muted py-6">Không có câu hỏi nào.</div>
                    <div v-else class="space-y-4">
                      <div v-for="(qs, idx) in quizDetails" :key="idx" class="bg-bg-hover border border-border-default rounded-lg p-4">
                        <div class="flex items-start gap-3 mb-3">
                          <span class="flex-shrink-0 bg-accent/20 text-accent px-2.5 py-1 rounded-md text-xs font-bold border border-border-accent">
                            Câu {{ idx + 1 }}
                          </span>
                          <span class="font-semibold text-text-primary leading-relaxed">{{ qs.text }}</span>
                        </div>
                        <div class="space-y-2 pl-11">
                          <div v-for="(opt, oi) in qs.options" :key="oi" 
                            class="px-4 py-2 rounded-lg border text-sm transition-colors flex items-center justify-between"
                            :class="oi === qs.correctIndex ? 'bg-accent-green/10 border-accent-green/30 text-accent-green' : 'bg-bg-secondary/50 border-border-default text-text-secondary'"
                          >
                            <div>
                              <span class="font-bold mr-2 opacity-70">{{ ['A', 'B', 'C', 'D'][oi] }}.</span>
                              {{ opt }}
                            </div>
                            <span v-if="oi === qs.correctIndex" class="text-accent-green text-xs font-bold flex items-center gap-1 bg-accent-green/20 px-2 py-0.5 rounded">
                              <BaseIcon name="check" class="w-3 h-3" /> Đáp án đúng
                            </span>
                          </div>
                        </div>
                        <div v-if="qs.explanation" class="mt-4 pl-11 flex gap-2 text-text-secondary text-sm">
                          <BaseIcon name="bulb" class="w-4 h-4 text-accent-warm flex-shrink-0 mt-0.5" />
                          <span><strong class="text-text-secondary">Giải thích:</strong> {{ qs.explanation }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-if="quizzesList.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-text-muted">
                <BaseIcon name="clipboard-list" class="w-12 h-12 mx-auto mb-3 opacity-20" />
                Đang tải danh sách Quiz...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAdminApi } from './useAdminApi';

const emit = defineEmits<{ (e: 'refresh-dashboard'): void }>();
const { BASE_URL, getAuthHeaders, pushLog, getDifficultyLabel } = useAdminApi();

interface QuizQuestion { text: string; options: string[]; correctIndex: number; explanation?: string; }
interface QuizItem { id: string; title: string; topic: string; difficulty: string; xpReward: number; questionCount: number; createdAt: string; }

const quizzesList = ref<QuizItem[]>([]);
const expandedQuizId = ref<string | null>(null);
const quizDetails = ref<QuizQuestion[]>([]);
const quizDetailsLoading = ref(false);

async function loadQuizzes(): Promise<void> {
  try { const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/quizzes`, { headers: getAuthHeaders() }); if (res.ok) quizzesList.value = await res.json(); }
  catch { pushLog('ERROR', 'Lỗi tải danh sách Quiz.'); }
}

async function deleteQuiz(quizId: string, title: string): Promise<void> {
  if (!confirm(`Bạn có chắc chắn muốn xóa Quiz "${title}" không?`)) return;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/quizzes/${quizId}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (res.ok) { quizzesList.value = quizzesList.value.filter(q => q.id !== quizId); pushLog('INFO', `Đã xóa quiz "${title}"`); emit('refresh-dashboard'); }
    else alert('Lỗi khi xóa Quiz.');
  } catch { alert('Lỗi kết nối khi xóa Quiz.'); }
}

async function toggleQuizDetails(quizId: string): Promise<void> {
  if (expandedQuizId.value === quizId) { expandedQuizId.value = null; quizDetails.value = []; return; }
  expandedQuizId.value = quizId; quizDetails.value = []; quizDetailsLoading.value = true;
  try { const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/${quizId}`, { headers: getAuthHeaders() }); if (res.ok) { const data = await res.json(); quizDetails.value = data.questions ?? []; } }
  catch { pushLog('ERROR', 'Lỗi tải chi tiết câu hỏi.'); } finally { quizDetailsLoading.value = false; }
}

onMounted(() => loadQuizzes());
</script>

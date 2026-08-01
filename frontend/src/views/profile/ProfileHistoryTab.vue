<template>
  <section class="panel-section">
    <div class="panel-header">
      <h2 class="panel-title">Quiz History</h2>
      <p class="panel-subtitle">Danh sách kết quả các bài quiz kiểm tra kiến thức bạn đã thực hiện.</p>
    </div>

    <div v-if="loadingHistory" class="loading-state-box">
      Đang tải dữ liệu lịch sử làm bài...
    </div>

    <div v-else-if="quizHistory.length === 0" class="empty-state-box">
      <BaseIcon name="clipboard-list" class="w-10 h-10 text-slate-500 mb-2" />
      <p class="empty-title">Chưa có lịch sử ngắt mạch quiz</p>
      <p class="empty-desc">Bạn chưa thực hiện bài trắc nghiệm nào. Hãy bắt đầu học để đánh giá năng lực!</p>
    </div>

    <div v-else class="pm-table-container">
      <table class="pm-table">
        <thead>
          <tr>
            <th>TÊN BÀI QUIZ</th>
            <th>ĐIỂM SỐ</th>
            <th>TRẠNG THÁI</th>
            <th>THỜI GIAN THỰC HIỆN</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="attempt in quizHistory" :key="attempt.id">
            <td class="cell-title">{{ attempt.quizTitle }}</td>
            <td class="cell-score">{{ attempt.score }} / {{ attempt.maxScore }}</td>
            <td>
              <span class="status-pill" :class="attempt.passed ? 'status-pill--pass' : 'status-pill--fail'">
                {{ attempt.passed ? 'ĐẠT ✓' : 'CHƯA ĐẠT ✗' }}
              </span>
            </td>
            <td class="cell-date">{{ formatAttemptDate(attempt.attemptedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

const authStore = useAuthStore();
const loadingHistory = ref(false);
const quizHistory = ref<any[]>([]);
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

function formatAttemptDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

async function loadQuizHistory() {
  loadingHistory.value = true;
  try {
    const token = authStore.getAccessToken();
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) quizHistory.value = await res.json();
  } catch (err) {
    console.error('Failed to load quiz history:', err);
  } finally {
    loadingHistory.value = false;
  }
}

onMounted(() => loadQuizHistory());
</script>

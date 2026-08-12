<template>
  <section class="panel-section">
    <div class="panel-header">
      <h2 class="panel-title">Quiz History</h2>
      <p class="panel-subtitle">Danh sách kết quả các bài quiz kiểm tra kiến thức bạn đã thực hiện.</p>
    </div>

    <div v-if="loadingHistory" class="loading-state-box">
      Đang tải dữ liệu lịch sử làm bài...
    </div>

    <!-- PR-014: error state RIÊNG tách khỏi empty — 401 (phiên hết hạn) ≠ 5xx/mạng (thử lại) -->
    <div v-else-if="historyError" class="error-state-box" role="alert">
      <div class="error-state-icon">
        <BaseIcon name="alert-triangle" class="w-8 h-8" />
      </div>
      <p class="empty-title">{{ historyError.message }}</p>
      <p v-if="historyError.kind === 'expired'" class="empty-desc">Vui lòng đăng nhập lại để tiếp tục xem lịch sử làm bài.</p>
      <p v-else class="empty-desc">Lỗi tạm thời — bạn có thể thử lại ngay bây giờ.</p>
      <button v-if="historyError.kind !== 'expired'" type="button" class="pm-btn pm-btn--primary error-retry-btn" @click="loadQuizHistory">
        Thử lại
      </button>
    </div>

    <div v-else-if="quizHistory.length === 0" class="empty-state-box">
      <BaseIcon name="clipboard-list" class="w-10 h-10 text-text-muted mb-2" />
      <p class="empty-title">Chưa có lịch sử ngắt mạch quiz</p>
      <p class="empty-desc">Bạn chưa thực hiện bài trắc nghiệm nào. Hãy bắt đầu học để đánh giá năng lực!</p>
    </div>

    <!-- PR-032: overflow-x-auto cho mobile + phân trang client khi danh sách dài -->
    <div v-else class="pm-table-container pm-table-container--scroll">
      <table class="pm-table pm-table--wide">
        <thead>
          <tr>
            <th>TÊN BÀI QUIZ</th>
            <th>ĐIỂM SỐ</th>
            <th>TRẠNG THÁI</th>
            <th>THỜI GIAN THỰC HIỆN</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="attempt in visibleHistory" :key="attempt.id">
            <td class="cell-title">{{ attempt.quizTitle }}</td>
            <td class="cell-score">{{ attempt.score }} / {{ attempt.maxScore }}</td>
            <td>
              <span class="status-pill" :class="attempt.passed ? 'status-pill--pass' : 'status-pill--fail'">
                {{ attempt.passed ? 'ĐẠT' : 'CHƯA ĐẠT' }} <BaseIcon :name="attempt.passed ? 'check' : 'close'" class="w-3 h-3 inline ml-1 align-middle" />
              </span>
            </td>
            <td class="cell-date">{{ formatAttemptDate(attempt.attemptedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="pageCount > 1" class="history-pagination" aria-label="Phân trang lịch sử">
      <button type="button" class="pm-btn pm-btn--ghost" :disabled="page <= 1" @click="page--">
        Trang trước
      </button>
      <span class="history-pagination-info">{{ page }} / {{ pageCount }}</span>
      <button type="button" class="pm-btn pm-btn--ghost" :disabled="page >= pageCount" @click="page++">
        Trang sau
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { fetchQuizHistory, QuizHistoryError } from '../../features/quiz-system/service/quizApi';
import type { QuizHistoryEntry } from '../../features/quiz-system/service/quizApi';

const authStore = useAuthStore();
const loadingHistory = ref(false);

// PR-011: dùng fetchQuizHistory chung (features/quiz-system/service/quizApi) — bỏ duplicate fetch raw.
const quizHistory = ref<QuizHistoryEntry[]>([]);

// PR-014: error state riêng — empty ≠ error; kind phân biệt phiên hết hạn (401) với lỗi server.
const historyError = ref<{ kind: 'expired' | 'server' | 'network'; message: string } | null>(null);

// PR-032: phân trang client — PAGE_SIZE dòng/trang.
const PAGE_SIZE = 10;
const page = ref(1);
const pageCount = computed(() => Math.max(1, Math.ceil(quizHistory.value.length / PAGE_SIZE)));
const visibleHistory = computed(() => quizHistory.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE));

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

async function loadQuizHistory(): Promise<void> {
  loadingHistory.value = true;
  historyError.value = null;
  try {
    const token = authStore.getAccessToken();
    quizHistory.value = await fetchQuizHistory(token ?? '');
  } catch (err: unknown) {
    // PR-014: map lỗi rõ ràng — 401 phiên hết hạn; 5xx/mạng → banner + Thử lại.
    if (err instanceof QuizHistoryError) {
      const status = err.status;
      if (status === 401) {
        historyError.value = { kind: 'expired', message: 'Phiên đã hết hạn, vui lòng đăng nhập lại.' };
      } else if (status >= 500) {
        historyError.value = { kind: 'server', message: 'Máy chủ đang gặp sự cố, vui lòng thử lại sau.' };
      } else {
        historyError.value = { kind: 'network', message: 'Không thể tải lịch sử làm bài. Kiểm tra kết nối mạng.' };
      }
    } else {
      historyError.value = { kind: 'network', message: 'Không thể tải lịch sử làm bài. Kiểm tra kết nối mạng.' };
    }
  } finally {
    loadingHistory.value = false;
  }
}

onMounted(() => { void loadQuizHistory(); });
</script>

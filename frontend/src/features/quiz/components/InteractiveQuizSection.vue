<template>
  <div class="flex flex-col gap-6">
    <!-- Multiple choice block -->
    <div class="flex flex-col gap-4">
      <h4 class="section-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="icon-blue">
          <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
        </svg>
        Câu hỏi trắc nghiệm lý thuyết dsa
      </h4>
      <div v-for="(q, qIdx) in quizQuestions" :key="q.id" class="question-card">
        <div class="text-[10px] font-bold text-text-secondary uppercase tracking-wide">Câu hỏi {{ qIdx + 1 }}</div>
        <div class="text-sm font-bold text-text-primary">{{ q.title }}</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
          <label 
            v-for="opt in q.options" 
            :key="opt.key" 
            class="option-label" 
            :class="userAnswers[q.id] === opt.key ? 'active' : 'inactive'"
          >
            <input type="radio" :name="q.id" :value="opt.key" :checked="userAnswers[q.id] === opt.key" @change="$emit('updateAnswer', q.id, opt.key)" class="radio-input" />
            <span><strong>{{ opt.key }}.</strong> {{ opt.text }}</span>
          </label>
        </div>
      </div>
    </div>
    <div class="divider" />
    
    <!-- Interactive Code Compliance Block -->
    <div class="flex flex-col gap-3">
      <div class="flex justify-between items-center">
        <h4 class="section-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="icon-blue">
            <path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16" />
          </svg>
          Thử thách viết mã (Code challenge)
        </h4>
        <span class="required-badge">Yêu cầu từ khóa: `temp`, `arr`</span>
      </div>
      <p class="text-xs text-text-secondary leading-normal m-0 font-['Outfit']">Hãy hoàn thành hàm tráo đổi phần tử sử dụng biến tạm. Hệ thống sẽ biên dịch và kiểm duyệt compliance thời gian thực trong dưới 2ms.</p>
      <textarea :value="studentCode" @input="$emit('updateCode', ($event.target as HTMLTextAreaElement).value)" rows="4" placeholder="function swap(arr, i, j) { ... }" class="code-textarea" />
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <button @click="$emit('runCompliance')" class="compliance-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-3.5 h-3.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM9 12l2 2 4-4" /></svg>
          <span>Kiểm duyệt cú pháp (Linter Check)</span>
        </button>
        <div v-if="complianceResult !== null" class="text-xs font-mono flex items-center gap-1.5">
          <span v-if="complianceResult" class="text-accent-green font-bold">🟢 Cú pháp hợp lệ (Compliant) <span class="text-[10px] text-text-muted">(RAM &lt; 22MB, Latency &lt; 2ms)</span></span>
          <span v-else class="text-accent-red font-bold">🔴 Thiếu từ khóa bắt buộc!</span>
        </div>
      </div>
    </div>

    <!-- Submit Result Section -->
    <div class="mt-2 flex flex-col gap-4">
      <button @click="$emit('submit')" class="submit-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-4 h-4"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" /></svg>
        <span>Nộp Bài Chấm Điểm</span>
      </button>
      <div 
        v-if="scoreResult !== null" 
        class="score-result-panel"
        :class="scoreResult.passed ? 'passed' : 'failed'"
      >
        <div class="passed-badge-circle" :class="scoreResult.passed ? 'passed' : 'failed'">{{ scoreResult.passed ? '✓' : '!' }}</div>
        <div class="flex-1">
          <h5 class="passed-title" :class="scoreResult.passed ? 'passed' : 'failed'">Kết quả: {{ scoreResult.passed ? 'ĐẠT (PASSED)' : 'CHƯA ĐẠT (FAILED)' }}</h5>
          <p class="text-xs text-text-secondary mt-1 mb-0 leading-normal font-medium font-['Outfit']">Điểm số trắc nghiệm: <strong class="text-text-primary">{{ scoreResult.totalScore }} / 30</strong>. Kiểm duyệt mã nguồn: <strong class="text-text-primary">{{ complianceResult ? 'Đạt' : 'Chưa Đạt' }}</strong>. <span v-if="scoreResult.passed">Chúc mừng! Bạn đã nắm vững kiến thức sắp xếp nổi bọt.</span><span v-else>Cần đạt tối thiểu 80% điểm số (24/30 điểm) và vượt qua kiểm duyệt linter để được tính là hoàn thành. Hãy xem lại slide lý thuyết!</span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  quizQuestions: any[];
  userAnswers: Record<string, string>;
  studentCode: string;
  complianceResult: boolean | null;
  scoreResult: { totalScore: number; passed: boolean } | null;
}>();

defineEmits<{
  (e: 'updateAnswer', id: string, val: string): void;
  (e: 'updateCode', val: string): void;
  (e: 'runCompliance'): void;
  (e: 'submit'): void;
}>();
</script>

<style scoped>
.section-title {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
}

.icon-blue {
  color: var(--color-accent-blue);
}

.question-card {
  padding: 16px;
  background-color: color-mix(in srgb, var(--vis-panel-bg-deep) 50%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-border-subtle) 80%, transparent);
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-lg);
  font-size: var(--text-xs);
  cursor: pointer;
  transition: var(--transition-fast);
}

.option-label.active {
  border: 1px solid color-mix(in srgb, var(--color-accent-blue) 50%, transparent);
  background-color: var(--color-accent-blue-dim);
  color: var(--color-text-primary);
  font-weight: var(--font-semibold);
}

.option-label.inactive {
  border: 1px solid var(--color-border-subtle);
  background-color: color-mix(in srgb, var(--color-bg-secondary) 40%, transparent);
  color: var(--color-text-secondary);
}

.option-label.inactive:hover {
  border-color: var(--color-border-default);
  color: var(--color-text-primary);
}

.radio-input {
  accent-color: var(--color-accent-blue-light);
}

.divider {
  height: 1px;
  background-color: var(--color-border-subtle);
}

.required-badge {
  font-size: 10px;
  font-weight: var(--font-bold);
  color: var(--color-accent-yellow);
  background-color: var(--color-accent-yellow-dim);
  border: 1px solid color-mix(in srgb, var(--color-accent-yellow) 20%, transparent);
  padding: 2px 8px;
  border-radius: var(--radius-lg);
}

.code-textarea {
  width: 100%;
  background-color: var(--color-bg-primary);
  border: 1px solid color-mix(in srgb, var(--color-border-default) 80%, transparent);
  color: var(--color-text-primary);
  border-radius: var(--radius-xl);
  padding: 12px;
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  outline: none;
  resize: vertical;
  transition: var(--transition-fast);
}

.code-textarea:focus {
  border-color: var(--color-accent-blue);
}

.code-textarea::placeholder {
  color: var(--color-text-muted);
}

.compliance-btn {
  padding: 8px 16px;
  background-color: color-mix(in srgb, var(--color-bg-hover) 60%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent-blue) 40%, transparent);
  color: var(--color-accent-blue);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  border-radius: var(--radius-lg);
  transition: var(--transition-smooth);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.compliance-btn:hover {
  border-color: color-mix(in srgb, var(--color-accent-blue) 60%, transparent);
  background-color: var(--color-bg-active);
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(to right, var(--color-accent-green), color-mix(in srgb, var(--color-accent-green) 80%, var(--color-accent-cyan)));
  color: var(--color-text-primary);
  font-weight: var(--font-bold);
  font-size: var(--text-sm);
  border: none;
  border-radius: var(--radius-xl);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: var(--transition-smooth);
  box-shadow: var(--shadow-accent);
}

.submit-btn:hover {
  opacity: 0.95;
  transform: translateY(-1px);
}

.submit-btn:active {
  transform: scale(0.98);
}

.score-result-panel {
  padding: 16px;
  border-radius: var(--radius-xl);
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: var(--transition-smooth);
}

.score-result-panel.passed {
  background-color: var(--color-accent-green-dim);
  border-color: color-mix(in srgb, var(--color-accent-green) 35%, transparent);
  color: var(--color-accent-green);
  box-shadow: 0 0 15px var(--color-accent-green-glow);
}

.score-result-panel.failed {
  background-color: var(--color-accent-yellow-dim);
  border-color: color-mix(in srgb, var(--color-accent-yellow) 35%, transparent);
  color: var(--color-accent-yellow);
  box-shadow: 0 0 15px var(--color-accent-yellow-glow);
}

.passed-badge-circle {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-bold);
  font-size: var(--text-sm);
  flex-shrink: 0;
  color: var(--color-bg-primary);
}

.passed-badge-circle.passed {
  background-color: var(--color-accent-green);
}

.passed-badge-circle.failed {
  background-color: var(--color-accent-yellow);
}

.passed-title {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  margin: 0;
}

.passed-title.passed {
  color: var(--color-accent-green);
}

.passed-title.failed {
  color: var(--color-accent-yellow);
}

.text-accent-green {
  color: var(--color-accent-green);
}

.text-accent-red {
  color: var(--color-accent-red);
}
</style>

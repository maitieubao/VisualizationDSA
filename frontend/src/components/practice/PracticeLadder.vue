<template>
  <div class="practice-ladder w-full h-full flex flex-col gap-6">
    <!-- Header / Stepper -->
    <div class="flex flex-col md:flex-row gap-4 p-4 bg-bg-secondary border border-border-default rounded-2xl flex-shrink-0 relative overflow-hidden">
      <!-- Background Effect -->
      <div class="absolute inset-0 bg-gradient-to-r from-accent/5 to-accent-green/5 pointer-events-none"></div>

      <!-- Step 1: Quiz -->
      <LadderStep 
        :step="1" 
        label="📝 Quiz Cơ Bản" 
        class="flex-1 z-10"
        :active="currentActiveStep === 'Quiz'"
        :passed="status.quizPassed"
        :locked="false"
        :score="status.quizScore"
        @click="currentActiveStep = 'Quiz'"
      />

      <!-- Arrow 1 -->
      <div class="hidden md:flex items-center justify-center text-text-muted">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
      </div>

      <!-- Step 2: Lab -->
      <LadderStep 
        :step="2" 
        label="🧪 Thực Hành Lab" 
        class="flex-1 z-10"
        :active="currentActiveStep === 'Lab' && status.quizPassed"
        :passed="status.labPassed"
        :locked="!status.quizPassed"
        :score="status.labScore"
        @click="currentActiveStep = 'Lab'"
      />

      <!-- Arrow 2 -->
      <div class="hidden md:flex items-center justify-center text-text-muted">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
      </div>

      <!-- Step 3: LeetCode -->
      <LadderStep 
        :step="3" 
        label="💻 LeetCode Sandbox" 
        class="flex-1 z-10"
        :active="currentActiveStep === 'LeetCode' && status.labPassed"
        :passed="status.leetcodePassed"
        :locked="!status.labPassed"
        :score="status.leetcodeScore"
        @click="currentActiveStep = 'LeetCode'"
      />
    </div>

    <!-- Main Content Area with Hint Sidebar -->
    <div class="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
      
      <!-- Current Step View -->
      <div class="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center pb-20">
        <div class="w-full max-w-4xl">
          <QuizComponent 
            v-if="currentActiveStep === 'Quiz'" 
            :node-id="nodeId" 
            :session-id="sessionId"
            @update-status="fetchStatus"
            @continue="currentActiveStep = 'Lab'"
          />
          
          <InteractiveLab 
            v-else-if="currentActiveStep === 'Lab' && status.quizPassed" 
            :node-id="nodeId" 
            :session-id="sessionId"
            @update-status="fetchStatus"
            @continue="currentActiveStep = 'LeetCode'"
          />
          
          <LeetCodeEditor 
            v-else-if="currentActiveStep === 'LeetCode' && status.labPassed" 
            :node-id="nodeId" 
            :session-id="sessionId"
            @update-status="fetchStatus"
            @continue="$emit('completed')"
          />
          
          <div v-else class="text-center py-20 text-text-muted">
            Bạn cần hoàn thành bước trước đó để mở khóa nội dung này.
          </div>
        </div>
      </div>

      <!-- AI Hint Sidebar (Desktop) -->
      <HintPanel 
        v-if="currentActiveStep === 'LeetCode'"
        class="hidden lg:flex"
        :node-id="nodeId" 
        :session-id="sessionId" 
        :step="currentActiveStep"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';
import LadderStep from './LadderStep.vue';
import QuizComponent from './QuizComponent.vue';
import InteractiveLab from './InteractiveLab.vue';
import LeetCodeEditor from './LeetCodeEditor.vue';
import HintPanel from './HintPanel.vue';

const props = defineProps({
  nodeId: { type: String, required: true },
  sessionId: { type: String, required: true }
});

const emit = defineEmits(['completed']);

const status = ref<any>({
  quizPassed: false,
  labPassed: false,
  leetcodePassed: false,
});

const currentActiveStep = ref('Quiz');

const fetchStatus = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/v1/nodes/${props.nodeId}/practice-status`, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
    if (res.ok) {
      status.value = await res.json();
      
      // Auto-navigate to latest unlocked step
      if (!status.value.quizPassed) currentActiveStep.value = 'Quiz';
      else if (!status.value.labPassed) currentActiveStep.value = 'Lab';
      else currentActiveStep.value = 'LeetCode';
    }
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  fetchStatus();
});
</script>

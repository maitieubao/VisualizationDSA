<template>
  <div class="item-player bg-bg-secondary/60 border border-border-default rounded-2xl overflow-hidden">
    
    <header class="player-header px-6 py-4 border-b border-border-default flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-center gap-3">
        <button 
          type="button" 
          class="text-text-secondary hover:text-text-primary transition-colors" 
          @click="$emit('back')"
        >
          <BaseIcon name="arrow-left" class="w-5 h-5" />
        </button>
        
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-xl" :class="getTypeBgClass(item.itemType)">
            <BaseIcon 
              :name="getTypeIcon(item.itemType)" 
              class="w-5 h-5" 
              :class="getTypeTextClass(item.itemType)"
            />
          </div>
          <div>
            <h2 class="font-bold text-text-primary truncate">{{ item.overrideTitle || item.lessonTitle || item.quizTitle || item.codelabTitle }}</h2>
            <div class="flex items-center gap-2 text-xs text-text-secondary mt-1">
              <span class="badge" :class="getTypeBadgeClass(item.itemType)">{{ item.itemType }}</span>
              <span v-if="item.isRequired" class="badge badge-rose text-[10px]">Bắt buộc</span>
              <span v-if="item.xpReward" class="text-accent-warm font-mono">+{{ item.xpReward }} XP</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3 ml-auto">
          <div class="hidden sm:flex items-center gap-2 bg-bg-surface px-3 py-1.5 rounded-lg">
            <BaseIcon name="zap" class="w-4 h-4 text-accent-warm" />
            <span class="text-sm font-bold text-accent-warm">{{ item.xpReward || 0 }} XP</span>
          </div>
        </div>
      </header>

      
      <main class="player-content p-6">
        
        <LessonStepTheory
          v-if="item.itemType === 'Lesson'"
          :title="item.overrideTitle || item.lessonTitle"
          :content="item.contentMd || item.contentMarkdown"
          :sandbox-type="item.sandboxType"
          :sandbox-config="item.sandboxConfig"
          @complete="$emit('complete')"
        />

        
        <LessonStepQuiz
          v-else-if="item.itemType === 'Quiz'"
          :quiz-id="item.quizId"
          :max-attempts="item.maxAttempts"
          @complete="$emit('complete')"
        />

        
        <LessonStepCodeLab
          v-else-if="item.itemType === 'Codelab'"
          :codelab-id="item.codelabId"
          :max-attempts="item.maxAttempts"
          @complete="$emit('complete')"
        />

        
        <div v-else class="text-center py-12 text-text-secondary">
          <BaseIcon name="alert-circle" class="w-12 h-12 mx-auto mb-4 text-text-muted" />
          <p>Loại bài học không được hỗ trợ: {{ item.itemType }}</p>
        </div>
      </main>

      
      <footer class="player-footer px-6 py-4 border-t border-border-default flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-xs text-text-secondary">
            {{ getProgressText() }}
          </span>
        </div>
        
        <div class="flex items-center gap-2">
          <button 
            v-if="!isCompleted" 
            type="button" 
            class="btn-primary" 
            @click="$emit('complete')"
          >
            <BaseIcon name="check" class="w-4 h-4 inline mr-1" />
            Đánh dấu hoàn thành
          </button>
          
          <button 
            v-if="hasNext" 
            type="button" 
            class="btn-primary" 
            @click="$emit('next')"
          >
            <span>Bài tiếp theo</span>
            <BaseIcon name="arrow-right" class="w-4 h-4 inline ml-1" />
          </button>
          
          <span v-else class="text-sm text-accent-green font-bold">
            Đã hoàn thành module!
          </span>
        </div>
      </footer>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';
import LessonStepTheory from '@/views/lesson/components/LessonStepTheory.vue';
import LessonStepQuiz from '@/views/lesson/components/LessonStepQuiz.vue';
import LessonStepCodeLab from '@/views/lesson/components/LessonStepCodeLab.vue';

interface Props {
  item: any;
  classroomId: string;
}

interface Emits {
  (e: 'complete'): void;
  (e: 'next'): void;
  (e: 'back'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isCompleted = computed(() => props.item?.status === 'Completed');
const hasNext = computed(() => false); 

function getTypeIcon(type: string) {
  switch (type) {
    case 'Lesson': return 'book-open';
    case 'Quiz': return 'help-circle';
    case 'Codelab': return 'code';
    default: return 'file-text';
  }
}

function getTypeBgClass(type: string) {
  switch (type) {
    case 'Lesson': return 'bg-accent/20';
    case 'Quiz': return 'bg-accent-purple/20';
    case 'Codelab': return 'bg-accent-green/20';
    default: return 'bg-slate-500/20';
  }
}

function getTypeTextClass(type: string) {
  switch (type) {
    case 'Lesson': return 'text-accent';
    case 'Quiz': return 'text-accent-purple';
    case 'Codelab': return 'text-accent-green';
    default: return 'text-text-secondary';
  }
}

function getTypeBadgeClass(type: string) {
  switch (type) {
    case 'Lesson': return 'badge-indigo';
    case 'Quiz': return 'badge-purple';
    case 'Codelab': return 'badge-emerald';
    default: return 'badge-slate';
  }
}

function getProgressText() {
  return 'Tiến độ: Đang học';
}
</script>

<style scoped>

</style>

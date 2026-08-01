<template>
  <div class="item-player bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden">
    
    <header class="player-header px-6 py-4 border-b border-white/10 flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-center gap-3">
        <button 
          type="button" 
          class="text-slate-400 hover:text-white transition-colors" 
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
            <h2 class="font-bold text-white truncate">{{ item.overrideTitle || item.lessonTitle || item.quizTitle || item.codelabTitle }}</h2>
            <div class="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span class="badge" :class="getTypeBadgeClass(item.itemType)">{{ item.itemType }}</span>
              <span v-if="item.isRequired" class="badge badge-rose text-[10px]">Báº¯t buá»™c</span>
              <span v-if="item.xpReward" class="text-amber-400 font-mono">+{{ item.xpReward }} XP</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3 ml-auto">
          <div class="hidden sm:flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg">
            <BaseIcon name="zap" class="w-4 h-4 text-amber-400" />
            <span class="text-sm font-bold text-amber-300">{{ item.xpReward || 0 }} XP</span>
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

        
        <div v-else class="text-center py-12 text-slate-400">
          <BaseIcon name="alert-circle" class="w-12 h-12 mx-auto mb-4 text-slate-600" />
          <p>Loáº¡i bÃ i há»c khÃ´ng Ä‘Æ°á»£c há»— trá»£: {{ item.itemType }}</p>
        </div>
      </main>

      
      <footer class="player-footer px-6 py-4 border-t border-white/10 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-xs text-slate-400">
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
            ÄÃ¡nh dáº¥u hoÃ n thÃ nh
          </button>
          
          <button 
            v-if="hasNext" 
            type="button" 
            class="btn-primary" 
            @click="$emit('next')"
          >
            <span>BÃ i tiáº¿p theo</span>
            <BaseIcon name="arrow-right" class="w-4 h-4 inline ml-1" />
          </button>
          
          <span v-else class="text-sm text-emerald-400 font-bold">
            ÄÃ£ hoÃ n thÃ nh module!
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
    case 'Lesson': return 'bg-indigo-500/20';
    case 'Quiz': return 'bg-purple-500/20';
    case 'Codelab': return 'bg-emerald-500/20';
    default: return 'bg-slate-500/20';
  }
}

function getTypeTextClass(type: string) {
  switch (type) {
    case 'Lesson': return 'text-indigo-400';
    case 'Quiz': return 'text-purple-400';
    case 'Codelab': return 'text-emerald-400';
    default: return 'text-slate-400';
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
  return 'Tiáº¿n Ä‘á»™: Äang há»c';
}
</script>

<style scoped>

</style>

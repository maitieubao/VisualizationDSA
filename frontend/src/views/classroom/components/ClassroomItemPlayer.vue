<template>
  <div class="item-player bg-bg-secondary border border-border-subtle rounded-2xl overflow-hidden">
    
    <header class="player-header px-6 py-4 border-b border-border-subtle flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-center gap-3">
        <button 
          type="button" 
          class="text-text-muted hover:text-text-primary transition-colors" 
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
            <h2 class="font-bold text-text-primary truncate">{{ itemTitle }}</h2>
            <div class="flex items-center gap-2 text-xs text-text-muted mt-1">
              <span class="badge" :class="getTypeBadgeClass(item.itemType)">{{ typeLabel(item.itemType) }}</span>
              <span v-if="item.isRequired" class="badge badge-rose text-[10px]">Bắt buộc</span>
            </div>
          </div>
        </div>

        <!-- CR-046: XP hiển thị đúng 1 chỗ duy nhất (bỏ bản trùng trong subtitle). -->
        <div class="flex items-center gap-3 ml-auto">
          <div class="hidden sm:flex items-center gap-2 bg-bg-surface/50 px-3 py-1.5 rounded-lg">
            <BaseIcon name="zap" class="w-4 h-4 text-accent-yellow" />
            <span class="text-sm font-bold text-accent-yellow">{{ item.xpReward || 0 }} XP</span>
          </div>
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

        <!-- CR-006: CustomLesson — render tối thiểu (title + nội dung nếu có) thay vì dead-end. -->
        <div v-else-if="item.itemType === 'CustomLesson'" class="custom-lesson max-w-3xl mx-auto text-center py-10">
          <div class="w-16 h-16 rounded-2xl bg-accent-yellow/20 text-accent-yellow flex items-center justify-center mx-auto mb-4">
            <BaseIcon name="file-text" class="w-8 h-8" />
          </div>
          <h3 class="text-xl font-bold text-text-primary mb-3">{{ itemTitle }}</h3>
          <p v-if="item.customContent || item.contentMd" class="text-text-secondary text-sm whitespace-pre-line leading-relaxed">
            {{ item.customContent || item.contentMd }}
          </p>
          <p v-else class="text-text-muted text-sm mb-6">Giảng viên chưa bổ sung nội dung cho bài học này.</p>
        </div>

        
        <div v-else class="text-center py-12 text-text-muted">
          <BaseIcon name="alert-circle" class="w-12 h-12 mx-auto mb-4 text-text-disabled" />
          <p>Loại bài học không được hỗ trợ: {{ item.itemType }}</p>
        </div>
      </main>

      
      <footer class="player-footer px-6 py-4 border-t border-border-subtle flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-xs text-text-muted">
            {{ progressText }}
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
          
          <!-- CR-004: "Đã hoàn thành module!" chỉ hiện khi ĐÂY LÀ item cuối cùng của curriculum. -->
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

interface PlayerCurriculumItem {
  id: string;
  itemType?: string;
}

interface PlayerCurriculumModule {
  items?: PlayerCurriculumItem[];
}

interface PlayerCurriculum {
  modules?: PlayerCurriculumModule[];
}

interface Props {
  item: any;
  classroomId: string;
  curriculum?: PlayerCurriculum | null;
}

interface Emits {
  (e: 'complete'): void;
  (e: 'next'): void;
  (e: 'back'): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const isCompleted = computed(() => props.item?.status === 'Completed');

const itemTitle = computed(() => {
  const it = props.item;
  if (!it) return 'Untitled';
  // CR-006: CustomLesson ưu tiên customLessonTitle (giảng viên tự soạn) trước overrideTitle.
  if (it.itemType === 'CustomLesson') {
    return it.customLessonTitle || it.overrideTitle || 'Untitled';
  }
  return it.overrideTitle
    || it.lessonTitle
    || it.quizTitle
    || it.codelabTitle
    || it.customLessonTitle
    || 'Untitled';
});

// CR-004: hasNext tính từ curriculum — item còn bài kế tiếp trong curriculum mới có "Bài tiếp theo".
const hasNext = computed(() => {
  if (!props.curriculum?.modules || !props.item?.id) return false;
  let found = false;
  for (const module of props.curriculum.modules) {
    for (const item of module.items ?? []) {
      if (found) return true;
      if (item.id === props.item.id) found = true;
    }
  }
  return false;
});

// CR-023: trạng thái tiến độ theo item.status thật (Completed → "Đã hoàn thành").
const progressText = computed(() => {
  const status = props.item?.status;
  if (status === 'Completed') return 'Tiến độ: Đã hoàn thành';
  if (status === 'InProgress') return 'Tiến độ: Đang học';
  return 'Tiến độ: Chưa bắt đầu';
});

function getTypeIcon(type: string) {
  switch (type) {
    case 'Lesson': return 'book-open';
    case 'Quiz': return 'help-circle';
    case 'Codelab': return 'code';
    case 'CustomLesson': return 'file-text';
    default: return 'file-text';
  }
}

function getTypeBgClass(type: string) {
  switch (type) {
    case 'Lesson': return 'bg-accent/20';
    case 'Quiz': return 'bg-accent-purple/20';
    case 'Codelab': return 'bg-accent-green/20';
    case 'CustomLesson': return 'bg-accent-yellow/20';
    default: return 'bg-bg-surface';
  }
}

function getTypeTextClass(type: string) {
  switch (type) {
    case 'Lesson': return 'text-accent';
    case 'Quiz': return 'text-accent-purple';
    case 'Codelab': return 'text-accent-green';
    case 'CustomLesson': return 'text-accent-yellow';
    default: return 'text-text-muted';
  }
}

function getTypeBadgeClass(type: string) {
  switch (type) {
    case 'Lesson': return 'badge-indigo';
    case 'Quiz': return 'badge-purple';
    case 'Codelab': return 'badge-emerald';
    case 'CustomLesson': return 'badge-amber';
    default: return 'badge-slate';
  }
}

// CR-045: nhãn tiếng Việt cho badge — đồng bộ với sidebar.
const typeLabel = (type: string) => {
  switch (type) {
    case 'Lesson': return 'Bài học';
    case 'Quiz': return 'Trắc nghiệm';
    case 'Codelab': return 'Codelab';
    case 'CustomLesson': return 'Tự soạn';
    default: return type || 'Unknown';
  }
};
</script>

<style scoped>
@import "./ClassroomItemPlayer.css";
</style>

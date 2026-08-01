<template>
  <div class="curriculum-sidebar bg-slate-900/60 border border-white/10 rounded-2xl p-4 h-full max-h-[calc(100vh-120px)] overflow-y-auto sticky top-24">
    
    <div class="mb-6 p-4 bg-slate-950/50 border border-white/5 rounded-xl">
      <h3 class="text-sm font-bold text-white mb-3">Tiáº¿n Ä‘á»™ tá»•ng thá»ƒ</h3>
      <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
        <div 
          class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" 
          :style="{ width: overallProgress + '%' }"
        ></div>
      </div>
      <div class="flex justify-between text-xs text-slate-400">
        <span>{{ completedItems }}/{{ totalItems }} bÃ i há»c Ä‘Ã£ hoÃ n thÃ nh</span>
        <span>{{ overallProgress }}%</span>
      </div>
    </div>

    
    <div class="space-y-3">
      <div 
        v-for="module in curriculum?.modules" 
        :key="module.id"
        class="module-accordion"
        :class="{ 'module-locked': isModuleLocked(module) }"
      >
        
        <button
          type="button"
          class="module-header w-full flex items-center justify-between p-3 rounded-xl transition-colors"
          :class="[
            isModuleExpanded(module.id) ? 'bg-white/5' : 'hover:bg-white/5',
            isModuleLocked(module) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          ]"
          @click="toggleModule(module.id)"
          :disabled="isModuleLocked(module)"
        >
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <div class="flex items-center justify-center w-8 h-8 rounded-lg" :class="getModuleStatusClass(module)">
              <span v-if="isModuleCompleted(module)" class="text-emerald-400 text-lg">âœ“</span>
              <span v-else-if="isModuleLocked(module)" class="text-slate-500">ðŸ”’</span>
              <span v-else class="text-indigo-400 font-bold text-sm">{{ getModuleIndex(module.id) + 1 }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-white truncate">{{ module.title }}</h4>
              <div class="flex items-center gap-2 mt-1 text-xs text-slate-400">
                <span>{{ module.items?.length || 0 }} bÃ i</span>
                <span v-if="module.unlockAt" class="flex items-center gap-1">
                  <BaseIcon name="clock" class="w-3 h-3" />
                  {{ formatDate(module.unlockAt) }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-400 font-mono">
              {{ getModuleCompletedCount(module) }}/{{ module.items?.length || 0 }}
            </span>
            <BaseIcon 
              :name="isModuleExpanded(module.id) ? 'chevron-up' : 'chevron-down'" 
              class="w-4 h-4 text-slate-400 transition-transform"
            />
          </div>
        </button>

        
        <div 
          v-show="isModuleExpanded(module.id) && !isModuleLocked(module)"
          class="module-items mt-2 ml-4 border-l border-white/10 pl-4 space-y-2 animate-slide-down"
        >
          <div 
            v-for="item in module.items" 
            :key="item.id"
            class="curriculum-item"
            :class="[
              'flex items-center gap-3 p-3 rounded-xl transition-colors',
              getItemStatusClass(item),
              currentItemId === item.id ? 'bg-indigo-500/10 border border-indigo-500/20' : 'hover:bg-white/5'
            ]"
            @click="onItemClick(item)"
          >
            
            <div class="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0" :class="getItemStatusBgClass(item)">
              <BaseIcon 
                v-if="isItemCompleted(item)" 
                name="check" 
                class="w-4 h-4 text-emerald-400" 
              />
              <BaseIcon 
                v-else-if="isItemLocked(item)" 
                name="lock" 
                class="w-4 h-4 text-slate-500" 
              />
              <BaseIcon 
                v-else-if="item.itemType === 'Lesson'" 
                name="book-open" 
                class="w-4 h-4 text-indigo-400" 
              />
              <BaseIcon 
                v-else-if="item.itemType === 'Quiz'" 
                name="help-circle" 
                class="w-4 h-4 text-purple-400" 
              />
              <BaseIcon 
                v-else-if="item.itemType === 'Codelab'" 
                name="code" 
                class="w-4 h-4 text-emerald-400" 
              />
            </div>

            
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h5 class="font-medium text-white truncate">{{ item.overrideTitle || item.lessonTitle || item.quizTitle || item.codelabTitle || 'Untitled' }}</h5>
                <span class="badge text-[10px]" :class="getTypeBadgeClass(item.itemType)">{{ item.itemType }}</span>
                <span v-if="item.isRequired" class="badge badge-rose text-[10px]">Báº¯t buá»™c</span>
                <span v-if="item.isHidden" class="badge badge-slate text-[10px]">áº¨n</span>
              </div>
              
              <div class="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                <span v-if="item.unlockAt" class="flex items-center gap-1">
                  <BaseIcon name="clock" class="w-3 h-3" />
                  {{ formatDate(item.unlockAt) }}
                </span>
                <span v-if="item.dueAt" class="flex items-center gap-1">
                  <BaseIcon name="calendar" class="w-3 h-3" />
                  {{ formatDate(item.dueAt) }}
                </span>
                <span v-if="item.maxAttempts" class="flex items-center gap-1">
                  <BaseIcon name="refresh-cw" class="w-3 h-3" />
                  {{ item.maxAttempts }} láº§n
                </span>
              </div>
            </div>

            
            <div class="flex items-center gap-2 shrink-0">
              <span v-if="isItemCompleted(item)" class="text-emerald-400 text-xs font-bold flex items-center gap-1">
                <BaseIcon name="check-circle" class="w-3 h-3" /> HoÃ n thÃ nh
              </span>
              <span v-else-if="isItemLocked(item)" class="text-slate-500 text-xs">ÄÃ£ khÃ³a</span>
              <span v-else class="text-indigo-400 text-xs font-medium">ChÆ°a lÃ m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';

interface Props {
  classroomId: string;
  curriculum: any;
  currentItemId: string | null;
}

interface Emits {
  (e: 'navigate', itemId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const expandedModuleIds = ref<Set<string>>(new Set());

const allItems = computed(() => {
  return props.curriculum?.modules?.flatMap((m: any) => m.items || []) || [];
});

const totalItems = computed(() => allItems.value.length);

const completedItems = computed(() => allItems.value.filter((i: any) => i.status === 'Completed').length);

const overallProgress = computed(() => {
  if (totalItems.value === 0) return 0;
  return Math.round((completedItems.value / totalItems.value) * 100);
});

const isModuleExpanded = (moduleId: string) => expandedModuleIds.value.has(moduleId);
const toggleModule = (moduleId: string) => {
  if (expandedModuleIds.value.has(moduleId)) {
    expandedModuleIds.value.delete(moduleId);
  } else {
    expandedModuleIds.value.add(moduleId);
  }
};

const getModuleIndex = (moduleId: string) => {
  return props.curriculum?.modules?.findIndex((m: any) => m.id === moduleId) ?? -1;
};

const getModuleCompletedCount = (module: any) => {
  if (!module.items) return 0;
  return module.items.filter((item: any) => item.status === 'Completed').length;
};

const isModuleCompleted = (module: any) => {
  const items = module.items?.filter((i: any) => i.isRequired && !i.isHidden) || [];
  if (items.length === 0) return false;
  return items.every((item: any) => item.status === 'Completed');
};

const isModuleLocked = (module: any) => {
  if (module.unlockAt && new Date(module.unlockAt) > new Date()) return true;
  
  const moduleIndex = getModuleIndex(module.id);
  if (moduleIndex > 0) {
    const prevModule = props.curriculum?.modules[moduleIndex - 1];
    if (prevModule && !isModuleCompleted(prevModule)) return true;
  }
  return false;
};

const getModuleStatusClass = (module: any) => {
  if (isModuleCompleted(module)) return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
  if (isModuleLocked(module)) return 'bg-slate-800 border-slate-700 text-slate-500';
  return 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400';
};

const isItemCompleted = (item: any) => item.status === 'Completed';
const isItemLocked = (item: any) => {
  if (item.isHidden) return true;
  if (item.unlockAt && new Date(item.unlockAt) > new Date()) return true;
  if (item.isSequential && item.prerequisiteItemId) {
    
    return false; 
  }
  return false;
};

const getItemStatusClass = (item: any) => {
  if (item.status === 'Completed') return 'item-completed';
  if (isItemLocked(item)) return 'item-locked';
  if (item.status === 'InProgress') return 'item-in-progress';
  return 'item-not-started';
};

const getItemStatusBgClass = (item: any) => {
  if (item.status === 'Completed') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (isItemLocked(item)) return 'bg-slate-800 text-slate-500 border-slate-700';
  if (item.status === 'InProgress') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-slate-800 text-slate-400 border-slate-700';
};

const getTypeBadgeClass = (type: string) => {
  switch (type) {
    case 'Lesson': return 'badge-indigo';
    case 'Quiz': return 'badge-purple';
    case 'Codelab': return 'badge-emerald';
    default: return 'badge-slate';
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', { 
    day: '2-digit', month: '2-digit', 
    hour: '2-digit', minute: '2-digit' 
  });
};

function onItemClick(item: any) {
  if (!isItemLocked(item)) {
    emit('navigate', item.id);
  }
}
</script>

<style scoped>
@import "./StudentCurriculumSidebar.css";
</style>
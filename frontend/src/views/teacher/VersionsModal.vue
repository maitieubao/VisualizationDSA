<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('update:show', false)">
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">
            <BaseIcon name="git-branch" class="w-5 h-5 inline mr-2" />
            Lá»‹ch sá»­ phiÃªn báº£n: {{ article?.title }}
          </h3>
          <button type="button" class="modal-close" @click="$emit('update:show', false)">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>
        
        <div class="modal-body versions-list">
          <div v-if="!article?.versions?.length" class="empty-versions">
            <BaseIcon name="git-branch" class="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p class="text-slate-400 text-center">ChÆ°a cÃ³ phiÃªn báº£n nÃ o</p>
            <p class="text-slate-500 text-sm text-center mt-1">CÃ¡c phiÃªn báº£n sáº½ xuáº¥t hiá»‡n khi báº¡n chá»‰nh sá»­a bÃ i viáº¿t</p>
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="(version, index) in article.versions" 
              :key="version.id"
              class="version-item p-4 rounded-xl border border-white/5 bg-slate-950/40 hover:border-indigo-500/20 transition-colors"
            >
              <div class="version-header flex items-center justify-between gap-4 mb-3 flex-wrap">
                <div class="flex items-center gap-3">
                  <span class="version-badge text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    v{{ getVersionNumber(article.versions, index) }}
                  </span>
                  <span class="version-date text-xs text-slate-500">
                    {{ formatDate(version.createdAt) }}
                  </span>
                  <span class="version-author text-xs text-slate-500">
                    bá»Ÿi {{ version.changedByName }}
                  </span>
                </div>
                
                <span v-if="version.changeSummary" class="version-summary text-xs text-slate-400 italic max-w-xs truncate">
                  {{ version.changeSummary }}
                </span>
              </div>
              
              <div class="version-preview">
                <div class="preview-content text-xs text-slate-400 line-clamp-3 font-mono bg-slate-950/50 p-3 rounded-lg border border-white/5">
                  {{ stripHtml(version.contentMd).substring(0, 200) }}...
                </div>
              </div>
              
              <div class="version-actions flex items-center justify-end gap-2 mt-3 pt-3 border-t border-white/5">
                <button 
                  type="button" 
                  class="btn-secondary text-xs px-3 py-1.5"
                  @click="$emit('restore', version)"
                >
                  <BaseIcon name="rotate-ccw" class="w-3 h-3 inline mr-1" />
                  KhÃ´i phá»¥c
                </button>
                <button 
                  type="button" 
                  class="btn-action-icon text-slate-400 hover:text-indigo-400 p-1.5"
                  @click="viewFullVersion(version)"
                  title="Xem Ä‘áº§y Ä‘á»§"
                >
                  <BaseIcon name="eye" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="$emit('update:show', false)">
            ÄÃ³ng
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';

interface Props {
  show: boolean;
  article: any;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'restore', version: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

function getVersionNumber(versions: any[], index: number | string): number {
  return versions.length - Number(index);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&/g, '&');
}

function viewFullVersion(version: any) {
  
  console.log('View full version:', version);
}
</script>

<style scoped>
@import "./VersionsModal.css";
</style>